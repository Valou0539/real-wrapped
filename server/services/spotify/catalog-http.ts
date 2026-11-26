import { createError, setResponseHeader, type H3Event } from "h3";
import { createSpotifyCatalog, SpotifyCatalogError } from "./catalog.service";

let catalog: ReturnType<typeof createSpotifyCatalog> | undefined;

export const useSpotifyCatalog = async <T>(
  event: H3Event,
  action: (catalog: ReturnType<typeof createSpotifyCatalog>) => Promise<T>,
): Promise<T> => {
  const config = useRuntimeConfig(event);
  catalog ??= createSpotifyCatalog({
    clientId: config.spotifyClientId,
    clientSecret: config.spotifyClientSecret,
    market: config.spotifyMarket,
  });

  try {
    return await action(catalog);
  } catch (error) {
    if (!(error instanceof SpotifyCatalogError)) {
      throw createError({
        statusCode: 503,
        statusMessage: "Spotify catalog unavailable",
      });
    }
    if (error.retryAfter !== undefined) {
      setResponseHeader(event, "Retry-After", String(error.retryAfter));
    }
    throw createError({
      statusCode: error.statusCode,
      statusMessage: error.message,
    });
  }
};
