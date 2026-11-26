import {
  createHash,
  createHmac,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import {
  getCookie,
  getRequestProtocol,
  useSession,
  type H3Event,
  type SessionConfig,
} from "h3";
import { SpotifyCatalogError } from "./catalog.service";

/**
 * User-context Spotify auth (Authorization Code flow with client secret: the
 * app has a backend). Each browser holds its own token set, sealed
 * (encrypted + authenticated) in an httpOnly session cookie: nothing is
 * shared between visitors and the server keeps no token in memory.
 * Only the playlist-modify-private scope is requested: created playlists are
 * private, nothing broader is needed.
 */

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const AUTHORIZE_URL = "https://accounts.spotify.com/authorize";
const SCOPES = "playlist-modify-private";
const REQUEST_TIMEOUT = 8000;

interface UserTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface LoginState {
  state: string;
  returnUrl: string;
  redirectUri: string;
  binding: string;
  expiresAt: number;
}

interface SessionHandoff {
  tokens: UserTokens;
  binding: string;
  returnUrl: string;
  expiresAt: number;
}

/**
 * The pending login lives in a signed httpOnly cookie on the browser that
 * started it (no server-side list): the callback only accepts a state that
 * matches the cookie sent by that same browser.
 */
export const LOGIN_STATE_COOKIE = "spotify_login_state";
export const LOGIN_STATE_MAX_AGE = 600;

/**
 * In loopback dev the callback lands on 127.0.0.1 while the user may browse
 * localhost: the tokens then reach the browsing origin through a single-use,
 * short-lived handoff redeemed at SESSION_PATH, which only succeeds with the
 * binding cookie set on that origin when the login started.
 */
export const LOGIN_BINDING_COOKIE = "spotify_login_binding";
export const SESSION_PATH = "/api/spotify/session";
const SESSION_COOKIE = "spotify_session";
const SESSION_COOKIE_PATH = "/api/spotify";
const SESSION_MAX_AGE = 30 * 24 * 3600;
const HANDOFF_TTL = 60_000;
const BINDING_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const handoffs = new Map<string, SessionHandoff>();

export const isLoginBinding = (value: unknown): value is string =>
  typeof value === "string" && BINDING_PATTERN.test(value);

export const createLoginBinding = (): string => randomUUID();

const config = () => {
  const runtime = useRuntimeConfig();
  return {
    clientId: runtime.spotifyClientId?.trim(),
    clientSecret: runtime.spotifyClientSecret?.trim(),
    redirectUri: runtime.spotifyRedirectUri?.trim(),
  };
};

export const isSpotifyUserAuthConfigured = (): boolean => {
  const { clientId, clientSecret } = config();
  return !!clientId && !!clientSecret;
};

/**
 * The redirect URI is derived from the origin the user actually browses
 * (localhost vs 127.0.0.1, http vs https, any port): whatever Spotify sends
 * back lands on the same server, and the dashboard entry just has to match
 * that exact origin + path once. NUXT_SPOTIFY_REDIRECT_URI overrides the
 * derivation when set.
 */
export const resolveRedirectUri = (origin: string): string => {
  const override = config().redirectUri;
  if (override) return override;
  // Spotify forbids "localhost" in redirect URIs even over HTTPS: loopback
  // must be the IP literal. The original protocol is kept — dev servers may
  // be TLS-only, and a plain-HTTP hop against them never connects. The hop
  // lands on the same server either way and the return URL sends the user
  // back to their real origin afterwards.
  try {
    const url = new URL(origin);
    const loopback = ["localhost", "127.0.0.1", "[::1]", "::1"].includes(
      url.hostname,
    );
    if (loopback) {
      const port = url.port ? `:${url.port}` : "";
      return `${url.protocol}//127.0.0.1${port}/api/spotify/callback`;
    }
  } catch {
    // Unparseable origin: fall through to the raw concatenation.
  }
  return `${origin}/api/spotify/callback`;
};

/**
 * The return URL comes from the browser (the page the user was on). Spotify
 * redirect URIs must be loopback or HTTPS, so the callback may land on
 * 127.0.0.1 while the user browses localhost — preserving the full origin
 * here is what sends them back to the right one. Only loopback and private
 * network origins are allowed, anything else falls back to a relative path.
 */
const sanitizeReturnUrl = (value: unknown): string => {
  if (typeof value !== "string" || !value) return "/";
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "/";
    const host = url.hostname;
    const trusted =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host);
    if (!trusted) return "/";
    return url.toString();
  } catch {
    return "/";
  }
};

