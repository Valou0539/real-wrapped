import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createSpotifyCatalog,
  SpotifyCatalogError,
} from "../../server/services/spotify/catalog.service";

const fetchMock = vi.hoisted(() => vi.fn());
mockNuxtImport("$fetch", () => fetchMock);
const ALBUM = "https://open.spotify.com/album/" + "a".repeat(22);
const IMAGE = "https://i.scdn.co/image/abc";

const options = { clientId: " id ", clientSecret: " secret ", market: "fr" };
const token = (expires_in = 3600, access_token = "tok") => ({
  access_token,
  expires_in,
});
const item = (name: string, artist: string, extra = {}) => ({
  name,
  artists: [{ name: artist }],
  album: {
    images: [{ url: IMAGE }],
    external_urls: { spotify: ALBUM },
    ...extra,
  },
});
const search = (...items: unknown[]) => ({ tracks: { items } });
const httpError = (
  status: number,
  headers: Record<string, string> = {},
  data?: unknown,
) =>
  Object.assign(new Error("secret request details"), {
    response: { status, headers: new Headers(headers) },
    data,
  });

const isToken = (url: string) => url.includes("accounts.spotify.com");
const tokenCalls = () => fetchMock.mock.calls.filter(([url]) => isToken(url));

beforeEach(() => {
  fetchMock.mockReset();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("createSpotifyCatalog", () => {
  it("sends credentials and a strict query, ignoring fuzzy results", async () => {
    fetchMock
      .mockResolvedValueOnce(token())
      .mockResolvedValueOnce(
        search(
          item("Song (Live)", "Artist"),
          item("Song", "Other"),
          item(" SONG ", "artist"),
        ),
      );

    const cover = await createSpotifyCatalog(options).findCover(
      "Artist",
      "Song",
    );

    expect(cover).toEqual({ imageUrl: IMAGE, albumUrl: ALBUM });
    const [tokenUrl, tokenInit] = fetchMock.mock.calls[0];
    expect(tokenUrl).toBe("https://accounts.spotify.com/api/token");
    expect(tokenInit.headers.Authorization).toBe(
      `Basic ${Buffer.from("id:secret").toString("base64")}`,
    );
    expect(tokenInit.body).toBe("grant_type=client_credentials");
    expect(tokenInit.retry).toBe(0);
    const [searchUrl, searchInit] = fetchMock.mock.calls[1];
    expect(searchUrl).toBe("https://api.spotify.com/v1/search");
    expect(searchInit.query).toEqual({
      q: 'track:"Song" artist:"Artist"',
      type: "track",
      market: "FR",
      limit: 10,
    });
    expect(searchInit.headers.Authorization).toBe("Bearer tok");
    expect(searchInit.retry).toBe(0);
  });

  it("returns null without a strict match or with unsafe media", async () => {
    fetchMock
      .mockResolvedValueOnce(token())
      .mockResolvedValueOnce(search(item("Song", "Other")))
      .mockResolvedValueOnce(
        search(
          item("Song", "Artist", {
            images: [{ url: "https://evil.example/x.jpg" }],
          }),
        ),
      )
      .mockResolvedValueOnce(
        search(
          item("Song", "Artist", {
            external_urls: { spotify: "https://evil.example/a" },
          }),
        ),
      )
      .mockResolvedValueOnce({});
    const catalog = createSpotifyCatalog(options);
    for (let i = 0; i < 4; i++) {
      expect(await catalog.findCover("Artist", "Song")).toBeNull();
    }
  });

  it("fails with 503 when not configured", async () => {
    for (const bad of [
      { ...options, clientId: " " },
      { ...options, market: "FRA" },
    ]) {
      await expect(
        createSpotifyCatalog(bad).findCover("A", "B"),
      ).rejects.toMatchObject({ statusCode: 503 });
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reuses the token and renews it proactively", async () => {
    fetchMock.mockImplementation(async (url: string) =>
      isToken(url) ? token(100, "tok") : search(),
    );
    const catalog = createSpotifyCatalog(options);
    await catalog.findCover("A", "B");
    await catalog.findCover("C", "D");
    expect(tokenCalls()).toHaveLength(1);

    vi.advanceTimersByTime(91_000);
    await catalog.findCover("E", "F");
    expect(tokenCalls()).toHaveLength(2);
  });

  it("caches covers and shares concurrent lookups for the same track", async () => {
    fetchMock.mockImplementation(async (url: string) =>
      isToken(url) ? token() : search(item("B", "A")),
    );
    const catalog = createSpotifyCatalog(options);

    const [first, second] = await Promise.all([
      catalog.findCover("A", "B"),
      catalog.findCover("A", "B"),
    ]);
    expect(first).toEqual(second);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await catalog.findCover("A", "B");
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await catalog.findCover("A", "C");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("shares one token request between concurrent calls", async () => {
    fetchMock.mockImplementation(async (url: string) =>
      isToken(url) ? token() : search(),
    );
    const catalog = createSpotifyCatalog(options);
    await Promise.all([
      catalog.findCover("A", "B"),
      catalog.findCover("C", "D"),
    ]);
    expect(tokenCalls()).toHaveLength(1);
  });

  it("renews the token once on 401 and gives up on a second 401", async () => {
    fetchMock
      .mockResolvedValueOnce(token(3600, "old"))
      .mockRejectedValueOnce(httpError(401))
      .mockResolvedValueOnce(token(3600, "new"))
      .mockResolvedValueOnce(search(item("Song", "Artist")));
    expect(
      await createSpotifyCatalog(options).findCover("Artist", "Song"),
    ).not.toBeNull();
    expect(fetchMock.mock.calls[3][1].headers.Authorization).toBe("Bearer new");

    fetchMock.mockReset();
    fetchMock
      .mockResolvedValueOnce(token())
      .mockRejectedValueOnce(httpError(401))
      .mockResolvedValueOnce(token())
      .mockRejectedValueOnce(httpError(401));
    const catalog = createSpotifyCatalog(options);
    await expect(catalog.findCover("A", "B")).rejects.toMatchObject({
      statusCode: 502,
    });
    expect(fetchMock).toHaveBeenCalledTimes(4);

    fetchMock
      .mockResolvedValueOnce(token(3600, "fresh"))
      .mockResolvedValueOnce(search());
    expect(await catalog.findCover("A", "B")).toBeNull();
    expect(tokenCalls()).toHaveLength(3);
  });

  it("sanitizes 403, 5xx, network and invalid token errors", async () => {
    const cases: [() => void, number][] = [
      [
        () =>
          fetchMock
            .mockResolvedValueOnce(token())
            .mockRejectedValueOnce(httpError(403)),
        502,
      ],
      [
        () =>
          fetchMock
            .mockResolvedValueOnce(token())
            .mockRejectedValueOnce(httpError(500)),
        503,
      ],
      [
        () =>
          fetchMock
            .mockResolvedValueOnce(token())
            .mockRejectedValueOnce(new Error("ECONNRESET")),
        503,
      ],
      [
        () =>
          fetchMock.mockResolvedValueOnce({ access_token: "", expires_in: 10 }),
        502,
      ],
      [
        () =>
          fetchMock.mockResolvedValueOnce({ access_token: "x", expires_in: 0 }),
        502,
      ],
      [() => fetchMock.mockRejectedValueOnce(httpError(400)), 502],
      [() => fetchMock.mockRejectedValueOnce(httpError(404)), 502],
    ];
    for (const [setup, status] of cases) {
      fetchMock.mockReset();
      setup();
      const error = await createSpotifyCatalog(options)
        .findCover("A", "B")
        .catch((e) => e);
      expect(error).toBeInstanceOf(SpotifyCatalogError);
      expect(error.statusCode).toBe(status);
      expect(error.message).not.toMatch(/secret|ECONNRESET/);
    }
  });

  it("treats a search 404 as no cover", async () => {
    fetchMock
      .mockResolvedValueOnce(token())
      .mockRejectedValueOnce(httpError(404));
    expect(await createSpotifyCatalog(options).findCover("A", "B")).toBeNull();
  });

  it("honors Retry-After before retrying", async () => {
    fetchMock
      .mockResolvedValueOnce(token())
      .mockRejectedValueOnce(httpError(429, { "retry-after": "1" }))
      .mockResolvedValueOnce(search(item("Song", "Artist")));
    const promise = createSpotifyCatalog(options).findCover("Artist", "Song");
    await vi.advanceTimersByTimeAsync(999);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1);
    expect(await promise).not.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("returns a bounded 429 and shares the cooldown without calling upstream", async () => {
    fetchMock
      .mockResolvedValueOnce(token())
      .mockRejectedValueOnce(httpError(429, { "retry-after": "30" }));
    const catalog = createSpotifyCatalog(options);
    await expect(catalog.findCover("A", "B")).rejects.toMatchObject({
      statusCode: 429,
      retryAfter: 30,
    });
    await expect(catalog.findArtistGenres("C")).rejects.toMatchObject({
      statusCode: 429,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(30_000);
    fetchMock.mockResolvedValueOnce(search());
    expect(await catalog.findCover("C", "D")).toBeNull();
  });

  it("returns distinct genres from the single exact artist match", async () => {
    const ARTIST = "https://open.spotify.com/artist/" + "b".repeat(22);
    const artist = (name: string, extra = {}) => ({
      name,
      external_urls: { spotify: ARTIST },
      genres: [" french house ", "filter house", "french house", " ", 3],
      ...extra,
    });
    const artists = (...items: unknown[]) => ({ artists: { items } });
    fetchMock
      .mockResolvedValueOnce(token())
      .mockResolvedValueOnce(
        artists(artist("Daft Punk Tribute"), artist(" daft  PUNK "), null),
      );
    const catalog = createSpotifyCatalog(options);

    expect(await catalog.findArtistGenres("Daft Punk")).toEqual({
      artistUrl: ARTIST,
      genres: ["french house", "filter house"],
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1].query).toEqual({
      q: 'artist:"Daft Punk"',
      type: "artist",
      market: "FR",
      limit: 5,
    });

    const unusable = [
      (name: string) => artists(artist(name, { genres: undefined })),
      (name: string) => artists(artist(name, { genres: [] })),
      (name: string) => artists(artist(name), artist(name.toLowerCase())),
      (name: string) =>
        artists(
          artist(name, {
            external_urls: { spotify: "https://evil.example/artist/x" },
          }),
        ),
      () => artists(artist("Someone Else")),
      () => ({}),
    ];
    for (const [index, build] of unusable.entries()) {
      const name = `Daft Punk ${index}`;
      fetchMock.mockResolvedValueOnce(build(name));
      expect(await catalog.findArtistGenres(name)).toBeNull();
    }
  });

  it("returns the full credited artist list for a strict track match", async () => {
    const multiArtist = (name: string, artists: string[]) => ({
      name,
      artists: artists.map((artist) => ({ name: artist })),
      album: {
        images: [{ url: IMAGE }],
        external_urls: { spotify: ALBUM },
      },
    });
    fetchMock.mockResolvedValueOnce(token()).mockResolvedValueOnce(
      search(
        // Fuzzy candidates first: they must be skipped.
        item("All I Need", "Air"),
        multiArtist("All I Need (feat. Beth Hirsch)", ["Someone Else"]),
        // First strict match wins, with trimmed and deduped names.
        multiArtist(" all i need (feat. beth hirsch) ", [
          " Air ",
          "Air",
          "Beth Hirsch",
          "  ",
        ]),
        multiArtist("All I Need (feat. Beth Hirsch)", ["Air", "Ignored"]),
      ),
    );
    const catalog = createSpotifyCatalog(options);

    expect(
      await catalog.findTrackArtists("Air", "All I Need (feat. Beth Hirsch)"),
    ).toEqual(["Air", "Beth Hirsch"]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1].query).toEqual({
      q: 'track:"All I Need (feat. Beth Hirsch)" artist:"Air"',
      type: "track",
      market: "FR",
      limit: 10,
    });
  });

  it("returns null artists for fuzzy-only matches or missing artist overlap", async () => {
    fetchMock
      .mockResolvedValueOnce(token())
      // Track name does not exactly match.
      .mockResolvedValueOnce(search(item("Song (Live)", "Artist")))
      // None of the credited artists is the export artist.
      .mockResolvedValueOnce(
        search({
          name: "Song",
          artists: [{ name: "Other" }, { name: "Another" }],
        }),
      )
      // Empty search response.
      .mockResolvedValueOnce({});
    const catalog = createSpotifyCatalog(options);

    expect(await catalog.findTrackArtists("Artist", "Song")).toBeNull();
    expect(await catalog.findTrackArtists("Artist", "Song")).toBeNull();
    expect(await catalog.findTrackArtists("Artist", "Song")).toBeNull();
  });

  it("caches track artists and shares concurrent lookups", async () => {
    fetchMock.mockImplementation(async (url: string) =>
      isToken(url)
        ? token()
        : search({
            name: "Song",
            artists: [{ name: "Artist" }, { name: "Guest" }],
          }),
    );
    const catalog = createSpotifyCatalog(options);

    const [first, second] = await Promise.all([
      catalog.findTrackArtists("Artist", "Song"),
      catalog.findTrackArtists("Artist", "Song"),
    ]);
    expect(first).toEqual(["Artist", "Guest"]);
    expect(second).toEqual(first);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Repeat lookups are served from the cache, even with different casing.
    expect(await catalog.findTrackArtists(" artist ", "SONG")).toEqual([
      "Artist",
      "Guest",
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await catalog.findTrackArtists("Artist", "Other Song");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("keeps the longer cooldown when 429 responses overlap", async () => {
    const rejectSearch: Array<(error: Error) => void> = [];
    fetchMock
      .mockResolvedValueOnce(token())
      .mockImplementation(
        () => new Promise((_, reject) => rejectSearch.push(reject)),
      );
    const catalog = createSpotifyCatalog(options);
    const first = catalog.findCover("A", "B").catch((e) => e);
    const second = catalog.findCover("C", "D").catch((e) => e);
    await vi.advanceTimersByTimeAsync(0);
    expect(rejectSearch).toHaveLength(2);

    rejectSearch[0]!(httpError(429, { "retry-after": "30" }));
    expect(await first).toMatchObject({ statusCode: 429, retryAfter: 30 });
    rejectSearch[1]!(httpError(429, { "retry-after": "1" }));
    expect(await second).toMatchObject({ statusCode: 429, retryAfter: 30 });

    await vi.advanceTimersByTimeAsync(1_000);
    await expect(catalog.findCover("E", "F")).rejects.toMatchObject({
      statusCode: 429,
      retryAfter: 29,
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("stops after two inline retries", async () => {
    fetchMock.mockResolvedValueOnce(token()).mockRejectedValue(httpError(429));
    const promise = createSpotifyCatalog(options)
      .findCover("A", "B")
      .catch((e) => e);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(await promise).toMatchObject({ statusCode: 429 });
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("applies a minimum cooldown on quota exhaustion without retrying", async () => {
    fetchMock
      .mockResolvedValueOnce(token())
      .mockRejectedValueOnce(
        httpError(429, {}, { error: { reason: "QUOTA_EXCEEDED" } }),
      );
    await expect(
      createSpotifyCatalog(options).findCover("A", "B"),
    ).rejects.toMatchObject({ statusCode: 429, retryAfter: 60 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("matches track titles despite punctuation differences", async () => {
    fetchMock.mockResolvedValueOnce(token()).mockResolvedValueOnce(
      search({
        name: "Guns for Hire - from the series Arcane League of Legends",
        artists: [
          { name: "Woodkid" },
          { name: "Arcane" },
          { name: "League of Legends" },
        ],
      }),
    );
    const catalog = createSpotifyCatalog(options);

    expect(
      await catalog.findTrackArtists(
        "Woodkid",
        "Guns for Hire (from the series Arcane League of Legends)",
      ),
    ).toEqual(["Woodkid", "Arcane", "League of Legends"]);
  });

  it("matches feat-tagged export titles against untagged canonical titles", async () => {
    fetchMock.mockResolvedValueOnce(token()).mockResolvedValueOnce(
      search({
        name: "Duet",
        artists: [{ name: "Artist" }, { name: "Guest" }],
      }),
    );
    const catalog = createSpotifyCatalog(options);

    expect(
      await catalog.findTrackArtists("Artist", "Duet (feat. Guest)"),
    ).toEqual(["Artist", "Guest"]);
  });

  it("does not match a plain export title against a live or acoustic variant", async () => {
    fetchMock
      .mockResolvedValueOnce(token())
      .mockResolvedValueOnce(
        search({ name: "Song (Acoustic)", artists: [{ name: "Artist" }] }),
      );
    const catalog = createSpotifyCatalog(options);

    expect(await catalog.findTrackArtists("Artist", "Song")).toBeNull();
  });

  it("patient mode waits out long cooldowns instead of failing fast", async () => {
    fetchMock
      .mockResolvedValueOnce(token())
      .mockRejectedValueOnce(httpError(429, { "retry-after": "20" }))
      .mockResolvedValueOnce(
        search({
          name: "Song",
          artists: [{ name: "Artist" }, { name: "Guest" }],
        }),
      );
    const catalog = createSpotifyCatalog(options);

    const promise = catalog.findTrackArtists("Artist", "Song", {
      patient: true,
    });
    await vi.advanceTimersByTimeAsync(19_999);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1);
    expect(await promise).toEqual(["Artist", "Guest"]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("patient mode retries transient server errors", async () => {
    fetchMock
      .mockResolvedValueOnce(token())
      .mockRejectedValueOnce(httpError(503))
      .mockRejectedValueOnce(httpError(504))
      .mockResolvedValueOnce(
        search({
          name: "Song",
          artists: [{ name: "Artist" }, { name: "Guest" }],
        }),
      );
    const catalog = createSpotifyCatalog(options);

    const promise = catalog.findTrackArtists("Artist", "Song", {
      patient: true,
    });
    await vi.advanceTimersByTimeAsync(2_000);
    expect(await promise).toEqual(["Artist", "Guest"]);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("non-patient lookups still fail fast on transient server errors", async () => {
    fetchMock
      .mockResolvedValueOnce(token())
      .mockRejectedValueOnce(httpError(503));
    await expect(
      createSpotifyCatalog(options).findTrackArtists("Artist", "Song"),
    ).rejects.toMatchObject({ statusCode: 503 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
