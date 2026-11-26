import {
  buildAuthorizeUrl,
  createLoginBinding,
  isLoginBinding,
  LOGIN_BINDING_COOKIE,
  LOGIN_STATE_COOKIE,
  LOGIN_STATE_MAX_AGE,
  resolveRedirectUri,
  SESSION_PATH,
} from "../../services/spotify/user-auth.service";

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const returnUrl = typeof query.return === "string" ? query.return : "/";
  // xForwardedHost: behind a reverse proxy the public host lives in the
  // forwarding headers, not necessarily in Host.
  const origin = `${getRequestProtocol(event)}://${getRequestHost(event, { xForwardedHost: true })}`;
  const redirectUri = resolveRedirectUri(origin);
  const callback = new URL(redirectUri);

  // The state cookie must be set by the host and scheme Spotify redirects
  // back to (e.g. 127.0.0.1 while browsing localhost, or HTTPS for a Secure
  // cookie): hop there once first.
  const current = new URL(origin);
  const sameTarget =
    callback.hostname === current.hostname &&
    callback.protocol === current.protocol;

  // The binding cookie ties the session handoff to the origin the user
  // browses: it is set here, before any hop, and only travels in the hop URL.
  let binding: string;
  if (query.hop && isLoginBinding(query.binding)) {
    binding = query.binding;
  } else {
    binding = createLoginBinding();
    setCookie(event, LOGIN_BINDING_COOKIE, binding, {
      httpOnly: true,
      sameSite: "lax",
      secure: current.protocol === "https:",
      path: SESSION_PATH,
      maxAge: LOGIN_STATE_MAX_AGE,
    });
  }

  if (!sameTarget && !query.hop) {
    const hop = new URLSearchParams({ return: returnUrl, hop: "1", binding });
    return sendRedirect(
      event,
      `${callback.origin}/api/spotify/login?${hop.toString()}`,
      302,
    );
  }

  const { url, stateCookie } = buildAuthorizeUrl(
    returnUrl,
    redirectUri,
    binding,
  );
  setCookie(event, LOGIN_STATE_COOKIE, stateCookie, {
    httpOnly: true,
    // Lax: the cookie must ride along the top-level redirect from Spotify.
    sameSite: "lax",
    secure: callback.protocol === "https:",
    path: callback.pathname,
    maxAge: LOGIN_STATE_MAX_AGE,
  });
  return sendRedirect(event, url, 302);
});
