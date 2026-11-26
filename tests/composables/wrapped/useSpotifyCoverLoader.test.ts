import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.hoisted(() => vi.fn());
mockNuxtImport("$fetch", () => mockFetch);

const COVER = {
  imageUrl: "https://i.scdn.co/image/abc",
  albumUrl: "https://open.spotify.com/album/aaaaaaaaaaaaaaaaaaaaaa",
};

const importLoader = async () => {
  vi.resetModules();
  return import("~/composables/wrapped/useSpotifyCoverLoader");
};

const flush = () => vi.advanceTimersByTimeAsync(0);

describe("fetchSpotifyCover", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the cover and deduplicates concurrent identical lookups", async () => {
    mockFetch.mockResolvedValue({ cover: COVER });
    const { fetchSpotifyCover } = await importLoader();

    const [first, second] = await Promise.all([
      fetchSpotifyCover("Artist", "Song"),
      fetchSpotifyCover("Artist", "Song"),
    ]);

    expect(first).toEqual(COVER);
    expect(second).toEqual(COVER);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("caps concurrency at 4 and queues the rest", async () => {
    let active = 0;
    let maxActive = 0;
    mockFetch.mockImplementation(async () => {
      active++;
      maxActive = Math.max(maxActive, active);
      await new Promise((resolve) => setTimeout(resolve, 100));
      active--;
      return { cover: COVER };
    });
    const { fetchSpotifyCover } = await importLoader();

    const requests = Array.from({ length: 10 }, (_, index) =>
      fetchSpotifyCover("Artist", `Song ${index}`),
    );
    // The first four requests start immediately, the rest queues.
    await flush();
    expect(mockFetch).toHaveBeenCalledTimes(4);

    await vi.advanceTimersByTimeAsync(5_000);
    const results = await Promise.all(requests);

    expect(results.every((cover) => cover === COVER)).toBe(true);
    expect(maxActive).toBe(4);
    expect(mockFetch).toHaveBeenCalledTimes(10);
  });

  it("retries failures with backoff and succeeds", async () => {
    mockFetch
      .mockRejectedValueOnce(new Error("503"))
      .mockResolvedValueOnce({ cover: COVER });
    const { fetchSpotifyCover } = await importLoader();

    const promise = fetchSpotifyCover("Artist", "Song");
    await flush();
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // First backoff: 1s.
    await vi.advanceTimersByTimeAsync(999);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(await promise).toEqual(COVER);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("honors the server Retry-After over the default backoff", async () => {
    const rateLimited = Object.assign(new Error("429"), {
      response: { headers: new Headers({ "retry-after": "5" }) },
    });
    mockFetch
      .mockRejectedValueOnce(rateLimited)
      .mockResolvedValueOnce({ cover: COVER });
    const { fetchSpotifyCover } = await importLoader();

    const promise = fetchSpotifyCover("Artist", "Song");
    await flush();

    await vi.advanceTimersByTimeAsync(4_999);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(await promise).toEqual(COVER);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

it("passes the Spotify track id to the query and deduplicates by id", async () => {
    mockFetch.mockResolvedValue({ cover: COVER });
    const { fetchSpotifyCover } = await importLoader();

    const [first, second] = await Promise.all([
      fetchSpotifyCover("Artist", "Song", "t".repeat(22)),
      fetchSpotifyCover("Artist", "Song", "t".repeat(22)),
    ]);

    expect(first).toEqual(COVER);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, init] = mockFetch.mock.calls[0];
    expect(init.query).toEqual({
      artist: "Artist",
      track: "Song",
      id: "t".repeat(22),
    });

    // The same artist+track pair without the id is a distinct lookup.
    await fetchSpotifyCover("Artist", "Song");
    expect(mockFetch).toHaveBeenCalledTimes(2);
    const [, plainInit] = mockFetch.mock.calls[1];
    expect(plainInit.query).toEqual({ artist: "Artist", track: "Song" });
  });

  it("gives up with a null cover after the last attempt", async () => {
    mockFetch.mockRejectedValue(new Error("503"));
    const { fetchSpotifyCover } = await importLoader();

    const promise = fetchSpotifyCover("Artist", "Song");
    await vi.advanceTimersByTimeAsync(30_000);

    expect(await promise).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });
});
