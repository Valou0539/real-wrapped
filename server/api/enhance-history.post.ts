import {
  createError,
  defineEventHandler,
  getRequestHeader,
  readRawBody,
  type H3Event,
} from "h3";
import { z } from "zod";
import {
  assertJobCreationCapacity,
  createJob,
  isJobRunning,
  JobQueueFullError,
  startProcessing,
} from "../services/enhance-history/job.service";

export const MAX_HISTORY_ENTRIES = 200_000;
export const MAX_HISTORY_TEXT_LENGTH = 300;
export const MAX_HISTORY_BODY_BYTES = 30 * 1024 * 1024;

const isTrustedProxyAddress = (address: string): boolean => {
  const ip = address.toLowerCase().replace(/^::ffff:/, "");
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    ip.startsWith("169.254.") ||
    ip.startsWith("fc") ||
    ip.startsWith("fd") ||
    ip.startsWith("fe80")
  );
};

export const getHistoryOwnerKey = (event: H3Event): string => {
  const contextAddress = event.context.clientAddress?.trim().toLowerCase();
  if (contextAddress) return contextAddress;

  const socketAddress = event.node.req.socket.remoteAddress;
  const forwardedAddress = getRequestHeader(event, "x-forwarded-for")
    ?.split(",")[0]
    ?.trim()
    .toLowerCase();
  if (!socketAddress) return forwardedAddress || "unknown";
  if (isTrustedProxyAddress(socketAddress) && forwardedAddress) {
    return forwardedAddress;
  }

  return socketAddress.trim().toLowerCase() || "unknown";
};

export const historySchema = z
  .array(
    z.object({
      endTime: z
        .string()
        .max(64)
        .refine((value) => Number.isFinite(new Date(value).getTime())),
      artistName: z.string().trim().min(1).max(MAX_HISTORY_TEXT_LENGTH),
      trackName: z.string().trim().min(1).max(MAX_HISTORY_TEXT_LENGTH),
      msPlayed: z.number().nonnegative(),
    }),
  )
  .min(1)
  .max(MAX_HISTORY_ENTRIES);

const payloadTooLargeError = () =>
  createError({
    statusCode: 413,
    statusMessage: "Request body too large",
  });

const invalidJsonError = () =>
  createError({
    statusCode: 400,
    statusMessage: "Invalid music history",
  });

const parseJsonBody = (body: Buffer): unknown => {
  try {
    return JSON.parse(body.toString("utf8"));
  } catch {
    throw invalidJsonError();
  }
};

export const readLimitedJsonBody = async (
  event: H3Event,
  maxBytes = MAX_HISTORY_BODY_BYTES,
): Promise<unknown> => {
  const contentLength = getRequestHeader(event, "content-length");
  if (contentLength) {
    const length = Number(contentLength);
    if (Number.isFinite(length) && length > maxBytes) {
      throw payloadTooLargeError();
    }
  }

  const request = event.node.req;
  if (typeof request[Symbol.asyncIterator] !== "function") {
    const rawBody = await readRawBody(event, false);
    if (!rawBody) throw invalidJsonError();
    if (rawBody.byteLength > maxBytes) throw payloadTooLargeError();
    return parseJsonBody(rawBody);
  }

  const chunks: Buffer[] = [];
  let byteLength = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    byteLength += buffer.byteLength;
    if (byteLength > maxBytes) {
      throw payloadTooLargeError();
    }
    chunks.push(buffer);
  }

  return parseJsonBody(Buffer.concat(chunks));
};

export default defineEventHandler(async (event) => {
  const ownerKey = getHistoryOwnerKey(event);
  try {
    assertJobCreationCapacity(ownerKey);
  } catch (error) {
    if (error instanceof JobQueueFullError) {
      throw createError({
        statusCode: 429,
        statusMessage: error.message,
      });
    }
    throw error;
  }

  const parsed = historySchema.safeParse(await readLimitedJsonBody(event));
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid music history",
    });
  }

  let jobId: string;
  try {
    jobId = createJob(parsed.data, ownerKey);
  } catch (error) {
    if (error instanceof JobQueueFullError) {
      throw createError({
        statusCode: 429,
        statusMessage: error.message,
      });
    }
    throw error;
  }

  // Start processing in background if no job is running
  if (!isJobRunning()) {
    startProcessing(jobId);
  }

  return { jobId };
});
