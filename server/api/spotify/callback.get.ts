import { exchangeCode } from "../../services/spotify/user-auth.service";
import { SpotifyCatalogError } from "../../services/spotify/catalog.service";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = typeof query.code === "string" ? query.code : "";
  const state = typeof query.state === "string" ? query.state : "";

  if (!code || !state) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing code or state",
    });
  }

  try {
    const returnUrl = await exchangeCode(code, state);
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
