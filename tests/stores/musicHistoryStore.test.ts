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

describe("musicHistoryStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("initializes with undefined history", () => {
    const store = useMusicHistoryStore();
    expect(store.history).toBeUndefined();
  });

  it("loadHistory retrieves data from storage", async () => {
    const mockData = [{ trackName: "Test" }];
    vi.mocked(indexedDbStorage.getItem).mockResolvedValue(mockData);

    const store = useMusicHistoryStore();
    await store.loadHistory();

    expect(indexedDbStorage.getItem).toHaveBeenCalledWith("music-history");
    expect(store.history).toEqual(mockData);
  });

  it("saveHistory saves data to storage", async () => {
    const store = useMusicHistoryStore();
    const mockData = [{ trackName: "Test" }];
    store.history = mockData as any;

    await store.saveHistory();

    expect(indexedDbStorage.setItem).toHaveBeenCalledWith(
      "music-history",
      mockData,
    );
  });

  it("deleteHistory clears data and storage", async () => {
    const store = useMusicHistoryStore();
    store.history = [{ trackName: "Test" }] as any;
    store.jobId = "123";

    await store.deleteHistory();

    expect(indexedDbStorage.removeItem).toHaveBeenCalledWith("music-history");
    expect(store.history).toBeUndefined();
    expect(store.jobId).toBeUndefined();
  });
});
