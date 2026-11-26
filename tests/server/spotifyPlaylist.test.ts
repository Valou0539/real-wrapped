// @vitest-environment node
import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { createEvent, type H3Event } from "h3";
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

type Auth = Awaited<ReturnType<typeof importServices>>["auth"];

const REDIRECT = "http://127.0.0.1:3000/api/spotify/callback";
const BINDING = "0b7f9f5e-2f5c-4c4e-9a3b-6f1d2e3c4b5a";

/** Minimal browser: a cookie jar replayed on the requests it sends. */
const createBrowser = () => {
  const jar = new Map<string, string>();
  return {
    jar,
    event(url = "http://localhost:3000/api/spotify/playlists"): H3Event {
      const { host, pathname, search } = new URL(url);
      const req = new IncomingMessage(new Socket());
      req.method = "GET";
      req.url = pathname + search;
      req.headers = { host };
      if (jar.size) {
        req.headers.cookie = [...jar]
          .map(([name, value]) => `${name}=${value}`)
          .join("; ");
      }
      return createEvent(req, new ServerResponse(req));
    },
    absorb(event: H3Event) {
      const raw = event.node.res.getHeader("set-cookie");
      const cookies = Array.isArray(raw) ? raw : raw ? [String(raw)] : [];
      for (const cookie of cookies) {
        const [pair = ""] = cookie.split(";");
        const index = pair.indexOf("=");
        const name = pair.slice(0, index);
        const value = pair.slice(index + 1);
        if (value) jar.set(name, value);
        else jar.delete(name);
      }
    },
  };
};
type Browser = ReturnType<typeof createBrowser>;

const handoffOf = (sessionUrl: string) =>
  new URL(sessionUrl, "http://localhost:3000").searchParams.get("handoff");

const callbackEvent = (browser = createBrowser()) =>
  browser.event("http://127.0.0.1:3000/api/spotify/callback");

/** Full login round trip for one browser: authorize, callback, handoff. */
const login = async (
  auth: Auth,
  browser: Browser,
  returnUrl = "http://localhost:3000/",
  redirectUri = REDIRECT,
) => {
  browser.jar.set(auth.LOGIN_BINDING_COOKIE, BINDING);
  const { url, stateCookie } = auth.buildAuthorizeUrl(
    returnUrl,
    redirectUri,
    BINDING,
  );
  const state = new URL(url).searchParams.get("state") ?? "";
  const callback = browser.event(redirectUri);
  const next = await auth.exchangeCode(callback, "code-123", state, stateCookie);
  browser.absorb(callback);
  const handoff = handoffOf(next);
  if (!handoff) return { next, back: next };
  const event = browser.event();
  const back = await auth.redeemSessionHandoff(event, handoff, BINDING);
  browser.absorb(event);
  return { next, back };
};

const isAuthenticated = (auth: Auth, browser: Browser) =>
  auth.isUserAuthenticated(browser.event());

