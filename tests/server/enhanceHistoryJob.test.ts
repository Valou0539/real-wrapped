// @vitest-environment node
// Node environment: these are pure server-side tests, and booting the Nuxt
// app would crash because useRuntimeConfig is mocked below.
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.hoisted(() => vi.fn());
mockNuxtImport("$fetch", () => fetchMock);

const runtimeConfig = vi.hoisted(() => ({
  values: {
    spotifyClientId: "",
    spotifyClientSecret: "",
    spotifyMarket: "FR",
    historyGenres: "",
  },
}));
mockNuxtImport("useRuntimeConfig", () => () => runtimeConfig.values);

const ARTIST_URL = "https://open.spotify.com/artist/" + "b".repeat(22);

const token = () => ({ access_token: "tok", expires_in: 3600 });
const isToken = (url: string) => url.includes("accounts.spotify.com");
const artistItem = (name: string, genres: string[] = ["rock"]) => ({
  name,
  external_urls: { spotify: ARTIST_URL },
  genres,
});
const artistsPayload = (...items: unknown[]) => ({ artists: { items } });
const httpError = (status: number) =>
  Object.assign(new Error("secret upstream details"), {
    response: { status, headers: new Headers() },
  });

const track = (artistName: string, trackName: string) => ({
  endTime: "2024-01-01 10:00",
  artistName,
  trackName,
  msPlayed: 1000,
});

interface SearchInit {
  query?: { q?: string };
}
const searchCalls = () =>
  fetchMock.mock.calls.filter(([url]) => !isToken(url as string));
const searchesFor = (artist: string) =>
  searchCalls().filter(([, init]) =>
    (init as SearchInit)?.query?.q?.includes(artist),
  );
const artistSearches = () =>
  searchCalls().filter(([, init]) =>
    (init as SearchInit)?.query?.q?.startsWith("artist:"),
  );
const trackSearches = () =>
  searchCalls().filter(([, init]) =>
    (init as SearchInit)?.query?.q?.startsWith("track:"),
  );
const trackItem = (name: string, artists: string[]) => ({
  id: "t".repeat(22),
  name,
  artists: artists.map((artist) => ({ name: artist })),
});
const tracksPayload = (...items: unknown[]) => ({ tracks: { items } });

// job.service.ts keeps a module-level Spotify catalog singleton (with a 24h
// cache), so each job is run through a fresh copy of the module: resetModules
// drops the singleton while vi.mock registrations survive. The jobs map lives
// on globalThis by design and is reset manually in beforeEach.
const importJobService = async () => {
  vi.resetModules();
  return import("../../server/services/enhance-history/job.service");
};

const runJob = async (tracks: ReturnType<typeof track>[]) => {
  const service = await importJobService();
  const jobId = service.createJob(tracks);
  await service.startProcessing(jobId);
  return service.getJob(jobId);
};

