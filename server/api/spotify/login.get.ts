import {
  buildAuthorizeUrl,
  resolveRedirectUri,
} from "../../services/spotify/user-auth.service";

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const returnUrl = typeof query.return === "string" ? query.return : "/";
  // xForwardedHost: behind a reverse proxy the public host lives in the
  // forwarding headers, not necessarily in Host.
  const origin = `${getRequestProtocol(event)}://${getRequestHost(event, { xForwardedHost: true })}`;
  return sendRedirect(
    event,
    buildAuthorizeUrl(returnUrl, resolveRedirectUri(origin)),
    302,
  );
});
