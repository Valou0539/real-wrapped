import type { H3Event } from "h3";
import { SpotifyCatalogError } from "./catalog.service";
import { getSharedSpotifyCatalog } from "./catalog-instance";
import { getUserAccessToken } from "./user-auth.service";

/**
 * Playlist creation against the user-context Spotify API. Track ids are
 * resolved with the shared catalog (patient mode: creation is a bulk job,
 * not a user-facing lookup), reusing the 24h cache — ids already resolved at
 * import time arrive in the payload and skip the search entirely.
 */

const API_URL = "https://api.spotify.com/v1";
const REQUEST_TIMEOUT = 8000;
const BATCH_SIZE = 100;
const MAX_TRACKS = 200;
const PLAYLIST_URL_PATTERN =
  /^https:\/\/open\.spotify\.com\/playlist\/[A-Za-z0-9]{22}$/;

const getCatalog = () => getSharedSpotifyCatalog();

export interface PlaylistTrackInput {
  artistName: string;
  trackName: string;
  spotifyTrackId?: string;
}

export interface PlaylistResult {
  playlistUrl: string;
  added: number;
  unresolved: { artistName: string; trackName: string }[];
}

const authedFetch = async <T>(
  event: H3Event,
  path: string,
  options: Record<string, unknown> = {},
): Promise<T> => {
  for (let attempt = 0; attempt < 3; attempt++) {
    const accessToken = await getUserAccessToken(event);
    try {
      return await $fetch<T>(`${API_URL}${path}`, {
        retry: 0,
        timeout: REQUEST_TIMEOUT,
        headers: { Authorization: `Bearer ${accessToken}` },
        ...options,
      });
    } catch (rawError) {
      const error = rawError as {
        response?: { status?: number; headers?: Headers };
      };
      const status = error.response?.status;
      if (status === 429 && attempt < 2) {
        const retryAfter = Number(
          error.response?.headers?.get("retry-after") ?? 1,
        );
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            Math.min(
              Number.isFinite(retryAfter) ? retryAfter * 1000 : 1000,
              15_000,
            ),
          ),
        );
        continue;
      }
      if (status === 401) {
        throw new SpotifyCatalogError(401, "Spotify user session expired");
      }
      if (status === 403) {
        throw new SpotifyCatalogError(
          403,
          "Spotify playlist access denied — log in again",
        );
      }
      if ((!status || status >= 500) && attempt < 2) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.min(500 * 2 ** attempt, 4000)),
        );
        continue;
      }
      throw new SpotifyCatalogError(502, "Spotify playlist request failed");
    }
  }
  throw new SpotifyCatalogError(502, "Spotify playlist request failed");
};

export const createPlaylistWithTracks = async (
  event: H3Event,
  name: string,
  description: string,
  tracks: PlaylistTrackInput[],
): Promise<PlaylistResult> => {
  const trimmed = tracks.slice(0, MAX_TRACKS);
  if (!trimmed.length) {
    throw new SpotifyCatalogError(400, "No tracks to add");
  }

  // Fail fast before any resolution work when the session is missing/expired.
  await getUserAccessToken(event);

  // Resolve missing Spotify ids, in input order, through the shared catalog
  // (24h cache + patient retry + concurrency cap already in place there).
  const uris: string[] = [];
  const unresolved: PlaylistResult["unresolved"] = [];
  const resolutions = await Promise.all(
    trimmed.map(async (track) => {
      if (track.spotifyTrackId) return track.spotifyTrackId;
      try {
        return await getCatalog().findTrackId(
          track.artistName,
          track.trackName,
          { patient: true },
        );
      } catch {
        return null;
      }
    }),
  );
  resolutions.forEach((id, index) => {
    if (id) {
      uris.push(`spotify:track:${id}`);
    } else {
      const track = trimmed[index];
      if (track) {
        unresolved.push({
          artistName: track.artistName,
          trackName: track.trackName,
        });
      }
    }
  });

  if (!uris.length) {
    throw new SpotifyCatalogError(404, "No track could be resolved on Spotify");
  }

  const playlist = await authedFetch<{
    external_urls?: { spotify?: string };
  }>(event, "/me/playlists", {
    method: "POST",
    body: { name, description, public: false },
  });
  const playlistUrl = playlist?.external_urls?.spotify;
  if (!playlistUrl || !PLAYLIST_URL_PATTERN.test(playlistUrl)) {
    throw new SpotifyCatalogError(502, "Spotify playlist response is invalid");
  }
  const playlistId = playlistUrl.split("/").pop();

  // Order is significant: sequential batches so the playlist matches the
  // ranking. 100 items per request max (API limit).
  for (let offset = 0; offset < uris.length; offset += BATCH_SIZE) {
    await authedFetch(event, `/playlists/${playlistId}/items`, {
      method: "POST",
      body: { uris: uris.slice(offset, offset + BATCH_SIZE) },
    });
  }

  return { playlistUrl, added: uris.length, unresolved };
};
