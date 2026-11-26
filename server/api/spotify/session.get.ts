import {
  LOGIN_BINDING_COOKIE,
  redeemSessionHandoff,
  SESSION_PATH,
} from "../../services/spotify/user-auth.service";
import { SpotifyCatalogError } from "../../services/spotify/catalog.service";

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const { handoff } = getQuery(event);

  try {
    const returnUrl = await redeemSessionHandoff(
      event,
      handoff,
      getCookie(event, LOGIN_BINDING_COOKIE),
    );
    deleteCookie(event, LOGIN_BINDING_COOKIE, { path: SESSION_PATH });
    return sendRedirect(event, returnUrl || "/", 302);
  } catch (error) {
    // Replayed, expired or foreign handoff: back home, the login can be
    // restarted from the button.
    if (error instanceof SpotifyCatalogError && error.statusCode === 400) {
      return sendRedirect(event, "/", 302);
    }
    throw error;
  }
});
