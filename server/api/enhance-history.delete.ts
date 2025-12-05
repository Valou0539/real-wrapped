import { deleteJob, getJob } from "../services/enhance-history/job.service";

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const jobId = query.jobId as string;

  if (!jobId) {
    throw createError({
      statusCode: 400,
      message: "jobId is required",
    });
  }

  const job = getJob(jobId);

  if (!job) {
    throw createError({
      statusCode: 404,
      message: "Job not found",
    });
  }

  // Only allow cancellation of pending jobs
  if (job.status !== "pending") {
    throw createError({
      statusCode: 400,
      message: "Only pending jobs can be cancelled",
    });
  }

  deleteJob(jobId);

  return { success: true };
});
