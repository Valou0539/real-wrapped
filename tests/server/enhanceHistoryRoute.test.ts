// @vitest-environment node
import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { createEvent } from "h3";
import { beforeEach, describe, expect, it } from "vitest";
import postHandler, {
  getHistoryOwnerKey,
  MAX_HISTORY_BODY_BYTES,
  MAX_HISTORY_ENTRIES,
  MAX_HISTORY_TEXT_LENGTH,
  readLimitedJsonBody,
} from "../../server/api/enhance-history.post";
import getHandler from "../../server/api/enhance-history.get";
import {
  createJob,
  getJob,
  MAX_PENDING_JOBS,
} from "../../server/services/enhance-history/job.service";

const track = (artistName = "Artist", trackName = "Track") => ({
  endTime: "2024-01-01 10:00",
  artistName,
  trackName,
  msPlayed: 1000,
});

interface PostEventOptions {
  ip?: string;
  forwardedFor?: string;
  contentLength?: number;
}

const createPostEvent = (
  body: unknown,
  { ip, forwardedFor, contentLength }: PostEventOptions = {},
) => {
  const socket = new Socket();
  if (ip) Object.defineProperty(socket, "remoteAddress", { value: ip });
  const req = new IncomingMessage(socket);
  req.method = "POST";
  req.url = "/api/enhance-history";
  const serialized = typeof body === "string" ? body : JSON.stringify(body);
  req.headers = {
    host: "localhost",
    "content-type": "application/json",
    "content-length": String(contentLength ?? Buffer.byteLength(serialized)),
  };
  if (forwardedFor) req.headers["x-forwarded-for"] = forwardedFor;
  req.push(serialized);
  req.push(null);
  return createEvent(req, new ServerResponse(req));
};

const createGetEvent = (jobId: string) => {
  const req = new IncomingMessage(new Socket());
  req.method = "GET";
  req.url = `/api/enhance-history?jobId=${jobId}`;
  req.headers = { host: "localhost" };
  return createEvent(req, new ServerResponse(req));
};

beforeEach(() => {
  (globalThis as Record<string, unknown>).__enhanceHistoryJobs = undefined;
});

describe("enhance-history routes hardening", () => {
  it("accepts a bounded valid history and attributes the job to the socket IP", async () => {
    const blockerId = createJob([track()], "198.51.100.10");
    const blocker = getJob(blockerId);
    if (!blocker) throw new Error("missing blocker job");
    blocker.status = "processing";

    const response = (await postHandler(
      createPostEvent([track()], {
        ip: "203.0.113.20",
        forwardedFor: "198.51.100.99",
      }),
    )) as { jobId: string };

    expect(response.jobId).toEqual(expect.any(String));
    expect(getJob(response.jobId)?.status).toBe("pending");
    expect(getJob(response.jobId)?.ownerKey).toBe("203.0.113.20");
  });

  it("rejects histories above the entry limit with 400", async () => {
    const entry = track("A", "T");
    const tracks = Array.from({ length: MAX_HISTORY_ENTRIES + 1 }, () => entry);

    await expect(
      postHandler(createPostEvent(tracks, { ip: "203.0.113.20" })),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("rejects overlong artist and track names with 400", async () => {
    const overlong = "x".repeat(MAX_HISTORY_TEXT_LENGTH + 1);

    await expect(
      postHandler(
        createPostEvent([track(overlong, "T")], { ip: "203.0.113.20" }),
      ),
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      postHandler(
        createPostEvent([track("A", overlong)], { ip: "203.0.113.20" }),
      ),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("rejects an excessive content-length before reading the body with 413", async () => {
    await expect(
      postHandler(
        createPostEvent([track()], {
          ip: "203.0.113.20",
          contentLength: MAX_HISTORY_BODY_BYTES + 1,
        }),
      ),
    ).rejects.toMatchObject({ statusCode: 413 });
  });

  it("enforces the body byte limit while reading the stream", async () => {
    const event = createPostEvent([track()], {
      ip: "203.0.113.20",
      contentLength: 1,
    });

    await expect(readLimitedJsonBody(event, 16)).rejects.toMatchObject({
      statusCode: 413,
    });
  });

  it("returns 429 and keeps the jobs map bounded when the queue is full", async () => {
    for (let index = 0; index < MAX_PENDING_JOBS; index++) {
      createJob([track()], `198.51.100.${index + 1}`);
    }

    await expect(
      postHandler(createPostEvent([track()], { ip: "203.0.113.20" })),
    ).rejects.toMatchObject({ statusCode: 429 });
    expect(globalThis.__enhanceHistoryJobs.size).toBe(MAX_PENDING_JOBS);
  });

  it("trusts x-forwarded-for only when the socket peer is a private proxy", () => {
    const direct = createPostEvent([track()], {
      ip: "203.0.113.20",
      forwardedFor: "198.51.100.99",
    });
    const proxied = createPostEvent([track()], {
      ip: "10.0.0.2",
      forwardedFor: "198.51.100.99, 10.0.0.2",
    });

    expect(getHistoryOwnerKey(direct)).toBe("203.0.113.20");
    expect(getHistoryOwnerKey(proxied)).toBe("198.51.100.99");
  });

  it("deletes a completed job after its result is retrieved", async () => {
    const jobId = createJob([track()], "203.0.113.20");
    const job = getJob(jobId);
    if (!job) throw new Error("missing job");
    job.status = "completed";
    job.result = [];

    const state = (await getHandler(createGetEvent(jobId))) as {
      status: string;
    };

    expect(state.status).toBe("completed");
    expect(getJob(jobId)).toBeUndefined();
  });
});
