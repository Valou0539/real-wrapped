import { useSpotifyCatalog } from "../../services/spotify/catalog-http";

const TRACK_ID_PATTERN = /^[A-Za-z0-9]{22}$/;

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");

  const { artist, track, id } = getQuery(event);
  if (
    typeof artist !== "string" ||
    typeof track !== "string" ||
    !artist.trim() ||
    !track.trim() ||
    artist.length > 300 ||
    track.length > 300
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "Artist and track are required",
    });
  }

  const trackId = typeof id === "string" && TRACK_ID_PATTERN.test(id) ? id : "";

  return {
    cover: await useSpotifyCatalog(event, async (catalog) => {
      // A saved Spotify id gives an exact, cheaper lookup; fall back to the
      // artist+track search when missing or when the track left the catalog
      // (re-uploaded releases invalidate ids).
      if (trackId) {
        const cover = await catalog.findCoverById(trackId);
        if (cover) return cover;
      }
      return catalog.findCover(artist.trim(), track.trim());
    }),
  };
});
