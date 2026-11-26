import type { SpotifyCover } from "~~/shared/types/spotify";

/**
 * Shared cover loader: every cover in the app funnels through here so Spotify
 * is never spammed. At most MAX_CONCURRENT requests run at once (the server
 * enforces the same cap upstream), identical lookups in flight are deduplicated,
 * and failures retry with exponential backoff — honoring the server's
 * Retry-After when rate limited.
 *
 * The deduplicated request deliberately outlives individual callers: a
 * component unmounting never cancels work another visible component relies on.
 * Callers simply ignore the result after their own cleanup.
 */
const MAX_CONCURRENT = 4;
const MAX_ATTEMPTS = 3;
const MAX_WAIT_MS = 15_000;

let inFlight = 0;
const waiting: Array<() => void> = [];

const acquireSlot = async (): Promise<void> => {
  while (inFlight >= MAX_CONCURRENT) {
    await new Promise<void>((resolve) => waiting.push(resolve));
  }
  inFlight++;
};

const releaseSlot = () => {
  inFlight--;
  waiting.shift()?.();
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const retryAfterMs = (error: unknown): number => {
  const headers = (error as { response?: Response })?.response?.headers;
  const value = headers?.get("retry-after");
  if (!value) return 0;
  const seconds = Number(value);
  return Number.isFinite(seconds) ? Math.max(0, seconds * 1000) : 0;
};

const loadCover = async (
  artist: string,
  track: string,
  spotifyTrackId?: string,
): Promise<SpotifyCover | null> => {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    await acquireSlot();
    try {
      const response = await $fetch<{ cover: SpotifyCover | null }>(
        "/api/spotify/cover",
        {
          query: { artist, track, ...(spotifyTrackId ? { id: spotifyTrackId } : {}) },
          retry: 0,
        },
      );
      return response.cover;
    } catch (error) {
      if (attempt === MAX_ATTEMPTS - 1) return null;

      // One failure is never final: transient 503/504s and short rate limits
      // usually clear within seconds — honor Retry-After when the server
      // provides one, otherwise back off exponentially. Longer cooldowns are
      // not worth blocking a decorative cover for.
      const wait = Math.min(
        Math.max(1000 * 2 ** attempt, retryAfterMs(error)),
        MAX_WAIT_MS,
      );
      await sleep(wait);
    } finally {
      releaseSlot();
    }
  }
  return null;
};

const pending = new Map<string, Promise<SpotifyCover | null>>();

export const fetchSpotifyCover = (
  artist: string,
  track: string,
  spotifyTrackId?: string,
): Promise<SpotifyCover | null> => {
  // When the Spotify id is known it alone keys the deduplication: the lookup
  // no longer depends on the (lossy) artist+track pair.
  const key = spotifyTrackId ? `id:${spotifyTrackId}` : `${artist}\n${track}`;
  const existing = pending.get(key);
  if (existing) return existing;

  const request = loadCover(artist, track, spotifyTrackId).finally(() => {
    pending.delete(key);
  });
  pending.set(key, request);
  return request;
};
