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

const mockProcessHistory = vi.hoisted(() => vi.fn());
const mockNavigateTo = vi.hoisted(() => vi.fn());

mockNuxtImport("useMusicHistoryProcessor", () => () => ({
  processHistory: mockProcessHistory,
}));
mockNuxtImport("navigateTo", () => mockNavigateTo);

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

describe("useHistoryLibrary", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.mocked(indexedDbStorage.getItem).mockResolvedValue(null);
    vi.mocked(indexedDbStorage.setItem).mockResolvedValue(undefined);
  });

  it("selectYear recomputes stats for the selected year and clears import mode", async () => {
    const store = useMusicHistoryStore();
    await store.saveYearHistory(2024, [track2024]);
    await store.saveYearHistory(2025, [track2025]);
    store.isImporting = true;

    const { selectYear } = useHistoryLibrary();
    selectYear(2024);

    expect(store.history).toEqual([track2024]);
    expect(store.isImporting).toBe(false);
    expect(mockProcessHistory).toHaveBeenCalledWith([track2024]);
  });

  it("selectYear ignores years that are not available", async () => {
    const store = useMusicHistoryStore();
    await store.saveYearHistory(2025, [track2025]);

    const { selectYear } = useHistoryLibrary();
    selectYear(2018);

    expect(store.selectedYear).toBe(2025);
    expect(mockProcessHistory).not.toHaveBeenCalled();
  });

  it("beginImport enables import mode and navigates to the new-year page", () => {
    const store = useMusicHistoryStore();

    const { beginImport } = useHistoryLibrary();
    beginImport();

    expect(store.isImporting).toBe(true);
    expect(mockNavigateTo).toHaveBeenCalledWith(
      expect.stringMatching(/\/new$/),
    );
  });

  it("cancelImport disables import mode and navigates home", () => {
    const store = useMusicHistoryStore();
    store.isImporting = true;

    const { cancelImport } = useHistoryLibrary();
    cancelImport();

    expect(store.isImporting).toBe(false);
    expect(mockNavigateTo).toHaveBeenCalled();
  });

  it("disables the selector only while loading, not during a pending job", () => {
    const store = useMusicHistoryStore();
    const { isSelectorDisabled } = useHistoryLibrary();

    expect(isSelectorDisabled.value).toBe(false);

    store.jobs = { "job-1": 2025 };
    expect(isSelectorDisabled.value).toBe(false);

    store.isLoading = true;
    expect(isSelectorDisabled.value).toBe(true);
  });

  it("blocks year switching, new import and cancel while a submit is running", async () => {
    const store = useMusicHistoryStore();
    await store.saveYearHistory(2024, [track2024]);
    await store.saveYearHistory(2025, [track2025]);
    store.isImporting = true;
    store.isLoading = true;

    const { selectYear, beginImport, cancelImport } = useHistoryLibrary();
    selectYear(2024);
    beginImport();
    cancelImport();

    expect(store.selectedYear).toBe(2025);
    expect(store.isImporting).toBe(true);
    expect(mockProcessHistory).not.toHaveBeenCalled();
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });

  it("allows year switching while a job is pending", async () => {
    const store = useMusicHistoryStore();
    await store.saveYearHistory(2024, [track2024]);
    await store.saveYearHistory(2025, [track2025]);
    store.isImporting = true;
    store.jobs = { "job-1": 2025 };

    const { selectYear } = useHistoryLibrary();
    selectYear(2024);

    expect(store.selectedYear).toBe(2024);
    expect(store.isImporting).toBe(false);
    expect(mockProcessHistory).toHaveBeenCalledWith([track2024]);
  });

  it("beginImport clears a previous import error", () => {
    const store = useMusicHistoryStore();
    store.importError = "music-history.upload.errors.job-failed";

    const { beginImport } = useHistoryLibrary();
    beginImport();

    expect(store.importError).toBeUndefined();
  });
});
