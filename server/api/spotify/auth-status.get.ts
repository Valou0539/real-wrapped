import {
  isSpotifyUserAuthConfigured,
  isUserAuthenticated,
} from "../../services/spotify/user-auth.service";

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  return {
    configured: isSpotifyUserAuthConfigured(),
    authenticated: await isUserAuthenticated(event),
  };
});
