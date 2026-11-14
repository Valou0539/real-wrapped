import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { setActivePinia, createPinia } from "pinia";
import { useMusicHistoryStore } from "~/stores/musicHistoryStore";
import { indexedDbStorage } from "~/utils/indexedDbStorage";

vi.mock("~/utils/indexedDbStorage", () => ({
  indexedDbStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

const mockProcessHistory = vi.hoisted(() => vi.fn());
const mockNavigateTo = vi.hoisted(() => vi.fn());
const mockFetch = vi.hoisted(() => vi.fn());

mockNuxtImport("useMusicHistoryProcessor", () => () => ({
  processHistory: mockProcessHistory,
}));
mockNuxtImport("navigateTo", () => mockNavigateTo);
mockNuxtImport("$fetch", () => mockFetch);

const POLLING_INTERVAL = 10000;

const createTrack = (endTime: string, trackName: string) => ({
  endTime,
  artistName: "Artist",
  trackName,
  msPlayed: 180000,
  genres: ["pop"],
  cover: "",
});

const track2024 = createTrack("2024-03-01 10:00:00", "Track 2024");
const track2025 = createTrack("2025-01-15 08:00:00", "Track 2025");

const completedState = (jobId: string) => ({
  jobId,
  status: "completed",
  progress: 100,
  result: [track2024, track2025],
});

const pendingForever = () => new Promise<never>(() => {});

const mountTracker = (jobId: string) => {
  const wrapper = mount(
    defineComponent({
      setup() {
        return useEnhanceHistoryProgress(jobId);
      },
      render: () => null,
    }),
  );
  return wrapper as typeof wrapper & {
    vm: { startTracking: () => void; error: string | undefined };
  };
};

const flush = () => vi.advanceTimersByTimeAsync(0);

describe("useEnhanceHistoryProgress", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.mocked(indexedDbStorage.getItem).mockResolvedValue(null);
    vi.mocked(indexedDbStorage.setItem).mockResolvedValue(undefined);
    mockFetch.mockImplementation(pendingForever);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("ignores a response that arrives after unmount", async () => {
    const store = useMusicHistoryStore();
    store.jobs = { "job-1": 2025 };

    let resolveFetch: (value: unknown) => void = () => {};
    mockFetch.mockImplementationOnce(
      () => new Promise((resolve) => (resolveFetch = resolve)),
    );

    const wrapper = mountTracker("job-1");
    wrapper.vm.startTracking();
    wrapper.unmount();

    resolveFetch(completedState("job-1"));
    await flush();

    expect(indexedDbStorage.setItem).not.toHaveBeenCalled();
    expect(store.jobs["job-1"]).toBe(2025);
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });

  it("ignores a response from a job removed before it arrives", async () => {
    const store = useMusicHistoryStore();
    store.jobs = { "job-1": 2025 };

    let resolveFirst: (value: unknown) => void = () => {};
    mockFetch.mockImplementationOnce(
      () => new Promise((resolve) => (resolveFirst = resolve)),
    );

    const wrapper = mountTracker("job-1");
    wrapper.vm.startTracking();

    store.jobs = { "job-2": 2024 };
    mountTracker("job-2").vm.startTracking();

    resolveFirst(completedState("job-1"));
    await flush();

    expect(indexedDbStorage.setItem).not.toHaveBeenCalled();
    expect(store.jobs).toEqual({ "job-2": 2024 });

    wrapper.unmount();
  });

  it("saves the completed job under its year and keeps the other years", async () => {
    const store = useMusicHistoryStore();
    vi.mocked(indexedDbStorage.getItem).mockResolvedValue(null);
    await store.saveYearHistory(2024, [track2024]);
    vi.clearAllMocks();
    vi.mocked(indexedDbStorage.setItem).mockResolvedValue(undefined);

    store.jobs = { "job-1": 2025 };
    store.isImporting = true;
    mockFetch.mockResolvedValueOnce(completedState("job-1"));

    const wrapper = mountTracker("job-1");
    wrapper.vm.startTracking();
    await flush();

    expect(indexedDbStorage.setItem).toHaveBeenCalledWith(
      "music-history-years",
      { 2024: [track2024], 2025: [track2025] },
    );
    expect(mockProcessHistory).toHaveBeenCalledWith([track2025]);
    expect(store.isImporting).toBe(false);
    expect(store.jobs).toEqual({});
    expect(mockNavigateTo).toHaveBeenCalled();

    wrapper.unmount();
  });

  it("keeps the job metadata and exposes the save error when storage rejects", async () => {
    const store = useMusicHistoryStore();
    store.jobs = { "job-1": 2025 };
    vi.mocked(indexedDbStorage.setItem).mockRejectedValueOnce(
      new Error("quota exceeded"),
    );
    mockFetch.mockResolvedValueOnce(completedState("job-1"));

    const wrapper = mountTracker("job-1");
    wrapper.vm.startTracking();
    await flush();

    expect(store.jobs["job-1"]).toBe(2025);
    expect(wrapper.vm.error).toBe("music-history.upload.errors.save-job");
    expect(mockNavigateTo).not.toHaveBeenCalled();

    wrapper.unmount();
  });

  it("requests the job state only once while a request is pending", async () => {
    const store = useMusicHistoryStore();
    store.jobs = { "job-1": 2025 };

    const wrapper = mountTracker("job-1");
    wrapper.vm.startTracking();
    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL * 3);

    expect(mockFetch).toHaveBeenCalledTimes(1);

    wrapper.unmount();
  });
});
