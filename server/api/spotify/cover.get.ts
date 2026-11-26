import { useSpotifyCatalog } from "../../services/spotify/catalog-http";

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");

  const { artist, track } = getQuery(event);
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

  return {
    cover: await useSpotifyCatalog(event, (catalog) =>
      catalog.findCover(artist.trim(), track.trim()),
    ),
  };
});
