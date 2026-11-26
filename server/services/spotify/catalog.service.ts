import type {
  SpotifyArtistGenres,
  SpotifyCover,
} from "../../../shared/types/spotify";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const SEARCH_URL = "https://api.spotify.com/v1/search";
const TRACKS_URL = "https://api.spotify.com/v1/tracks";
const REQUEST_TIMEOUT = 4000;
const MAX_RETRIES = 2;
const MAX_INLINE_WAIT = 2000;
const PATIENT_MAX_RETRIES = 6;
const PATIENT_MAX_WAIT = 30_000;
const QUOTA_COOLDOWN = 60_000;
const ALBUM_URL_PATTERN =
  /^https:\/\/open\.spotify\.com\/album\/[A-Za-z0-9]{22}$/;
const ARTIST_URL_PATTERN =
  /^https:\/\/open\.spotify\.com\/artist\/[A-Za-z0-9]{22}$/;
const TRACK_ID_PATTERN = /^[A-Za-z0-9]{22}$/;
const MARKET_PATTERN = /^[A-Z]{2}$/;

export interface SpotifyCatalogOptions {
  clientId: string;
  clientSecret: string;
  market: string;
}

export class SpotifyCatalogError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly retryAfter?: number,
  ) {
    super(message);
  }
}

class RejectedTokenError extends SpotifyCatalogError {
  constructor() {
    super(502, "Spotify catalog authentication failed");
  }
}

interface SpotifyTokenResponse {
  access_token?: string;
  expires_in?: number;
}

interface SpotifyTrack {
  id?: string;
  name?: string;
  artists?: { name?: string }[];
  album?: {
    images?: { url?: string }[];
    external_urls?: { spotify?: string };
  };
}

interface SpotifyArtist {
  name?: string;
  external_urls?: { spotify?: string };
  genres?: string[];
}

interface SpotifySearchResponse {
  tracks?: { items?: (SpotifyTrack | null)[] };
  artists?: { items?: (SpotifyArtist | null)[] };
}

interface UpstreamError {
  statusCode?: number;
  response?: { status?: number; headers?: Headers };
  data?: { error?: { reason?: string } };
  _data?: { error?: { reason?: string } };
}

const normalize = (name: string) =>
  name.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
const searchTerm = (name: string) => name.replace(/["\\]/g, " ").trim();

// Punctuation differs between the export titles and Spotify's canonical ones
// ("(from the series…)" vs "- from the series…"): compare alphanumerics only.
const trackKey = (name: string) =>
  normalize(name).replace(/[^\p{L}\p{N}]+/gu, "");

// Loose fallback for export titles tagged "(feat. X)" whose canonical Spotify
// title drops the tag entirely: strip bracketed segments from the EXPORT side
// and compare against the candidate's full key. Deliberately asymmetric so a
// plain export title never matches a "(Live)"/"(Acoustic)" variant.
const strippedExportKey = (name: string) =>
  trackKey(name.replace(/\s*[\(\[][^\)\]]*[\)\]]/g, " "));

const parseRetryAfter = (value: string | null | undefined): number => {
  if (!value) return 0;
  const seconds = Number(value);
  const ms = Number.isFinite(seconds)
    ? seconds * 1000
    : new Date(value).getTime() - Date.now();
  return Number.isFinite(ms) ? Math.max(0, ms) : 0;
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const publicImageUrl = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    const trustedHost =
      url.hostname === "i.scdn.co" || url.hostname.endsWith(".spotifycdn.com");
    return url.protocol === "https:" &&
      trustedHost &&
      !url.username &&
      !url.password
      ? value
      : undefined;
  } catch {
    return undefined;
  }
};

