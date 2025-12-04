import type { EnhanceHistoryJob, JobState } from "./types";
export type { EnhanceHistoryJob };
import { fetchTrackInfo } from "./lastfm.service";

const CONCURRENCY = 20;
const JOB_CLEANUP_DELAY = 60_000 * 60 * 24;

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

export const startProcessing = async (jobId: string): Promise<void> => {
  const job = getJob(jobId);

  if (!job || job.status === "processing") {
    return;
  }

  job.status = "processing";
  const apiKey = useRuntimeConfig().lastfmApiKey;
  const total = job.tracks.length;
  let done = 0;
  const results: EnhancedMusicHistoryTrack[] = [];

  try {
    // Split into chunks of size CONCURRENCY
    const chunks: MusicHistoryTrack[][] = [];
    for (let i = 0; i < total; i += CONCURRENCY) {
      chunks.push(job.tracks.slice(i, i + CONCURRENCY));
    }

    for (const chunk of chunks) {
      const promises = chunk.map(async (track) => {
        const enhancement = await fetchTrackInfo(track, apiKey);

        results.push({
          ...track,
          genres: enhancement.genres,
          cover: enhancement.cover,
        });

        done++;
        job.progress = Math.floor((done / total) * 100);
      });

      await Promise.all(promises);
    }

    job.result = results;
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
