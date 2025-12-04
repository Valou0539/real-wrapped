import {
  createJob,
  isJobRunning,
  startProcessing,
} from "../services/enhance-history/job.service";

export default defineEventHandler(async (event) => {
  const tracks = await readBody<MusicHistoryTrack[]>(event);

  const jobId = createJob(tracks);

  // Start processing in background if no job is running
  if (!isJobRunning()) {
    startProcessing(jobId);
  }

  return { jobId };
});
