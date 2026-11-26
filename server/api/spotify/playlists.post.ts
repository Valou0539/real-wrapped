import { z } from "zod";
import { createPlaylistWithTracks } from "../../services/spotify/playlist.service";
import { SpotifyCatalogError } from "../../services/spotify/catalog.service";
import {
  isSpotifyUserAuthConfigured,
  isUserAuthenticated,
} from "../../services/spotify/user-auth.service";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(300).default(""),
  tracks: z
    .array(
      z.object({
        artistName: z.string().trim().min(1).max(300),
        trackName: z.string().trim().min(1).max(300),
        spotifyTrackId: z
          .string()
          .regex(/^[A-Za-z0-9]{22}$/)
          .optional(),
      }),
    )
    .min(1)
    .max(200),
});

export default defineEventHandler(async (event) => {
  if (!isSpotifyUserAuthConfigured()) {
    throw createError({
      statusCode: 503,
      statusMessage: "Spotify user auth is not configured",
    });
  }
  if (!(await isUserAuthenticated(event))) {
    throw createError({
      statusCode: 401,
      statusMessage: "Spotify login required",
    });
  }

  const parsed = bodySchema.safeParse(await readBody(event));
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: "Invalid playlist" });
  }

  try {
    return await createPlaylistWithTracks(
      event,
      parsed.data.name,
      parsed.data.description,
      parsed.data.tracks,
    );
  } catch (error) {
    if (error instanceof SpotifyCatalogError) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
      });
    }
    throw error;
  }
});