export const createSpotifyCatalog = ({
  clientId,
  clientSecret,
  market,
}: SpotifyCatalogOptions) => {
  const id = clientId.trim();
  const secret = clientSecret.trim();
  const countryCode = market.trim().toUpperCase();
  const configured = !!id && !!secret && MARKET_PATTERN.test(countryCode);

  let token: { value: string; expiresAt: number } | undefined;
  let pendingToken: Promise<string> | undefined;
  let cooldownUntil = 0;

  const HIT_TTL = 24 * 60 * 60 * 1000;
  const MISS_TTL = 10 * 60 * 1000;
  const CACHE_LIMIT = 2000;
  const cache = new Map<string, { value: unknown; expiresAt: number }>();
  const pendingResults = new Map<string, Promise<unknown>>();

  const MAX_CONCURRENT_SEARCHES = 4;
  let inFlightSearches = 0;
  const searchQueue: Array<() => void> = [];

  const acquireSearchSlot = async (): Promise<() => void> => {
    while (inFlightSearches >= MAX_CONCURRENT_SEARCHES) {
      await new Promise<void>((resolve) => {
        searchQueue.push(resolve);
      });
    }
    inFlightSearches++;

    let released = false;
    return () => {
      if (released) return;
      released = true;
      inFlightSearches--;
      searchQueue.shift()?.();
    };
  };

  const cached = <T>(
    key: string,
    fetcher: () => Promise<T | null>,
  ): Promise<T | null> => {
    const hit = cache.get(key);
    if (hit && hit.expiresAt > Date.now()) {
      return Promise.resolve(hit.value as T | null);
    }

    const pending = pendingResults.get(key);
    if (pending) return pending as Promise<T | null>;

    const result = fetcher()
      .then((value) => {
        if (cache.size >= CACHE_LIMIT) cache.clear();
        cache.set(key, {
          value,
          expiresAt: Date.now() + (value ? HIT_TTL : MISS_TTL),
        });
        return value;
      })
      .finally(() => {
        pendingResults.delete(key);
      });

    pendingResults.set(key, result);
    return result;
  };

  const tooManyRequests = (waitMs: number) =>
    new SpotifyCatalogError(
      429,
      "Spotify catalog is rate limited",
      Math.max(1, Math.ceil(waitMs / 1000)),
    );

  // Patient mode is for bulk import jobs: instead of failing fast like the
  // user-facing cover lookups, it waits out rate-limit cooldowns and retries
  // transient server/network errors, at the cost of much slower responses.
  const send = async <T>(
    request: () => Promise<T>,
    isSearch: boolean,
    patient = false,
    badRequestIsNotFound = false,
  ): Promise<T> => {
    const maxAttempts = patient ? PATIENT_MAX_RETRIES : MAX_RETRIES;
    const maxWait = patient ? PATIENT_MAX_WAIT : MAX_INLINE_WAIT;
    for (let attempt = 0; ; attempt++) {
      const preWait = cooldownUntil - Date.now();
      if (preWait > 0) {
        if (preWait > maxWait || attempt >= maxAttempts) {
          throw tooManyRequests(preWait);
        }
        await sleep(preWait);
      }

      try {
        return await request();
      } catch (rawError) {
        const error = rawError as UpstreamError;
        const status = error.response?.status ?? error.statusCode;

        if (status === 429) {
          const retryAfterMs = parseRetryAfter(
            error.response?.headers?.get("retry-after"),
          );
          const reason = (error.data ?? error._data)?.error?.reason;
          const quotaExceeded = reason === "QUOTA_EXCEEDED";
          const now = Date.now();
          const wait = Math.max(
            500 * 2 ** attempt,
            retryAfterMs,
            quotaExceeded ? QUOTA_COOLDOWN : 0,
          );
          cooldownUntil = Math.max(cooldownUntil, now + wait);
          const remaining = cooldownUntil - now;
          if (quotaExceeded || attempt >= maxAttempts || remaining > maxWait) {
            throw tooManyRequests(remaining);
          }
          await sleep(remaining);
          continue;
        }
        if (!status || status >= 500) {
          // Spotify regularly answers searches with transient 503/504 under
          // concurrency: retry them in patient mode instead of dropping the
          // artist/track from the enrichment.
          if (patient && attempt < maxAttempts) {
            await sleep(Math.min(500 * 2 ** attempt, 4000));
            continue;
          }
          throw new SpotifyCatalogError(
            503,
            "Spotify catalog temporarily unavailable",
          );
        }
        if (status === 401 && isSearch) throw new RejectedTokenError();
        if (status === 401 || (status === 400 && !isSearch)) {
          throw new SpotifyCatalogError(
            502,
            "Spotify catalog authentication failed",
          );
        }
        if (status === 403) {
          throw new SpotifyCatalogError(502, "Spotify catalog access denied");
        }
        // Spotify answers unknown or malformed track ids with a 400 (not a
        // 404): for direct id lookups that means "gone from the catalog",
        // which callers treat as a miss and fall back to searching.
        if ((status === 404 || (status === 400 && badRequestIsNotFound)) && isSearch)
          throw new SpotifyCatalogError(404, "Not found");
        throw new SpotifyCatalogError(502, "Spotify catalog request failed");
      }
    }
  };

  const requestToken = async (): Promise<string> => {
    const response = await send(
      () =>
        $fetch<SpotifyTokenResponse>(TOKEN_URL, {
          method: "POST",
          retry: 0,
          timeout: REQUEST_TIMEOUT,
          headers: {
            Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "client_credentials",
          }).toString(),
        }),
      false,
    );
    const accessToken = response?.access_token;
    const expiresIn = response?.expires_in;
    if (
      typeof accessToken !== "string" ||
      !accessToken.trim() ||
      typeof expiresIn !== "number" ||
      !Number.isFinite(expiresIn) ||
      expiresIn <= 0
    ) {
      throw new SpotifyCatalogError(
        502,
        "Spotify catalog authentication failed",
      );
    }
    token = {
      value: accessToken,
      expiresAt:
        Date.now() + expiresIn * 1000 - Math.min(30_000, expiresIn * 100),
    };
    return accessToken;
  };

  const getToken = (): Promise<string> => {
    if (token && token.expiresAt > Date.now()) {
      return Promise.resolve(token.value);
    }
    pendingToken ??= requestToken().finally(() => {
      pendingToken = undefined;
    });
    return pendingToken;
  };

  const pickTrackMatch = (
    items: (SpotifyTrack | null)[],
    artistName: string,
    trackName: string,
  ): SpotifyTrack | null => {
    const wantedArtist = normalize(artistName);
    const candidates = items.filter(
      (item): item is SpotifyTrack =>
        !!item?.name &&
        !!item.artists?.some(
          (artist) => !!artist?.name && normalize(artist.name) === wantedArtist,
        ),
    );
    const wantedKey = trackKey(trackName);
    const exact = candidates.find((item) => trackKey(item.name!) === wantedKey);
    if (exact) return exact;
    const looseKey = strippedExportKey(trackName);
    if (!looseKey || looseKey === wantedKey) return null;
    return candidates.find((item) => trackKey(item.name!) === looseKey) ?? null;
  };

  const coverFromTrack = (item: SpotifyTrack): SpotifyCover | null => {
    const albumUrl = item.album?.external_urls?.spotify;
    if (!albumUrl || !ALBUM_URL_PATTERN.test(albumUrl)) return null;
    const imageUrl = item.album?.images
      ?.map((image) => publicImageUrl(image?.url))
      .find((url) => !!url);
    return imageUrl ? { imageUrl, albumUrl } : null;
  };

  const pickCover = (
    items: (SpotifyTrack | null)[],
    artistName: string,
    trackName: string,
  ): SpotifyCover | null => {
    const item = pickTrackMatch(items, artistName, trackName);
    return item ? coverFromTrack(item) : null;
  };

  const pickTrackArtists = (
    items: (SpotifyTrack | null)[],
    artistName: string,
    trackName: string,
  ): string[] | null => {
    const item = pickTrackMatch(items, artistName, trackName);
    if (!item) return null;
    const names = [
      ...new Set(
        (item.artists ?? [])
          .map((artist) => artist?.name?.trim())
          .filter((name): name is string => !!name),
      ),
    ];
    return names.length ? names : null;
  };

  const searchCatalog = async (
    q: string,
    type: "track" | "artist",
    limit: number,
    patient = false,
  ): Promise<SpotifySearchResponse | null> => {
    if (!configured) {
      throw new SpotifyCatalogError(503, "Spotify catalog is not configured");
    }

    for (let renewed = false; ;) {
      const accessToken = await getToken();
      const releaseSlot = await acquireSearchSlot();
      try {
        return await send(
          () =>
            $fetch<SpotifySearchResponse>(SEARCH_URL, {
              retry: 0,
              timeout: REQUEST_TIMEOUT,
              headers: { Authorization: `Bearer ${accessToken}` },
              query: { q, type, market: countryCode, limit },
            }),
          true,
          patient,
        );
      } catch (error) {
        if (error instanceof RejectedTokenError) {
          if (token?.value === accessToken) token = undefined;
          if (!renewed) {
            renewed = true;
            continue;
          }
        }
        if (error instanceof SpotifyCatalogError && error.statusCode === 404) {
          return null;
        }
        throw error;
      } finally {
        releaseSlot();
      }
    }
  };

  // Direct track lookup by Spotify id: exact by construction, cheaper and
  // immune to the search-matching pitfalls (renamed titles, punctuation).
  // Shares the search slot limiter so bulk cover loads never stampede Spotify.
  const getTrackById = async (trackId: string): Promise<SpotifyTrack | null> => {
    if (!configured) {
      throw new SpotifyCatalogError(503, "Spotify catalog is not configured");
    }

    for (let renewed = false; ;) {
      const accessToken = await getToken();
      const releaseSlot = await acquireSearchSlot();
      try {
        return await send(
          () =>
            $fetch<SpotifyTrack>(`${TRACKS_URL}/${trackId}`, {
              retry: 0,
              timeout: REQUEST_TIMEOUT,
              headers: { Authorization: `Bearer ${accessToken}` },
              query: { market: countryCode },
            }),
          true,
          false,
          true,
        );
      } catch (error) {
        if (error instanceof RejectedTokenError) {
          if (token?.value === accessToken) token = undefined;
          if (!renewed) {
            renewed = true;
            continue;
          }
        }
        if (error instanceof SpotifyCatalogError && error.statusCode === 404) {
          return null;
        }
        throw error;
      } finally {
        releaseSlot();
      }
    }
  };

  const findCoverById = async (
    trackId: string,
  ): Promise<SpotifyCover | null> => {
    if (!TRACK_ID_PATTERN.test(trackId)) return null;
    return cached(`cover-id:${trackId}`, async () => {
      const track = await getTrackById(trackId);
      return track ? coverFromTrack(track) : null;
    });
  };

  const findCover = async (
    artistName: string,
    trackName: string,
  ): Promise<SpotifyCover | null> => {
    const artistTerm = searchTerm(artistName);
    const trackTerm = searchTerm(trackName);
    if (!artistTerm || !trackTerm) return null;
    return cached(
      `cover:${normalize(artistName)}|${normalize(trackName)}`,
      async () => {
        const response = await searchCatalog(
          `track:"${trackTerm}" artist:"${artistTerm}"`,
          "track",
          10,
        );
        return pickCover(response?.tracks?.items ?? [], artistName, trackName);
      },
    );
  };

  const findArtistGenres = async (
    artistName: string,
    { patient = false }: { patient?: boolean } = {},
  ): Promise<SpotifyArtistGenres | null> => {
    const term = searchTerm(artistName);
    if (!term) return null;
    return cached(`genres:${normalize(artistName)}`, async () => {
      const response = await searchCatalog(
        `artist:"${term}"`,
        "artist",
        5,
        patient,
      );
      const wanted = normalize(artistName);
      const matches = (response?.artists?.items ?? []).filter(
        (artist): artist is SpotifyArtist =>
          typeof artist?.name === "string" && normalize(artist.name) === wanted,
      );
      if (matches.length !== 1) return null;
      const artist = matches[0];
      const artistUrl = artist?.external_urls?.spotify;
      if (
        !artistUrl ||
        !ARTIST_URL_PATTERN.test(artistUrl) ||
        !Array.isArray(artist?.genres)
      ) {
        return null;
      }
      const genres = [
        ...new Set(
          artist.genres
            .filter((genre) => typeof genre === "string")
            .map((genre) => genre.trim())
            .filter(Boolean),
        ),
      ];
      return genres.length ? { artistUrl, genres } : null;
    });
  };

  const resolveTrack = async (
    artistName: string,
    trackName: string,
    patient: boolean,
  ): Promise<{ id: string; artists: string[] } | null> => {
    const artistTerm = searchTerm(artistName);
    const trackTerm = searchTerm(trackName);
    if (!artistTerm || !trackTerm) return null;
    return cached(
      `track:${normalize(artistName)}|${normalize(trackName)}`,
      async () => {
        const response = await searchCatalog(
          `track:"${trackTerm}" artist:"${artistTerm}"`,
          "track",
          10,
          patient,
        );
        const item = pickTrackMatch(
          response?.tracks?.items ?? [],
          artistName,
          trackName,
        );
        if (!item?.id || !TRACK_ID_PATTERN.test(item.id)) return null;
        const artists = [
          ...new Set(
            (item.artists ?? [])
              .map((artist) => artist?.name?.trim())
              .filter((name): name is string => !!name),
          ),
        ];
        return artists.length ? { id: item.id, artists } : null;
      },
    );
  };

  const findTrack = async (
    artistName: string,
    trackName: string,
    { patient = false }: { patient?: boolean } = {},
  ): Promise<{ id: string; artists: string[] } | null> => {
    return resolveTrack(artistName, trackName, patient);
  };

  const findTrackArtists = async (
    artistName: string,
    trackName: string,
    { patient = false }: { patient?: boolean } = {},
  ): Promise<string[] | null> => {
    return (
      (await resolveTrack(artistName, trackName, patient))?.artists ?? null
    );
  };

  const findTrackId = async (
    artistName: string,
    trackName: string,
    { patient = false }: { patient?: boolean } = {},
  ): Promise<string | null> => {
    return (await resolveTrack(artistName, trackName, patient))?.id ?? null;
  };

  return {
    findCover,
    findCoverById,
    findArtistGenres,
    findTrack,
    findTrackArtists,
    findTrackId,
  };
};