const signLoginState = (payload: string): string =>
  createHmac("sha256", `spotify-login-state:${config().clientSecret ?? ""}`)
    .update(payload)
    .digest("base64url");

const encodeLoginState = (login: LoginState): string => {
  const payload = Buffer.from(JSON.stringify(login)).toString("base64url");
  return `${payload}.${signLoginState(payload)}`;
};

const decodeLoginState = (cookie: unknown): LoginState | undefined => {
  if (typeof cookie !== "string") return undefined;
  const [payload, signature, ...rest] = cookie.split(".");
  if (!payload || !signature || rest.length) return undefined;
  const expected = Buffer.from(signLoginState(payload));
  const received = Buffer.from(signature);
  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    return undefined;
  }
  try {
    const login = JSON.parse(
      Buffer.from(payload, "base64url").toString(),
    ) as Partial<LoginState>;
    if (
      typeof login.state !== "string" ||
      typeof login.returnUrl !== "string" ||
      typeof login.redirectUri !== "string" ||
      typeof login.binding !== "string" ||
      typeof login.expiresAt !== "number"
    ) {
      return undefined;
    }
    return login as LoginState;
  } catch {
    return undefined;
  }
};

const sameSecret = (a: string, b: string): boolean => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

const boundLoginState = (
  stateCookie: unknown,
  state: string,
): LoginState | undefined => {
  const login = decodeLoginState(stateCookie);
  if (!login || login.expiresAt <= Date.now()) return undefined;
  return sameSecret(login.state, state) ? login : undefined;
};

/** Whether the browser's state cookie is the one issued for this state. */
export const isLoginStateFor = (stateCookie: unknown, state: string): boolean =>
  !!boundLoginState(stateCookie, state);

/**
 * Returns the Spotify authorize URL and the signed cookie value binding its
 * state to the browser starting the login. `binding` is the value of the
 * binding cookie set on the origin the user browses.
 */
export const buildAuthorizeUrl = (
  returnUrl: unknown,
  redirectUri: string,
  binding: string,
): { url: string; stateCookie: string } => {
  const { clientId } = config();
  if (!isSpotifyUserAuthConfigured() || !clientId || !redirectUri) {
    throw new SpotifyCatalogError(503, "Spotify user auth is not configured");
  }

  const state = randomUUID();
  const stateCookie = encodeLoginState({
    state,
    returnUrl: sanitizeReturnUrl(returnUrl),
    redirectUri,
    binding,
    expiresAt: Date.now() + LOGIN_STATE_MAX_AGE * 1000,
  });

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: SCOPES,
    state,
  });
  return { url: `${AUTHORIZE_URL}?${params.toString()}`, stateCookie };
};

const tokenRequest = async (body: URLSearchParams) => {
  const { clientId, clientSecret } = config();
  const response = await $fetch<{
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  }>(TOKEN_URL, {
    method: "POST",
    retry: 0,
    timeout: REQUEST_TIMEOUT,
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  }).catch(() => {
    throw new SpotifyCatalogError(502, "Spotify token request failed");
  });

  if (!response.access_token || !response.expires_in) {
    throw new SpotifyCatalogError(502, "Spotify token response is invalid");
  }
  return response as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
};

const sessionConfig = (event: H3Event): SessionConfig => ({
  name: SESSION_COOKIE,
  password: createHash("sha256")
    .update(`spotify-session:${config().clientSecret ?? ""}`)
    .digest("hex"),
  maxAge: SESSION_MAX_AGE,
  sessionHeader: false,
  cookie: {
    httpOnly: true,
    sameSite: "strict",
    secure: getRequestProtocol(event) === "https",
    path: SESSION_COOKIE_PATH,
  },
});

const readTokens = async (event: H3Event): Promise<UserTokens | undefined> => {
  if (!getCookie(event, SESSION_COOKIE)) return undefined;
  const session = await useSession<Partial<UserTokens>>(
    event,
    sessionConfig(event),
  );
  const { accessToken, refreshToken, expiresAt } = session.data;
  if (
    typeof accessToken !== "string" ||
    typeof refreshToken !== "string" ||
    typeof expiresAt !== "number"
  ) {
    return undefined;
  }
  return { accessToken, refreshToken, expiresAt };
};

const writeTokens = async (event: H3Event, tokens: UserTokens) => {
  const session = await useSession<Partial<UserTokens>>(
    event,
    sessionConfig(event),
  );
  await session.update({ ...tokens });
};

const pruneHandoffs = () => {
  const now = Date.now();
  for (const [id, handoff] of handoffs) {
    if (handoff.expiresAt <= now) handoffs.delete(id);
  }
};

