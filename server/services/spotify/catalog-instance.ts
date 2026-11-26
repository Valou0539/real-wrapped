import { createSpotifyCatalog } from "./catalog.service";

/**
 * Process-wide shared catalog instance: the 24h search cache, token and rate
 * limit cooldowns are common to imports, cover lookups and playlist creation.
 */
let catalog: ReturnType<typeof createSpotifyCatalog> | undefined;

export const getSharedSpotifyCatalog = (): ReturnType<
  typeof createSpotifyCatalog
> => {
  const config = useRuntimeConfig();
  catalog ??= createSpotifyCatalog({
    clientId: config.spotifyClientId,
    clientSecret: config.spotifyClientSecret,
    market: config.spotifyMarket,
  });
  return catalog;
};
