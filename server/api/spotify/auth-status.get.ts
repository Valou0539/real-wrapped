import {
  isSpotifyUserAuthConfigured,
  isUserAuthenticated,
} from "../../services/spotify/user-auth.service";

export default defineEventHandler(() => {
  return {
    configured: isSpotifyUserAuthConfigured(),
    authenticated: isUserAuthenticated(),
  };
});
