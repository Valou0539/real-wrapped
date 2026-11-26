import { createError, defineEventHandler, getQuery } from "h3";
import {
  deleteJob,
  getJobState,
} from "../services/enhance-history/job.service";

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const jobId = query.jobId as string;

  if (!jobId) {
    throw createError({
      statusCode: 400,
      message: "jobId is required",
    });
  }

  const state = getJobState(jobId);

  if (!state) {
    throw createError({
      statusCode: 404,
      message: "Job not found",
    });
  }

  if (state.status === "completed") {
    deleteJob(jobId);
  }

  return state;
});
