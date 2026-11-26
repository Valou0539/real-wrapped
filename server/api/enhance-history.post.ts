import { z } from "zod";
import {
  createJob,
  isJobRunning,
  startProcessing,
} from "../services/enhance-history/job.service";

const historySchema = z
  .array(
    z.object({
      endTime: z
        .string()
        .refine((value) => Number.isFinite(new Date(value).getTime())),
      artistName: z.string(),
      trackName: z.string(),
      msPlayed: z.number().nonnegative(),
    }),
  )
  .min(1);

export default defineEventHandler(async (event) => {
  const parsed = historySchema.safeParse(await readBody(event));
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid music history",
    });
  }

  const jobId = createJob(parsed.data);

  // Start processing in background if no job is running
  if (!isJobRunning()) {
    startProcessing(jobId);
  }

  return { jobId };
});
