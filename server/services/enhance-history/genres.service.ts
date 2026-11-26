import { z } from "zod";
import type { MusicHistoryTrack } from "../../../shared/types/music-history";

const genreList = z.array(z.string().trim().min(1));
const catalogSchema = z.record(
  z.string(),
  z.object({
    genres: genreList.optional(),
    tracks: z.record(z.string(), genreList).optional(),
  }),
);

/**
 * Builds a lookup over the administrator-provided genre catalog.
 *
 * Returns `undefined` when the catalog says nothing about the track (so the
 * caller can fall back to Spotify), a possibly-empty array otherwise: an
 * explicit empty array is an opt-out that must NOT fall back.
 */
export const createGenreLookup = (
  configuredCatalog: string,
): ((track: MusicHistoryTrack) => string[] | undefined) => {
  if (!configuredCatalog.trim()) return () => undefined;

  try {
    const entries = new Map(
      Object.entries(catalogSchema.parse(JSON.parse(configuredCatalog))),
    );

    return ({ artistName, trackName }) => {
      const entry = entries.get(artistName);
      if (!entry) return undefined;
      // A track-level override (including an explicit empty array) always wins.
      const trackOverride =
        entry.tracks && Object.hasOwn(entry.tracks, trackName)
          ? entry.tracks[trackName]
          : undefined;
      if (trackOverride) return [...new Set(trackOverride)];
      if (entry.genres) return [...new Set(entry.genres)];
      return undefined;
    };
  } catch {
    console.warn(
      "Invalid NUXT_HISTORY_GENRES; importing without configured genres.",
    );
    return () => undefined;
  }
};
