import type { EnhanceHistoryJob, JobState } from "./types";
export type { EnhanceHistoryJob };
import { createGenreLookup } from "./genres.service";
import { createSpotifyCatalog } from "../spotify/catalog.service";

const JOB_CLEANUP_DELAY = 60_000 * 60 * 24;
const ARTIST_WORKERS = 4;
const MAX_CONSECUTIVE_ERRORS = 10;
const MARKET_PATTERN = /^[A-Z]{2}$/;
// Tracks worth resolving against Spotify for full artist credits: explicit
// feat/ft tags ("All I Need (feat. Beth Hirsch)") plus any bracketed title,
// which is how multi-artist soundtrack/collab recordings appear in exports
// ("Guns for Hire (from the series Arcane League of Legends)" is credited to
// Woodkid, Arcane and League of Legends). Resolving every unique track would
// blow the quota: Spotify search takes ~1s per query even without throttling,
// so plain titles keep their primary artist only and untagged collabs
// ("Under Pressure") stay undetected.
const COLLAB_HINT_PATTERN = /\b(?:feat|ft)\.\s|[\(\[]/i;

// Module-level lazy singleton: the catalog's 24h cache is shared across jobs.
let catalog: ReturnType<typeof createSpotifyCatalog> | undefined;
const getCatalog = (): ReturnType<typeof createSpotifyCatalog> => {
  const config = useRuntimeConfig();
  catalog ??= createSpotifyCatalog({
    clientId: config.spotifyClientId,
    clientSecret: config.spotifyClientSecret,
    market: config.spotifyMarket,
  });
  return catalog;
};

const isSpotifyConfigured = (): boolean => {
  const config = useRuntimeConfig();
  return (
    !!config.spotifyClientId?.trim() &&
    !!config.spotifyClientSecret?.trim() &&
    MARKET_PATTERN.test((config.spotifyMarket ?? "").trim().toUpperCase())
  );
};

const getJobsMap = (): Map<string, EnhanceHistoryJob> => {
  if (!globalThis.__enhanceHistoryJobs) {
    globalThis.__enhanceHistoryJobs = new Map();
  }
  return globalThis.__enhanceHistoryJobs;
};

export const createJob = (tracks: MusicHistoryTrack[]): string => {
  const jobId = crypto.randomUUID();
  const jobs = getJobsMap();

  jobs.set(jobId, {
    tracks,
    progress: 0,
    status: "pending",
    result: null,
    createdAt: Date.now(),
  });

  return jobId;
};

export const getJob = (jobId: string): EnhanceHistoryJob | undefined => {
  return getJobsMap().get(jobId);
};

const getQueuePosition = (jobId: string): number | null => {
  const jobs = getJobsMap();
  const pendingJobs: { jobId: string; createdAt: number }[] = [];

  for (const [id, job] of jobs.entries()) {
    if (job.status === "pending") {
      pendingJobs.push({ jobId: id, createdAt: job.createdAt });
    }
  }

  // Trier par date de création (plus ancien en premier)
  pendingJobs.sort((a, b) => a.createdAt - b.createdAt);

  const position = pendingJobs.findIndex((j) => j.jobId === jobId);
  if (position === -1) {
    return null;
  }

  // Retourne le nombre de personnes devant (position 0 = 0 personnes devant)
  return position + 1;
};

export const getJobState = (jobId: string): JobState | null => {
  const job = getJob(jobId);

  if (!job) {
    return null;
  }

  const state: JobState = {
    jobId,
    status: job.status,
    progress: job.progress,
    result: job.result,
    error: job.error,
  };

  // Ajouter la position dans la queue si le job est en attente
  if (job.status === "pending") {
    const position = getQueuePosition(jobId);
    if (position !== null) {
      state.queuePosition = position;
    }
  }

  return state;
};

export const deleteJob = (jobId: string): void => {
  getJobsMap().delete(jobId);
};

/**
 * Cancels a pending or processing job. Pending jobs simply disappear; a
 * processing job is flagged so its workers stop pulling new work, and is
 * untracked immediately — the handful of in-flight Spotify lookups finish in
 * the background but their result is never stored anywhere.
 */
export const cancelJob = (jobId: string): boolean => {
  const job = getJob(jobId);
  if (!job || (job.status !== "pending" && job.status !== "processing")) {
    return false;
  }
  job.cancelled = true;
  deleteJob(jobId);
  return true;
};

export const isJobRunning = (): boolean => {
  const jobs = getJobsMap();
  for (const job of jobs.values()) {
    if (job.status === "processing") {
      return true;
    }
  }
  return false;
};

const getNextPendingJob = (): {
  jobId: string;
  job: EnhanceHistoryJob;
} | null => {
  const jobs = getJobsMap();
  let oldest: { jobId: string; job: EnhanceHistoryJob } | null = null;

  for (const [jobId, job] of jobs.entries()) {
    if (job.status === "pending") {
      if (!oldest || job.createdAt < oldest.job.createdAt) {
        oldest = { jobId, job };
      }
    }
  }

  return oldest;
};

const processNextJob = (): void => {
  if (isJobRunning()) {
    return;
  }

  const next = getNextPendingJob();
  if (next) {
    startProcessing(next.jobId);
  }
};

type WorkItem =
  | { kind: "artist"; artist: string }
  | { kind: "feat"; artistName: string; trackName: string };

interface EnrichmentResults {
  genres: Map<string, string[]>;
  trackArtists: Map<string, Map<string, string[] | undefined>>;
}

/**
 * Fetches artist genres and featuring-track artist credits from Spotify with
 * a single worker pool, so progress updates stay meaningful across both kinds
 * of work. Artists that cannot be matched or that fail keep empty genres, and
 * tracks whose featuring artists cannot be resolved keep no `artists` field;
 * after MAX_CONSECUTIVE_ERRORS consecutive failures (counted in completion
 * order, across both kinds) the remaining work is skipped.
 */
const fetchSpotifyEnrichment = async (
  artists: string[],
  featPairs: { artistName: string; trackName: string }[],
  onProgress: (done: number, total: number) => void,
  shouldStop: () => boolean = () => false,
): Promise<EnrichmentResults> => {
  const genres = new Map<string, string[]>();
  const trackArtists = new Map<string, Map<string, string[] | undefined>>();

  const workItems: WorkItem[] = [
    ...artists.map((artist): WorkItem => ({ kind: "artist", artist })),
    ...featPairs.map((pair): WorkItem => ({
      kind: "feat",
      artistName: pair.artistName,
      trackName: pair.trackName,
    })),
  ];
  const total = workItems.length;
  let index = 0;
  let done = 0;
  let consecutiveErrors = 0;
  let stopped = false;

  const nextItem = (): WorkItem | undefined => {
    if (stopped || shouldStop() || index >= workItems.length) return undefined;
    return workItems[index++];
  };

  const recordTrackArtists = (
    artistName: string,
    trackName: string,
    value: string[] | undefined,
  ): void => {
    let perArtist = trackArtists.get(artistName);
    if (!perArtist) {
      perArtist = new Map();
      trackArtists.set(artistName, perArtist);
    }
    perArtist.set(trackName, value);
  };

  const worker = async (): Promise<void> => {
    for (;;) {
      const item = nextItem();
      if (item === undefined) return;
      try {
        if (item.kind === "artist") {
          const result = await getCatalog().findArtistGenres(item.artist, {
            patient: true,
          });
          // A null result means "no match", not a failure.
          genres.set(item.artist, result?.genres ?? []);
        } else {
          const result = await getCatalog().findTrackArtists(
            item.artistName,
            item.trackName,
            { patient: true },
          );
          recordTrackArtists(
            item.artistName,
            item.trackName,
            result ?? undefined,
          );
        }
        consecutiveErrors = 0;
      } catch {
        if (item.kind === "artist") {
          genres.set(item.artist, []);
        } else {
          recordTrackArtists(item.artistName, item.trackName, undefined);
        }
        consecutiveErrors++;
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS && !stopped) {
          stopped = true;
          console.warn(
            `Spotify enrichment stopped after ${MAX_CONSECUTIVE_ERRORS} consecutive errors; remaining artists and tracks will have no Spotify enrichment.`,
          );
        }
      }
      done++;
      onProgress(done, total);
    }
  };

  const workerCount = Math.min(ARTIST_WORKERS, workItems.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return { genres, trackArtists };
};

export const startProcessing = async (jobId: string): Promise<void> => {
  const job = getJob(jobId);

  if (!job || job.status !== "pending") {
    return;
  }

  job.status = "processing";

  try {
    const lookupGenres = createGenreLookup(useRuntimeConfig().historyGenres);

    // Histories can hold tens of thousands of rows: memoize the lookup per
    // unique artist/track pair. Nested maps avoid key-collision concerns.
    const lookupCache = new Map<string, Map<string, string[] | undefined>>();
    const cachedLookup = (track: MusicHistoryTrack): string[] | undefined => {
      let perArtist = lookupCache.get(track.artistName);
      if (!perArtist) {
        perArtist = new Map();
        lookupCache.set(track.artistName, perArtist);
      }
      if (perArtist.has(track.trackName)) {
        return perArtist.get(track.trackName);
      }
      const result = lookupGenres(track);
      perArtist.set(track.trackName, result);
      return result;
    };

    const lookupResults = job.tracks.map(cachedLookup);

    // Artists not covered by the admin catalog (first-appearance order).
    const artistsToFetch: string[] = [];
    const seenArtists = new Set<string>();
    job.tracks.forEach((track, index) => {
      if (lookupResults[index] !== undefined) return;
      if (seenArtists.has(track.artistName)) return;
      seenArtists.add(track.artistName);
      artistsToFetch.push(track.artistName);
    });

    // Unique collab-hint pairs (first-appearance order), memoized so each
    // pair is resolved once no matter how often it was played.
    const featPairsToResolve: { artistName: string; trackName: string }[] = [];
    const seenFeatPairs = new Map<string, Set<string>>();
    job.tracks.forEach((track) => {
      if (!COLLAB_HINT_PATTERN.test(track.trackName)) return;
      let perArtist = seenFeatPairs.get(track.artistName);
      if (!perArtist) {
        perArtist = new Set();
        seenFeatPairs.set(track.artistName, perArtist);
      }
      if (perArtist.has(track.trackName)) return;
      perArtist.add(track.trackName);
      featPairsToResolve.push({
        artistName: track.artistName,
        trackName: track.trackName,
      });
    });

    let spotifyGenres = new Map<string, string[]>();
    let trackArtists = new Map<string, Map<string, string[] | undefined>>();
    const totalWork = artistsToFetch.length + featPairsToResolve.length;
    if (totalWork > 0 && isSpotifyConfigured()) {
      const enrichment = await fetchSpotifyEnrichment(
        artistsToFetch,
        featPairsToResolve,
        (done, total) => {
          job.progress = Math.floor((done / total) * 100);
        },
        () => !!job.cancelled,
      );
      spotifyGenres = enrichment.genres;
      trackArtists = enrichment.trackArtists;
    }

    if (job.cancelled) return;

    job.result = job.tracks.map((track, index) => {
      const resolution = trackArtists
        .get(track.artistName)
        ?.get(track.trackName);
      return {
        ...track,
        genres:
          lookupResults[index] ?? spotifyGenres.get(track.artistName) ?? [],
        ...(resolution ? { artists: resolution } : {}),
      };
    });
    job.progress = 100;
    job.status = "completed";

    // Cleanup after delay
    setTimeout(() => {
      deleteJob(jobId);
    }, JOB_CLEANUP_DELAY);
  } catch (error) {
    job.status = "error";
    job.error = error instanceof Error ? error.message : "Unknown error";
    console.error(`Job ${jobId} failed:`, error);
  } finally {
    // Process next pending job in queue
    processNextJob();
  }
};
