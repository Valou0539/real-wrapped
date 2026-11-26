// @vitest-environment node
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.hoisted(() => vi.fn());
mockNuxtImport("$fetch", () => fetchMock);

const runtimeConfig = vi.hoisted(() => ({
  values: {
    spotifyClientId: "id",
    spotifyClientSecret: "secret",
    spotifyMarket: "FR",
    spotifyRedirectUri: "http://127.0.0.1:3000/api/spotify/callback",
  },
}));
mockNuxtImport("useRuntimeConfig", () => () => runtimeConfig.values);

const isToken = (url: string) => url.includes("accounts.spotify.com");
const clientToken = () => ({ access_token: "client-tok", expires_in: 3600 });
const userToken = () => ({
  access_token: "user-tok",
  refresh_token: "refresh-tok",
  expires_in: 3600,
});

const TRACK_ID = "t".repeat(22);
const PLAYLIST_URL = "https://open.spotify.com/playlist/" + "p".repeat(22);
const PLAYLIST_ID = "p".repeat(22);

const trackSearchItem = (name: string, artists: string[]) => ({
  id: TRACK_ID,
  name,
  artists: artists.map((artist) => ({ name: artist })),
});

const importServices = async () => {
  vi.resetModules();
  const auth = await import("../../server/services/spotify/user-auth.service");
  const playlist =
    await import("../../server/services/spotify/playlist.service");
  return { auth, playlist };
};

const login = async (
  auth: Awaited<ReturnType<typeof importServices>>["auth"],
) => {
  const authorizeUrl = auth.buildAuthorizeUrl("http://localhost:3000/", "http://127.0.0.1:3000/api/spotify/callback");
  const state = new URL(authorizeUrl).searchParams.get("state") ?? "";
  return auth.exchangeCode("code-123", state);
};