beforeEach(() => {
  fetchMock.mockReset();
  runtimeConfig.values.spotifyClientId = "id";
  runtimeConfig.values.spotifyClientSecret = "secret";
  runtimeConfig.values.spotifyMarket = "FR";
  runtimeConfig.values.historyGenres = "";
  (globalThis as Record<string, unknown>).__enhanceHistoryJobs = undefined;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("enhance-history job genre enrichment", () => {
  it("enriches tracks with Spotify artist genres and leaves unknown artists empty", async () => {
    fetchMock.mockImplementation(async (url: string, init?: SearchInit) => {
      if (isToken(url)) return token();
      if (init?.query?.q === 'artist:"Daft Punk"') {
        return artistsPayload(
          artistItem("Daft Punk", ["french house", "filter house"]),
        );
      }
      return artistsPayload();
    });

    const job = await runJob([
      track("Daft Punk", "One More Time"),
      track("Daft Punk", "Get Lucky"),
      track("Unknown Artist", "Whatever"),
    ]);

    expect(job?.status).toBe("completed");
    const rows = job?.result ?? [];
    expect(rows[0]?.genres).toEqual(["french house", "filter house"]);
    expect(rows[1]?.genres).toEqual(["french house", "filter house"]);
    expect(rows[2]?.genres).toEqual([]);
    // One search per unique artist, not per track.
    expect(searchesFor("Daft Punk")).toHaveLength(1);
    expect(searchesFor("Unknown Artist")).toHaveLength(1);
    expect(searchCalls()).toHaveLength(2);
  });

  it("prefers the admin catalog over Spotify, including explicit empty opt-outs", async () => {
    runtimeConfig.values.historyGenres = JSON.stringify({
      "Admin Artist": {
        genres: ["admin genre"],
        tracks: { "Silent Track": [] },
      },
    });
    fetchMock.mockImplementation(async (url: string, init?: SearchInit) => {
      if (isToken(url)) return token();
      if (init?.query?.q === 'artist:"Spotify Artist"') {
        return artistsPayload(artistItem("Spotify Artist", ["spotted"]));
      }
      return artistsPayload();
    });

    const job = await runJob([
      track("Admin Artist", "Some Track"),
      track("Admin Artist", "Silent Track"),
      track("Spotify Artist", "Whatever"),
    ]);

    expect(job?.status).toBe("completed");
    const rows = job?.result ?? [];
    expect(rows[0]?.genres).toEqual(["admin genre"]);
    // Explicit empty opt-out: no Spotify fallback for this track.
    expect(rows[1]?.genres).toEqual([]);
    expect(rows[2]?.genres).toEqual(["spotted"]);
    // The admin-mapped artist is never searched on Spotify.
    expect(searchesFor("Admin Artist")).toHaveLength(0);
    expect(searchCalls()).toHaveLength(1);
  });

  it("reaches progress 100 and preserves the original track fields", async () => {
    fetchMock.mockImplementation(async (url: string) =>
      isToken(url) ? token() : artistsPayload(),
    );
    const input = [
      {
        endTime: "2024-05-01 12:00",
        artistName: "A",
        trackName: "T1",
        msPlayed: 42000,
      },
      {
        endTime: "2024-05-02 13:30",
        artistName: "A",
        trackName: "T2",
        msPlayed: 24000,
      },
    ];

    const job = await runJob(input);

    expect(job?.status).toBe("completed");
    expect(job?.progress).toBe(100);
    expect(job?.result).toHaveLength(2);
    for (const [index, row] of (job?.result ?? []).entries()) {
      expect(row).toMatchObject({
        endTime: input[index]?.endTime,
        artistName: input[index]?.artistName,
        trackName: input[index]?.trackName,
        msPlayed: input[index]?.msPlayed,
      });
      expect(Array.isArray(row.genres)).toBe(true);
    }
  });

  it("completes with empty genres when Spotify searches fail", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    fetchMock.mockImplementation(async (url: string) => {
      if (isToken(url)) return token();
      // 403 is non-retryable even in patient mode, keeping this test fast.
      throw httpError(403);
    });

    const job = await runJob([
      track("A1", "T"),
      track("A2", "T"),
      track("A3", "T"),
      track("A4", "T"),
      track("A5", "T"),
    ]);

    expect(job?.status).toBe("completed");
    expect(job?.progress).toBe(100);
    expect(job?.error).toBeUndefined();
    expect(job?.result).toHaveLength(5);
    expect(job?.result?.every((row) => row.genres.length === 0)).toBe(true);
    // 5 errors stay under the consecutive-error threshold: everything was
    // attempted, nothing is skipped, and no error is rethrown into the job.
    expect(warn).not.toHaveBeenCalled();
    expect(artistSearches()).toHaveLength(5);
  });

  it("skips Spotify entirely when credentials are missing", async () => {
    runtimeConfig.values.spotifyClientId = "";
    runtimeConfig.values.spotifyClientSecret = "";

    const job = await runJob([
      track("A", "T"),
      track("B", "U"),
      track("A", "Duet (feat. Guest)"),
    ]);

    expect(job?.status).toBe("completed");
    expect(job?.progress).toBe(100);
    expect(job?.result?.every((row) => row.genres.length === 0)).toBe(true);
    expect(job?.result?.every((row) => !("artists" in row))).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("resolves title-tagged featuring artists once per unique pair", async () => {
    fetchMock.mockImplementation(async (url: string, init?: SearchInit) => {
      if (isToken(url)) return token();
      const q = init?.query?.q ?? "";
      if (q === 'artist:"Air"') {
        return artistsPayload(artistItem("Air", ["downtempo"]));
      }
      if (
        q.startsWith("track:") &&
        q.includes("All I Need (feat. Beth Hirsch)")
      ) {
        return tracksPayload(
          trackItem("All I Need (feat. Beth Hirsch)", ["Air", "Beth Hirsch"]),
        );
      }
      return q.startsWith("track:") ? tracksPayload() : artistsPayload();
    });

    const job = await runJob([
      track("Air", "All I Need (feat. Beth Hirsch)"),
      track("Air", "All I Need (feat. Beth Hirsch)"),
      track("Air", "All I Need (feat. Beth Hirsch)"),
      track("Air", "Cherry Blossom Girl"),
    ]);

    expect(job?.status).toBe("completed");
    const rows = job?.result ?? [];
    // Every play of the resolved pair carries the full credited artist list
    // and the Spotify track id (the latter feeds playlist creation).
    for (const row of rows.slice(0, 3)) {
      expect(row.artists).toEqual(["Air", "Beth Hirsch"]);
      expect(row.spotifyTrackId).toBe("t".repeat(22));
    }
    // Non-feat tracks never get the field.
    expect(rows[3]).not.toHaveProperty("artists");
    // Genre enrichment still works alongside.
    expect(rows[0]?.genres).toEqual(["downtempo"]);
    // One track search per unique pair, not per play.
    expect(trackSearches()).toHaveLength(1);
    expect(trackSearches()[0]?.[1]?.query?.q).toBe(
      'track:"All I Need (feat. Beth Hirsch)" artist:"Air"',
    );
    // The featuring artist is never searched for genres: the only artist
    // search is for the export artist itself.
    expect(artistSearches()).toHaveLength(1);
    expect(artistSearches()[0]?.[1]?.query?.q).toBe('artist:"Air"');
  });

  it("resolves ft-tagged tracks and memoizes pairs per artist", async () => {
    fetchMock.mockImplementation(async (url: string, init?: SearchInit) => {
      if (isToken(url)) return token();
      const q = init?.query?.q ?? "";
      if (q.startsWith("track:") && q.includes("Collab ft. Partner")) {
        return tracksPayload(
          trackItem("Collab ft. Partner", [
            "Main Artist",
            "Partner",
            "Second Partner",
          ]),
        );
      }
      return q.startsWith("track:") ? tracksPayload() : artistsPayload();
    });

    const job = await runJob([
      track("Main Artist", "Collab ft. Partner"),
      track("Other Artist", "Collab ft. Partner"),
    ]);

    expect(job?.status).toBe("completed");
    const rows = job?.result ?? [];
    // Strict matching keys the resolution per export artist: the same title
    // under another primary artist is a different pair.
    expect(rows[0]?.artists).toEqual([
      "Main Artist",
      "Partner",
      "Second Partner",
    ]);
    expect(rows[1]).not.toHaveProperty("artists");
    expect(trackSearches()).toHaveLength(2);
  });

  it("matches feat-tagged export titles against Spotify's untagged canonical title", async () => {
    fetchMock.mockImplementation(async (url: string, init?: SearchInit) => {
      if (isToken(url)) return token();
      const q = init?.query?.q ?? "";
      if (q.startsWith("track:") && q.includes("Duet")) {
        // Spotify's canonical title drops the "(feat. …)" tag entirely.
        return tracksPayload(trackItem("Duet", ["Artist", "Guest"]));
      }
      return q.startsWith("track:") ? tracksPayload() : artistsPayload();
    });

    const job = await runJob([
      track("Artist", "Duet (feat. Guest)"),
      track("Artist", "Unknown (feat. Nobody)"),
    ]);

    expect(job?.status).toBe("completed");
    const rows = job?.result ?? [];
    expect(rows[0]?.artists).toEqual(["Artist", "Guest"]);
    expect(rows[1]).not.toHaveProperty("artists");
    expect(trackSearches()).toHaveLength(2);
  });

  it("resolves bracketed soundtrack titles despite punctuation differences", async () => {
    fetchMock.mockImplementation(async (url: string, init?: SearchInit) => {
      if (isToken(url)) return token();
      const q = init?.query?.q ?? "";
      if (q.startsWith("track:") && q.includes("Guns for Hire")) {
        // Canonical Spotify spelling uses a dash where the export has parens.
        return tracksPayload(
          trackItem(
            "Guns for Hire - from the series Arcane League of Legends",
            ["Woodkid", "Arcane", "League of Legends"],
          ),
        );
      }
      return q.startsWith("track:") ? tracksPayload() : artistsPayload();
    });

    const job = await runJob([
      track(
        "Woodkid",
        "Guns for Hire (from the series Arcane League of Legends)",
      ),
      track("Woodkid", "Iron"),
    ]);

    expect(job?.status).toBe("completed");
    const rows = job?.result ?? [];
    expect(rows[0]?.artists).toEqual([
      "Woodkid",
      "Arcane",
      "League of Legends",
    ]);
    // Plain titles without any collab hint are never searched.
    expect(rows[1]).not.toHaveProperty("artists");
    expect(trackSearches()).toHaveLength(1);
  });

  it("counts both work kinds in one shared progress total", async () => {
    const pending: { q: string; resolve: (value: unknown) => void }[] = [];
    fetchMock.mockImplementation(async (url: string, init?: SearchInit) => {
      if (isToken(url)) return token();
      return await new Promise((resolve) => {
        pending.push({ q: init?.query?.q ?? "", resolve });
      });
    });

    const service = await importJobService();
    const jobId = service.createJob([
      track("Artist One", "Plain One"),
      track("Artist Two", "Plain Two"),
      track("Artist One", "Duet (feat. Guest)"),
      track("Artist Two", "Collab ft. Partner"),
    ]);
    const processing = service.startProcessing(jobId);

    // Total work units: 2 artist lookups + 2 feat resolutions.
    await vi.waitFor(() => expect(pending).toHaveLength(4));
    expect(service.getJob(jobId)?.progress).toBe(0);

    const answer = (q: string, payload: unknown) => {
      const index = pending.findIndex((entry) => entry.q === q);
      pending.splice(index, 1)[0]?.resolve(payload);
    };

    answer('artist:"Artist One"', artistsPayload(artistItem("Artist One")));
    await vi.waitFor(() =>
      expect(service.getJob(jobId)?.progress).toBe(Math.floor((1 / 4) * 100)),
    );
    answer(
      'track:"Duet (feat. Guest)" artist:"Artist One"',
      tracksPayload(trackItem("Duet (feat. Guest)", ["Artist One", "Guest"])),
    );
    await vi.waitFor(() =>
      expect(service.getJob(jobId)?.progress).toBe(Math.floor((2 / 4) * 100)),
    );
    answer('artist:"Artist Two"', artistsPayload(artistItem("Artist Two")));
    answer(
      'track:"Collab ft. Partner" artist:"Artist Two"',
      tracksPayload(trackItem("Collab ft. Partner", ["Artist Two", "Partner"])),
    );

    await processing;
    const job = service.getJob(jobId);
    expect(job?.status).toBe("completed");
    expect(job?.progress).toBe(100);
    expect(job?.result?.[2]?.artists).toEqual(["Artist One", "Guest"]);
    expect(job?.result?.[3]?.artists).toEqual(["Artist Two", "Partner"]);
  });

  it("applies the consecutive-error stop rule across both work kinds", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    fetchMock.mockImplementation(async (url: string) => {
      if (isToken(url)) return token();
      // 403 is non-retryable even in patient mode, keeping this test fast.
      throw httpError(403);
    });

    // 1 artist lookup + 13 feat resolutions = 14 work units, all failing.
    const job = await runJob([
      track("A1", "Plain"),
      ...Array.from({ length: 13 }, (_, index) =>
        track("A1", `D${index + 1} (feat. X)`),
      ),
    ]);

    expect(job?.status).toBe("completed");
    expect(job?.error).toBeUndefined();
    expect(job?.result?.every((row) => row.genres.length === 0)).toBe(true);
    expect(job?.result?.every((row) => !("artists" in row))).toBe(true);
    // A single warning after 10 consecutive errors, then the remaining work
    // is skipped: with 4 workers, at most the 10 failures plus the 3 other
    // in-flight units can have started.
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("10 consecutive"),
    );
    expect(searchCalls().length).toBeLessThan(14);
  });

  it("stops pulling new work once a processing job is cancelled", async () => {
    const pending: { resolve: (value: unknown) => void }[] = [];
    fetchMock.mockImplementation(async (url: string) => {
      if (isToken(url)) return token();
      return await new Promise((resolve) => pending.push({ resolve }));
    });

    const service = await importJobService();
    const jobId = service.createJob([
      track("A1", "Plain"),
      ...Array.from({ length: 10 }, (_, index) =>
        track("A1", `D${index + 1} (feat. X)`),
      ),
    ]);
    const processing = service.startProcessing(jobId);

    // The 4 workers pick up the first units and hang inside Spotify.
    await vi.waitFor(() => expect(pending).toHaveLength(4));
    expect(service.cancelJob(jobId)).toBe(true);
    expect(service.getJob(jobId)).toBeUndefined();

    // In-flight lookups settle, but no further unit is ever started.
    pending.forEach(({ resolve }) => resolve(artistsPayload()));
    await processing;
    expect(searchCalls()).toHaveLength(4);
  });

  it("cancels a pending job but refuses completed or missing ones", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (isToken(url)) return token();
      return artistsPayload();
    });

    const service = await importJobService();
    const pendingId = service.createJob([track("A1", "Plain")]);
    expect(service.cancelJob(pendingId)).toBe(true);
    expect(service.getJob(pendingId)).toBeUndefined();
    expect(service.cancelJob(pendingId)).toBe(false);

    const completedId = service.createJob([track("A2", "Plain")]);
    await service.startProcessing(completedId);
    expect(service.getJob(completedId)?.status).toBe("completed");
    expect(service.cancelJob(completedId)).toBe(false);
    expect(service.getJob(completedId)).toBeDefined();
  });
});
