import { useSpotifyCatalog } from "../../services/spotify/catalog-http";

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");

  const { artist } = getQuery(event);
  if (typeof artist !== "string" || !artist.trim() || artist.length > 300) {
    throw createError({
      statusCode: 400,
      statusMessage: "Artist is required",
    });
  }

  return {
    artistGenres: await useSpotifyCatalog(event, (catalog) =>
      catalog.findArtistGenres(artist.trim()),
    ),
  };
});