describe("spotify user auth", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("builds a scoped authorize url and logs the browser in through the handoff", async () => {
    fetchMock.mockImplementation(async (url: string) =>
      isToken(url) ? userToken() : {},
    );
    const { auth } = await importServices();

    const { url } = auth.buildAuthorizeUrl(
      "http://localhost:3000/artists/x",
      REDIRECT,
      BINDING,
    );
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe(
      "https://accounts.spotify.com/authorize",
    );
    expect(parsed.searchParams.get("client_id")).toBe("id");
    expect(parsed.searchParams.get("redirect_uri")).toBe(REDIRECT);
    expect(parsed.searchParams.get("scope")).toBe("playlist-modify-private");
    expect(parsed.searchParams.get("response_type")).toBe("code");

    const browser = createBrowser();
    expect(await isAuthenticated(auth, browser)).toBe(false);
    const { next: sessionUrl, back } = await login(
      auth,
      browser,
      "http://localhost:3000/artists/x",
    );
    // The handoff is redeemed on the origin the user browses.
    expect(sessionUrl).toMatch(
      /^http:\/\/localhost:3000\/api\/spotify\/session\?handoff=/,
    );
    expect(back).toBe("http://localhost:3000/artists/x");
    expect(await isAuthenticated(auth, browser)).toBe(true);
    // Tokens live sealed in the cookie, never in clear.
    const sealed = browser.jar.get("spotify_session") ?? "";
    expect(sealed).not.toBe("");
    expect(decodeURIComponent(sealed)).not.toContain("user-tok");
    expect(decodeURIComponent(sealed)).not.toContain("refresh-tok");
  });

  it("keeps each browser's Spotify session to itself", async () => {
    let issued = 0;
    fetchMock.mockImplementation(async (url: string) => {
      if (!isToken(url)) return {};
      issued += 1;
      return { ...userToken(), access_token: `user-tok-${issued}` };
    });
    const { auth } = await importServices();
    const alice = createBrowser();
    const mallory = createBrowser();

    await login(auth, alice);
    // Another visitor without cookie sees no session and gets a 401.
    expect(await isAuthenticated(auth, mallory)).toBe(false);
    await expect(
      auth.getUserAccessToken(mallory.event()),
    ).rejects.toMatchObject({ statusCode: 401 });

    // Her own login does not replace Alice's session.
    await login(auth, mallory);
    expect(await auth.getUserAccessToken(alice.event())).toBe("user-tok-1");
    expect(await auth.getUserAccessToken(mallory.event())).toBe("user-tok-2");
  });

  it("rejects a forged session cookie", async () => {
    const { auth } = await importServices();
    const browser = createBrowser();
    browser.jar.set("spotify_session", "Fe26.2**forged");
    expect(await isAuthenticated(auth, browser)).toBe(false);
  });

  it("only redeems a handoff once, before expiry, with the login's binding cookie", async () => {
    fetchMock.mockImplementation(async (url: string) =>
      isToken(url) ? userToken() : {},
    );
    const { auth } = await importServices();
    const issue = async () => {
      const { url, stateCookie } = auth.buildAuthorizeUrl(
        "http://localhost:3000/",
        REDIRECT,
        BINDING,
      );
      const state = new URL(url).searchParams.get("state") ?? "";
      return handoffOf(await auth.exchangeCode(callbackEvent(), "c", state, stateCookie));
    };

    // Handoff link opened in another browser (no or other binding cookie).
    const handoff = await issue();
    const other = createBrowser();
    await expect(
      auth.redeemSessionHandoff(other.event(), handoff, undefined),
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      auth.redeemSessionHandoff(
        other.event(),
        handoff,
        "11111111-2222-4333-8444-555555555555",
      ),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(await isAuthenticated(auth, other)).toBe(false);

    const browser = createBrowser();
    const event = browser.event();
    await auth.redeemSessionHandoff(event, handoff, BINDING);
    browser.absorb(event);
    expect(await isAuthenticated(auth, browser)).toBe(true);
    // Single use.
    await expect(
      auth.redeemSessionHandoff(createBrowser().event(), handoff, BINDING),
    ).rejects.toMatchObject({ statusCode: 400 });

    const late = await issue();
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 61_000);
    try {
      await expect(
        auth.redeemSessionHandoff(createBrowser().event(), late, BINDING),
      ).rejects.toMatchObject({ statusCode: 400 });
    } finally {
      vi.useRealTimers();
    }
  });

  it("rejects a state that is not bound to the browser's cookie", async () => {
    fetchMock.mockImplementation(async (url: string) =>
      isToken(url) ? userToken() : {},
    );
    const { auth } = await importServices();
    const victim = auth.buildAuthorizeUrl(
      "http://localhost:3000/",
      REDIRECT,
      BINDING,
    );
    const attacker = auth.buildAuthorizeUrl(
      "http://localhost:3000/",
      REDIRECT,
      BINDING,
    );
    const attackerState =
      new URL(attacker.url).searchParams.get("state") ?? "";
    const victimState = new URL(victim.url).searchParams.get("state") ?? "";

    // Callback opened from another browser (no cookie) or with someone
    // else's state (login CSRF).
    await expect(
      auth.exchangeCode(callbackEvent(), "code-123", attackerState, undefined),
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      auth.exchangeCode(callbackEvent(), "code-123", attackerState, victim.stateCookie),
    ).rejects.toMatchObject({ statusCode: 400 });
    // Tampered cookie.
    const [payload, signature] = victim.stateCookie.split(".");
    const forged = Buffer.from(
      JSON.stringify({
        ...JSON.parse(Buffer.from(payload!, "base64url").toString()),
        returnUrl: "http://10.0.0.1/",
      }),
    ).toString("base64url");
    await expect(
      auth.exchangeCode(callbackEvent(), "code-123", victimState, `${forged}.${signature}`),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps a pending login valid whatever the number of other logins", async () => {
    fetchMock.mockImplementation(async (url: string) =>
      isToken(url) ? userToken() : {},
    );
    const { auth } = await importServices();
    const victim = auth.buildAuthorizeUrl(
      "http://localhost:3000/x",
      REDIRECT,
      BINDING,
    );
    for (let i = 0; i < 30; i++) {
      auth.buildAuthorizeUrl("http://localhost:3000/", REDIRECT, BINDING);
    }
    const state = new URL(victim.url).searchParams.get("state") ?? "";
    expect(
      await auth.exchangeCode(callbackEvent(), "code-123", state, victim.stateCookie),
    ).toMatch(/^http:\/\/localhost:3000\/api\/spotify\/session\?handoff=/);
  });

  it("rejects an expired login state", async () => {
    const { auth } = await importServices();
    const { url, stateCookie } = auth.buildAuthorizeUrl(
      "http://localhost:3000/",
      REDIRECT,
      BINDING,
    );
    const state = new URL(url).searchParams.get("state") ?? "";
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + auth.LOGIN_STATE_MAX_AGE * 1000 + 1);
    try {
      await expect(
        auth.exchangeCode(callbackEvent(), "code-123", state, stateCookie),
      ).rejects.toMatchObject({ statusCode: 400 });
    } finally {
      vi.useRealTimers();
    }
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
    const { url, stateCookie } = auth.buildAuthorizeUrl(
      "http://localhost:3000/",
      dynamic,
      BINDING,
    );
    const state = new URL(url).searchParams.get("state") ?? "";
    await auth.exchangeCode(callbackEvent(), "code-123", state, stateCookie);
    const body = fetchMock.mock.calls.find(([u]) => isToken(u))?.[1]?.body;
    expect(body).toContain(`redirect_uri=${encodeURIComponent(dynamic)}`);
  });

  it("rejects untrusted return urls", async () => {
    fetchMock.mockImplementation(async (u: string) =>
      isToken(u) ? userToken() : {},
    );
    const { auth } = await importServices();
    const browser = createBrowser();
    const { next } = await login(auth, browser, "https://evil.example.com/x");
    expect(next).toBe("/");
    expect(await isAuthenticated(auth, browser)).toBe(true);
  });

  it("logs in on the callback origin when the user is not on its loopback twin", async () => {
    fetchMock.mockImplementation(async (u: string) =>
      isToken(u) ? userToken() : {},
    );
    const { auth } = await importServices();
    // Callback overridden to another host: no handoff, the session is set
    // by the callback itself and the user stays on that origin.
    const browser = createBrowser();
    const { next } = await login(
      auth,
      browser,
      "/",
      "https://wrapped.example.com/api/spotify/callback",
    );
    expect(next).toBe("/");
    expect(await isAuthenticated(auth, browser)).toBe(true);
    // A private-network return URL never receives a handoff link.
    const other = createBrowser();
    const lan = await login(auth, other, "http://192.168.1.5:3000/x");
    expect(lan.next).toBe("/x");
    expect(await isAuthenticated(auth, other)).toBe(true);
  });

  it("refreshes an expired access token into the browser's session", async () => {
    fetchMock.mockImplementation(async (url: string) =>
      isToken(url) ? userToken() : {},
    );
    const { auth } = await importServices();
    const browser = createBrowser();
    await login(auth, browser);

    fetchMock.mockClear();
    expect(await auth.getUserAccessToken(browser.event())).toBe("user-tok");
    expect(fetchMock).not.toHaveBeenCalled();

    fetchMock.mockImplementation(async () => ({
      access_token: "fresh-tok",
      expires_in: 3600,
    }));
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 3600 * 1000);
    try {
      const event = browser.event();
      expect(await auth.getUserAccessToken(event)).toBe("fresh-tok");
      browser.absorb(event);
      const body = String(fetchMock.mock.calls[0]?.[1]?.body);
      expect(body).toContain("grant_type=refresh_token");
      expect(body).toContain("refresh_token=refresh-tok");
      fetchMock.mockClear();
      expect(await auth.getUserAccessToken(browser.event())).toBe("fresh-tok");
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
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
    const browser = createBrowser();
    await login(auth, browser);

    const result = await playlist.createPlaylistWithTracks(
      browser.event(),
      "Ma top",
      "",
      [
      {
        artistName: "Artist A",
        trackName: "Song A",
        spotifyTrackId: "a".repeat(22),
      },
      { artistName: "Artist B", trackName: "Song B" },
      { artistName: "Unknown", trackName: "Nothing" },
      ],
    );

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

  it("requires the calling browser's own session", async () => {
    fetchMock.mockImplementation(async (url: string) =>
      isToken(url) ? userToken() : {},
    );
    const { auth, playlist } = await setupAuth();
    // Someone else is logged in: an anonymous caller still gets a 401.
    await login(auth, createBrowser());
    fetchMock.mockClear();
    await expect(
      playlist.createPlaylistWithTracks(createBrowser().event(), "X", "", [
        { artistName: "A", trackName: "B" },
      ]),
    ).rejects.toMatchObject({ statusCode: 401 });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
