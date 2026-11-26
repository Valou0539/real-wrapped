import { SpotifyCatalogError } from "./catalog.service";

/**
 * User-context Spotify auth (Authorization Code flow with client secret: the
 * app has a backend). Single-user personal app — one token set held in memory
 * server-side; restarting the server simply requires logging in again.
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

let tokens: UserTokens | undefined;
let pendingLogins: { state: string; returnUrl: string; redirectUri: string }[] = [];

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

export const buildAuthorizeUrl = (
  returnUrl: unknown,
  redirectUri: string,
): string => {
  const { clientId } = config();
  if (!isSpotifyUserAuthConfigured() || !clientId || !redirectUri) {
    throw new SpotifyCatalogError(503, "Spotify user auth is not configured");
  }

  const state = crypto.randomUUID();
  pendingLogins.push({
    state,
    returnUrl: sanitizeReturnUrl(returnUrl),
    redirectUri,
  });
  // Only a handful of concurrent logins ever happen; drop stale states.
  if (pendingLogins.length > 20) pendingLogins = pendingLogins.slice(-20);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: SCOPES,
    state,
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
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

/**
 * Validates the login state, exchanges the code and stores the session.
 * Returns the URL to send the user back to.
 */
export const exchangeCode = async (
  code: string,
  state: string,
): Promise<string> => {
  const index = pendingLogins.findIndex((entry) => entry.state === state);
  if (index === -1) {
    throw new SpotifyCatalogError(400, "Unknown or expired login state");
  }
  const [{ returnUrl, redirectUri }] = pendingLogins.splice(index, 1);

  const response = await tokenRequest(
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  );
  tokens = {
    accessToken: response.access_token,
    // Spotify may omit refresh_token on re-consent: keep the previous one.
    refreshToken: response.refresh_token ?? tokens?.refreshToken ?? "",
    expiresAt: Date.now() + response.expires_in * 1000 - 30_000,
  };
  return returnUrl;
};

export const isUserAuthenticated = (): boolean =>
  !!tokens?.accessToken && !!tokens.refreshToken;

export const logoutUser = (): void => {
  tokens = undefined;
};

export const getUserAccessToken = async (): Promise<string> => {
  if (!tokens?.accessToken) {
    throw new SpotifyCatalogError(401, "Spotify user is not authenticated");
  }
  if (tokens.expiresAt > Date.now()) return tokens.accessToken;
  if (!tokens.refreshToken) {
    tokens = undefined;
    throw new SpotifyCatalogError(401, "Spotify user session expired");
  }

  const currentRefresh = tokens.refreshToken;
  const response = await tokenRequest(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: currentRefresh,
    }),
  ).catch((error) => {
    // A failed refresh invalidates the session: re-login is required.
    tokens = undefined;
    throw error;
  });
  tokens = {
    accessToken: response.access_token,
    refreshToken: response.refresh_token ?? currentRefresh,
    expiresAt: Date.now() + response.expires_in * 1000 - 30_000,
  };
  return tokens.accessToken;
};
