import { describe, it, expect, beforeEach, vi } from "vitest";
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

const mockExecute = vi.hoisted(() => vi.fn());
const mockRequire = vi.hoisted(() => vi.fn());

mockNuxtImport("useEnhanceHistoryRequest", () => () => ({
  execute: mockExecute,
}));
mockNuxtImport("useConfirm", () => () => ({ require: mockRequire }));
mockNuxtImport("useI18n", () => () => ({ t: (key: string) => key }));
const mockNavigateTo = vi.hoisted(() => vi.fn());
mockNuxtImport("navigateTo", () => mockNavigateTo);
mockNuxtImport("useLocalePath", () => () => (path: string) => path);

const createTrack = (endTime: string, trackName: string) => ({
  endTime,
  artistName: "Artist",
  trackName,
  msPlayed: 180000,
});

const track2024 = createTrack("2024-03-01 10:00:00", "Track 2024");
const track2025 = createTrack("2025-01-15 08:00:00", "Track 2025");

const createFileList = (tracks: unknown[]) => {
  const file = new File([JSON.stringify(tracks)], "history.json", {
    type: "application/json",
  });
  return { length: 1, 0: file } as unknown as FileList;
};

const submitWith = (
  submit: ReturnType<typeof useUploadHistoryForm>["submit"],
  year: number,
  files: FileList,
) => submit({ valid: true, values: { year, files } } as never);

describe("useUploadHistoryForm", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.mocked(indexedDbStorage.getItem).mockResolvedValue(null);
    vi.mocked(indexedDbStorage.setItem).mockResolvedValue(undefined);
    mockExecute.mockResolvedValue({ jobId: "job-1" });
  });

  it("sends only the tracks of the chosen year and sets the job year before the job id", async () => {
    const store = useMusicHistoryStore();
    const { submit, responseError } = useUploadHistoryForm();

    await submitWith(submit, 2025, createFileList([track2024, track2025]));

    expect(mockExecute).toHaveBeenCalledWith([track2025]);
    expect(store.jobs["job-1"]).toBe(2025);
    expect(store.selectedYear).toBe(2025);
    expect(store.isImporting).toBe(false);
    expect(mockNavigateTo).toHaveBeenCalledWith("/");
    expect(responseError.value).toBeUndefined();
  });

  it("returns a localized error without any request when no track matches the year", async () => {
    const store = useMusicHistoryStore();
    const { submit, responseError, loading } = useUploadHistoryForm();

    await submitWith(submit, 2020, createFileList([track2024]));

    expect(mockExecute).not.toHaveBeenCalled();
    expect(responseError.value).toBe("music-history.upload.errors.no-tracks");
    expect(store.jobs).toEqual({});
    expect(loading.value).toBe(false);
    expect(store.isLoading).toBe(false);
  });

  it("resets loading and keeps the existing data when the request fails", async () => {
    const store = useMusicHistoryStore();
    await store.saveYearHistory(2024, [track2024]);
    mockExecute.mockRejectedValueOnce(new Error("network"));

    const { submit, responseError, loading } = useUploadHistoryForm();
    await submitWith(submit, 2025, createFileList([track2025]));

    expect(responseError.value).toBe("music-history.upload.errors.request");
    expect(store.jobs).toEqual({});
    expect(store.availableYears).toEqual([2024]);
    expect(store.history).toEqual([track2024]);
    expect(loading.value).toBe(false);
    expect(store.isLoading).toBe(false);
  });

  it("does not request anything when replacing an existing year is cancelled", async () => {
    const store = useMusicHistoryStore();
    await store.saveYearHistory(2025, [track2025]);
    mockRequire.mockImplementation((options: { reject: () => void }) =>
      options.reject(),
    );

    const { submit } = useUploadHistoryForm();
    await submitWith(submit, 2025, createFileList([track2025]));

    expect(mockRequire).toHaveBeenCalled();
    expect(mockExecute).not.toHaveBeenCalled();
    expect(store.jobs).toEqual({});
  });

  it("sends the request when replacing an existing year is confirmed", async () => {
    const store = useMusicHistoryStore();
    await store.saveYearHistory(2025, [track2025]);
    mockRequire.mockImplementation((options: { accept: () => void }) =>
      options.accept(),
    );

    const { submit } = useUploadHistoryForm();
    await submitWith(submit, 2025, createFileList([track2025]));

    expect(mockExecute).toHaveBeenCalledWith([track2025]);
    expect(store.jobs["job-1"]).toBe(2025);
  });

  it("ignores a second submit while the first request is running", async () => {
    const store = useMusicHistoryStore();
    let resolveExecute: (value: { jobId: string }) => void = () => {};
    mockExecute.mockImplementationOnce(
      () => new Promise((resolve) => (resolveExecute = resolve)),
    );

    const { submit, loading } = useUploadHistoryForm();
    const files = createFileList([track2025]);
    const first = submitWith(submit, 2025, files);
    await submitWith(submit, 2025, files);

    await vi.waitFor(() => expect(mockExecute).toHaveBeenCalledTimes(1));
    expect(loading.value).toBe(true);
    expect(store.isLoading).toBe(true);

    resolveExecute({ jobId: "job-1" });
    await first;

    expect(store.jobs["job-1"]).toBe(2025);
    expect(loading.value).toBe(false);
    expect(store.isLoading).toBe(false);
  });
});