describe("spotify user auth", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("builds a scoped authorize url and exchanges the code once per state", async () => {
    fetchMock.mockImplementation(async (url: string) =>
      isToken(url) ? userToken() : {},
    );
    const { auth } = await importServices();

    const url = auth.buildAuthorizeUrl("http://localhost:3000/artists/x", "http://127.0.0.1:3000/api/spotify/callback");
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe(
      "https://accounts.spotify.com/authorize",
    );
    expect(parsed.searchParams.get("client_id")).toBe("id");
    expect(parsed.searchParams.get("redirect_uri")).toBe(
      "http://127.0.0.1:3000/api/spotify/callback",
    );
    expect(parsed.searchParams.get("scope")).toBe("playlist-modify-private");
    expect(parsed.searchParams.get("response_type")).toBe("code");

    expect(auth.isUserAuthenticated()).toBe(false);
    const state = parsed.searchParams.get("state") ?? "";
    const returnUrl = await auth.exchangeCode("code-123", state);
    expect(returnUrl).toBe("http://localhost:3000/artists/x");
    expect(auth.isUserAuthenticated()).toBe(true);

    // A state is single-use.
    await expect(auth.exchangeCode("code-123", state)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("derives the redirect uri from the origin unless overridden", async () => {
    const { auth } = await importServices();
    runtimeConfig.values.spotifyRedirectUri = "";
    // Spotify forbids localhost: loopback origins normalize to the IP
    // literal, keeping the browsed protocol (dev servers may be TLS-only)
    // and port.
    expect(auth.resolveRedirectUri("https://localhost:3000")).toBe(
      "https://127.0.0.1:3000/api/spotify/callback",
    );
    expect(auth.resolveRedirectUri("http://127.0.0.1:3000")).toBe(
      "http://127.0.0.1:3000/api/spotify/callback",
    );
    // Non-loopback origins are used as-is.
    expect(auth.resolveRedirectUri("https://wrapped.example.com")).toBe(
      "https://wrapped.example.com/api/spotify/callback",
    );
    runtimeConfig.values.spotifyRedirectUri = "https://fixed.example/cb";
    expect(auth.resolveRedirectUri("https://localhost:3000")).toBe(
      "https://fixed.example/cb",
    );
    runtimeConfig.values.spotifyRedirectUri = "";
  });

  it("exchanges the code against the exact redirect uri used at authorize time", async () => {
    fetchMock.mockImplementation(async (url: string) =>
      isToken(url) ? userToken() : {},
    );
    const { auth } = await importServices();
    const dynamic = "https://localhost:3000/api/spotify/callback";
    const url = auth.buildAuthorizeUrl("http://localhost:3000/", dynamic);
    const state = new URL(url).searchParams.get("state") ?? "";
    await auth.exchangeCode("code-123", state);
    const body = fetchMock.mock.calls.find(([u]) => isToken(u))?.[1]?.body;
    expect(body).toContain(
      `redirect_uri=${encodeURIComponent(dynamic)}`,
    );
  });

  it("rejects untrusted return urls", async () => {
    const { auth } = await importServices();
    const url = auth.buildAuthorizeUrl("https://evil.example.com/x", "http://127.0.0.1:3000/api/spotify/callback");
    const state = new URL(url).searchParams.get("state") ?? "";
    fetchMock.mockImplementation(async (u: string) =>
      isToken(u) ? userToken() : {},
    );
    expect(await auth.exchangeCode("c", state)).toBe("/");
  });

  it("refreshes an expired access token", async () => {
    fetchMock.mockImplementation(async (url: string) =>
      isToken(url) ? userToken() : {},
    );
    const { auth } = await importServices();
    await login(auth);

    // Force expiry, then the next access triggers a refresh.
    fetchMock.mockClear();
    const first = await auth.getUserAccessToken();
    expect(first).toBe("user-tok");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("createPlaylistWithTracks", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  const setupAuth = async () => {
    const { auth, playlist } = await importServices();
    return { auth, playlist };
  };

  it("creates a private playlist and adds tracks in order, resolving missing ids", async () => {
    const calls: { url: string; method?: string; body?: unknown }[] = [];
    fetchMock.mockImplementation(
      async (
        url: string,
        init?: { method?: string; body?: unknown; query?: { q?: string } },
      ) => {
        if (isToken(url)) {
          return url.includes("accounts") &&
            init?.body?.toString().includes("authorization_code")
            ? userToken()
            : clientToken();
        }
        calls.push({ url, method: init?.method, body: init?.body });
        if (url.includes("api.spotify.com/v1/search")) {
          return {
            tracks: { items: [trackSearchItem("Song B", ["Artist B"])] },
          };
        }
        if (url.includes("/me/playlists")) {
          return { external_urls: { spotify: PLAYLIST_URL } };
        }
        return { snapshot_id: "snap" };
      },
    );

    const { auth, playlist } = await setupAuth();
    await login(auth);

    const result = await playlist.createPlaylistWithTracks("Ma top", "", [
      {
        artistName: "Artist A",
        trackName: "Song A",
        spotifyTrackId: "a".repeat(22),
      },
      { artistName: "Artist B", trackName: "Song B" },
      { artistName: "Unknown", trackName: "Nothing" },
    ]);

    // hmm — Unknown/Nothing also resolves via the mock; verify order + uris
    expect(result.playlistUrl).toBe(PLAYLIST_URL);
    const creation = calls.find((c) => c.url.includes("/me/playlists"));
    expect(creation?.method).toBe("POST");
    expect(creation?.body).toMatchObject({ name: "Ma top", public: false });

    const addition = calls.find((c) =>
      c.url.includes(`/playlists/${PLAYLIST_ID}/items`),
    );
    expect(addition?.method).toBe("POST");
    const uris = (addition?.body as { uris: string[] }).uris;
    // Saved id used directly, resolved id for the searched track.
    expect(uris[0]).toBe(`spotify:track:${"a".repeat(22)}`);
    expect(uris[1]).toBe(`spotify:track:${TRACK_ID}`);
  });

  it("requires authentication", async () => {
    const { playlist } = await setupAuth();
    await expect(
      playlist.createPlaylistWithTracks("X", "", [
        { artistName: "A", trackName: "B" },
      ]),
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});
