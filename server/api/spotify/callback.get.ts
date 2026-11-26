import {
  exchangeCode,
  isLoginStateFor,
  LOGIN_STATE_COOKIE,
} from "../../services/spotify/user-auth.service";
import { SpotifyCatalogError } from "../../services/spotify/catalog.service";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = typeof query.code === "string" ? query.code : "";
  const state = typeof query.state === "string" ? query.state : "";
  const stateCookie = getCookie(event, LOGIN_STATE_COOKIE);
  // Single-use: the pending login is consumed once its state is presented,
  // whatever the outcome. A stale callback (e.g. an older tab) leaves the
  // newer pending login untouched.
  if (isLoginStateFor(stateCookie, state)) {
    deleteCookie(event, LOGIN_STATE_COOKIE, {
      path: getRequestURL(event).pathname,
    });
  }

  if (!code || !state) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing code or state",
    });
  }

  try {
    const returnUrl = await exchangeCode(code, state, stateCookie);
    return sendRedirect(event, returnUrl || "/", 302);
  } catch (error) {
    // Revisiting the callback URL (browser back/forward, refresh) replays a
    // single-use state: instead of an error page trapping the user outside
    // the app, just send them home — the login either already happened or
    // can be restarted from the button.
    if (
      error instanceof SpotifyCatalogError &&
      error.statusCode === 400
    ) {
      return sendRedirect(event, "/", 302);
    }
    throw error;
  }
});
