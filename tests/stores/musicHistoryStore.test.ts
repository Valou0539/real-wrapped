import { setActivePinia, createPinia } from "pinia";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useMusicHistoryStore } from "~/stores/musicHistoryStore";
import { indexedDbStorage } from "~/utils/indexedDbStorage";

// Mock indexedDbStorage
vi.mock("~/utils/indexedDbStorage", () => ({
  indexedDbStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

const ARCHIVE_KEY = "music-history-years";
const LEGACY_KEY = "music-history";

const createTrack = (endTime: string, trackName = "Track") => ({
  endTime,
  artistName: "Artist",
  trackName,
  msPlayed: 180000,
  genres: ["pop"],
  cover: "",
});

const track2024 = createTrack("2024-03-01 10:00:00", "Track 2024");
const track2025 = createTrack("2025-01-15 08:00:00", "Track 2025");

describe("musicHistoryStore", () => {
  let storage: Map<string, unknown>;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    storage = new Map();
    vi.mocked(indexedDbStorage.getItem).mockImplementation(
      async (key: string) => (storage.get(key) ?? null) as never,
    );
    vi.mocked(indexedDbStorage.setItem).mockResolvedValue(undefined);
    vi.mocked(indexedDbStorage.removeItem).mockResolvedValue(undefined);
  });

  it("initializes with undefined history", () => {
    const store = useMusicHistoryStore();
    expect(store.history).toBeUndefined();
  });

  it("loadHistory retrieves the year archive from storage", async () => {
    storage.set(ARCHIVE_KEY, { 2024: [track2024], 2025: [track2025] });

    const store = useMusicHistoryStore();
    await store.loadHistory();

    expect(indexedDbStorage.getItem).toHaveBeenCalledWith(ARCHIVE_KEY);
    expect(store.availableYears).toEqual([2025, 2024]);
    expect(store.selectedYear).toBe(2025);
    expect(store.history).toEqual([track2025]);
  });

  it("loadHistory migrates legacy history without deleting it", async () => {
    storage.set(LEGACY_KEY, [track2024, track2025]);

    const store = useMusicHistoryStore();
    await store.loadHistory();

    expect(indexedDbStorage.setItem).toHaveBeenCalledWith(ARCHIVE_KEY, {
      2024: [track2024],
      2025: [track2025],
    });
    expect(indexedDbStorage.removeItem).not.toHaveBeenCalled();
    expect(store.availableYears).toEqual([2025, 2024]);
    expect(store.history).toEqual([track2025]);
  });

  it("loadHistory keeps the persisted selected year when it is available", async () => {
    storage.set(ARCHIVE_KEY, { 2024: [track2024], 2025: [track2025] });

    const store = useMusicHistoryStore();
    store.selectedYear = 2024;
    await store.loadHistory();

    expect(store.selectedYear).toBe(2024);
    expect(store.history).toEqual([track2024]);
  });

  it("loadHistory falls back to the newest year when the selected year is unavailable", async () => {
    storage.set(ARCHIVE_KEY, { 2024: [track2024], 2025: [track2025] });

    const store = useMusicHistoryStore();
    store.selectedYear = 2018;
    await store.loadHistory();

    expect(store.selectedYear).toBe(2025);
  });

  it("loadHistory ignores invalid legacy history", async () => {
    storage.set(LEGACY_KEY, "invalid");

    const store = useMusicHistoryStore();
    await store.loadHistory();

    expect(store.availableYears).toEqual([]);
    expect(store.history).toBeUndefined();
    expect(indexedDbStorage.setItem).not.toHaveBeenCalled();
  });

  it("saveHistory saves the current history under its first year", async () => {
    const store = useMusicHistoryStore();
    store.history = [track2024] as any;

    await store.saveHistory();

    expect(indexedDbStorage.setItem).toHaveBeenCalledWith(ARCHIVE_KEY, {
      2024: [track2024],
    });
  });

  it("saveYearHistory preserves other years and keeps only the chosen year", async () => {
    storage.set(ARCHIVE_KEY, { 2024: [track2024] });

    const store = useMusicHistoryStore();
    await store.loadHistory();
    await store.saveYearHistory(2025, [track2024, track2025]);

    expect(indexedDbStorage.setItem).toHaveBeenCalledWith(ARCHIVE_KEY, {
      2024: [track2024],
      2025: [track2025],
    });
    expect(store.availableYears).toEqual([2025, 2024]);
    expect(store.selectedYear).toBe(2025);
    expect(store.history).toEqual([track2025]);
  });

  it("saveYearHistory rejects invalid years and years without tracks", async () => {
    const store = useMusicHistoryStore();

    await expect(store.saveYearHistory(999, [track2024])).rejects.toThrow();
    await expect(store.saveYearHistory(2025, [track2024])).rejects.toThrow();
    expect(indexedDbStorage.setItem).not.toHaveBeenCalled();
  });

  it("saveYearHistory keeps the active data when storage rejects", async () => {
    storage.set(ARCHIVE_KEY, { 2024: [track2024] });

    const store = useMusicHistoryStore();
    await store.loadHistory();
    vi.mocked(indexedDbStorage.setItem).mockRejectedValueOnce(
      new Error("quota exceeded"),
    );

    await expect(store.saveYearHistory(2025, [track2025])).rejects.toThrow(
      "quota exceeded",
    );
    expect(store.availableYears).toEqual([2024]);
    expect(store.selectedYear).toBe(2024);
    expect(store.history).toEqual([track2024]);
  });

  it("selectYear only accepts available years", async () => {
    storage.set(ARCHIVE_KEY, { 2024: [track2024], 2025: [track2025] });

    const store = useMusicHistoryStore();
    await store.loadHistory();

    expect(store.selectYear(2018)).toBe(false);
    expect(store.selectYear(2024)).toBe(true);
    expect(store.history).toEqual([track2024]);
  });

  it("exposes pending job years as selectable before they finish", async () => {
    storage.set(ARCHIVE_KEY, { 2024: [track2024] });

    const store = useMusicHistoryStore();
    await store.loadHistory();
    store.jobs = { "job-1": 2025 };

    expect(store.availableYears).toEqual([2025, 2024]);
    expect(store.selectYear(2025)).toBe(true);
    expect(store.selectedYear).toBe(2025);
    expect(store.history).toBeUndefined();
  });

  it("readYearHistory returns the persisted year's tracks straight from storage", async () => {
    storage.set(ARCHIVE_KEY, { 2024: [track2024], 2025: [track2025] });

    const store = useMusicHistoryStore();

    expect(await store.readYearHistory(2024)).toEqual([track2024]);
    expect(indexedDbStorage.getItem).toHaveBeenCalledWith(ARCHIVE_KEY);
  });

  it("readYearHistory re-reads storage so persisted updates are visible", async () => {
    storage.set(ARCHIVE_KEY, { 2024: [track2024] });

    const store = useMusicHistoryStore();
    await store.loadHistory();

    storage.set(ARCHIVE_KEY, { 2024: [track2024, track2025] });

    expect(await store.readYearHistory(2024)).toEqual([track2024, track2025]);
  });

  it("readYearHistory returns a copy of the stored tracks", async () => {
    storage.set(ARCHIVE_KEY, { 2024: [track2024] });

    const store = useMusicHistoryStore();
    await store.loadHistory();

    const tracks = await store.readYearHistory(2024);

    expect(tracks).toEqual([track2024]);
    expect(tracks).not.toBe(store.histories[2024]);
  });

  it("readYearHistory returns undefined for missing or invalid years", async () => {
    storage.set(ARCHIVE_KEY, { 2024: [track2024] });

    const store = useMusicHistoryStore();

    expect(await store.readYearHistory(2025)).toBeUndefined();
    expect(await store.readYearHistory(999)).toBeUndefined();
    expect(indexedDbStorage.getItem).toHaveBeenCalledTimes(1);
  });

  it("readYearHistory does not modify the selected year or history", async () => {
    storage.set(ARCHIVE_KEY, { 2024: [track2024], 2025: [track2025] });

    const store = useMusicHistoryStore();
    await store.loadHistory();

    await store.readYearHistory(2024);

    expect(store.selectedYear).toBe(2025);
    expect(store.history).toEqual([track2025]);
  });

  it("readYearHistory propagates read failures", async () => {
    vi.mocked(indexedDbStorage.getItem).mockRejectedValue(
      new Error("read failed"),
    );

    const store = useMusicHistoryStore();

    await expect(store.readYearHistory(2024)).rejects.toThrow("read failed");
    expect(store.importError).toBeUndefined();
  });

  it("deleteHistory removes only the active year", async () => {
    storage.set(ARCHIVE_KEY, { 2024: [track2024], 2025: [track2025] });

    const store = useMusicHistoryStore();
    await store.loadHistory();
    store.jobs = { "123": 2024 };

    await store.deleteHistory();

    expect(indexedDbStorage.setItem).toHaveBeenCalledWith(ARCHIVE_KEY, {
      2024: [track2024],
    });
    expect(indexedDbStorage.removeItem).not.toHaveBeenCalled();
    expect(store.history).toEqual([track2024]);
    expect(store.jobs).toEqual({});
  });

  it("saveYearHistory loads the archive before writing so other years are kept", async () => {
    storage.set(ARCHIVE_KEY, { 2024: [track2024] });

    const store = useMusicHistoryStore();
    await store.saveYearHistory(2025, [track2025]);

    expect(indexedDbStorage.setItem).toHaveBeenCalledWith(ARCHIVE_KEY, {
      2024: [track2024],
      2025: [track2025],
    });
  });

  it("propagates read failures and never overwrites unread years", async () => {
    vi.mocked(indexedDbStorage.getItem).mockRejectedValue(
      new Error("read failed"),
    );

    const store = useMusicHistoryStore();
    await expect(store.loadHistory()).rejects.toThrow("read failed");
    expect(store.importError).toBe("music-history.upload.errors.load-history");

    await expect(store.saveYearHistory(2025, [track2025])).rejects.toThrow(
      "read failed",
    );
    expect(indexedDbStorage.setItem).not.toHaveBeenCalled();
  });
});