const isLoopback = (url: URL) =>
  ["localhost", "127.0.0.1", "[::1]", "::1"].includes(url.hostname);

/**
 * A handoff URL carries a bearer id: it is only sent to the loopback twin of
 * a loopback callback (localhost vs 127.0.0.1, same scheme and port — the
 * same server), never to another host.
 */
const isHandoffTarget = (target: URL, callback: URL) =>
  isLoopback(target) &&
  isLoopback(callback) &&
  target.protocol === callback.protocol &&
  target.port === callback.port;

const saveTokens = async (event: H3Event, tokens: UserTokens) => {
  const previous = await readTokens(event);
  await writeTokens(event, {
    ...tokens,
    // Spotify may omit refresh_token on re-consent: keep this browser's one.
    refreshToken: tokens.refreshToken || previous?.refreshToken || "",
  });
};

/**
 * Validates the login state against the browser's signed state cookie and
 * exchanges the code. The tokens are stored in this browser's session, or
 * parked in a single-use handoff when the user browses the loopback twin of
 * the callback origin. Returns the URL to send the user to.
 */
export const exchangeCode = async (
  event: H3Event,
  code: string,
  state: string,
  stateCookie: unknown,
): Promise<string> => {
  const login = boundLoginState(stateCookie, state);
  if (!login) {
    throw new SpotifyCatalogError(400, "Unknown or expired login state");
  }
  const { returnUrl, redirectUri, binding } = login;

  const response = await tokenRequest(
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  );
  const tokens: UserTokens = {
    accessToken: response.access_token,
    refreshToken: response.refresh_token ?? "",
    expiresAt: Date.now() + response.expires_in * 1000 - 30_000,
  };

  const callback = new URL(redirectUri);
  const target = new URL(returnUrl, callback);
  if (target.origin !== callback.origin && isHandoffTarget(target, callback)) {
    pruneHandoffs();
    const id = randomUUID();
    handoffs.set(id, {
      tokens,
      binding,
      returnUrl,
      expiresAt: Date.now() + HANDOFF_TTL,
    });
    const query = new URLSearchParams({ handoff: id }).toString();
    return `${target.origin}${SESSION_PATH}?${query}`;
  }

  // The session cookie lives on the callback origin: stay there.
  await saveTokens(event, tokens);
  return `${target.pathname}${target.search}${target.hash}`;
};

/**
 * Stores the handed-off tokens in this browser's session, provided it holds
 * the binding cookie of the login. Returns the URL to send the user back to.
 */
export const redeemSessionHandoff = async (
  event: H3Event,
  handoffId: unknown,
  bindingCookie: unknown,
): Promise<string> => {
  pruneHandoffs();
  const handoff =
    typeof handoffId === "string" ? handoffs.get(handoffId) : undefined;
  if (
    !handoff ||
    !isLoginBinding(bindingCookie) ||
    !sameSecret(handoff.binding, bindingCookie)
  ) {
    throw new SpotifyCatalogError(400, "Unknown or expired login handoff");
  }
  handoffs.delete(handoffId as string);

  await saveTokens(event, handoff.tokens);
  return handoff.returnUrl;
};

export const isUserAuthenticated = async (event: H3Event): Promise<boolean> => {
  const tokens = await readTokens(event);
  return !!tokens?.accessToken && !!tokens.refreshToken;
};

export const logoutUser = async (event: H3Event): Promise<void> => {
  if (!getCookie(event, SESSION_COOKIE)) return;
  const session = await useSession(event, sessionConfig(event));
  await session.clear();
};

export const getUserAccessToken = async (event: H3Event): Promise<string> => {
  const tokens = await readTokens(event);
  if (!tokens?.accessToken) {
    throw new SpotifyCatalogError(401, "Spotify user is not authenticated");
  }
  if (tokens.expiresAt > Date.now()) return tokens.accessToken;
  if (!tokens.refreshToken) {
    await logoutUser(event);
    throw new SpotifyCatalogError(401, "Spotify user session expired");
  }

  const response = await tokenRequest(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokens.refreshToken,
    }),
  ).catch(async (error) => {
    // A failed refresh invalidates the session: re-login is required.
    await logoutUser(event);
    throw error;
  });
  const refreshed = {
    accessToken: response.access_token,
    refreshToken: response.refresh_token ?? tokens.refreshToken,
    expiresAt: Date.now() + response.expires_in * 1000 - 30_000,
  };
  await writeTokens(event, refreshed);
  return refreshed.accessToken;
};
