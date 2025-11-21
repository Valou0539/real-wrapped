import { describe, it, expect } from "vitest";
import { fileListToTypedObjects, filterHistoryByMonth } from "~/utils/history";
import type { EnhancedMusicHistoryTrack } from "~/shared/types/music-history";

// Mock File class
class MockFile {
  name: string;
  content: string;

  constructor(content: string, name: string) {
    this.content = content;
    this.name = name;
  }

  async text() {
    return this.content;
  }
}

const createFileList = (files: MockFile[]) => {
  return Array.from(files) as unknown as FileList;
};

describe("history utils", () => {
  describe("fileListToTypedObjects", () => {
    it("parses valid JSON files", async () => {
      const data = [{ id: 1, name: "track1" }];
      const file = new MockFile(JSON.stringify(data), "test.json");
      const fileList = createFileList([file]);

      const result = await fileListToTypedObjects(fileList);
      expect(result).toEqual(data);
    });

    it("handles multiple files", async () => {
      const data1 = [{ id: 1 }];
      const data2 = [{ id: 2 }];
      const file1 = new MockFile(JSON.stringify(data1), "1.json");
      const file2 = new MockFile(JSON.stringify(data2), "2.json");
      const fileList = createFileList([file1, file2]);

      const result = await fileListToTypedObjects(fileList);
      expect(result).toHaveLength(2);
      expect(result).toContainEqual(data1[0]);
      expect(result).toContainEqual(data2[0]);
    });

    it("ignores invalid JSON", async () => {
      const file1 = new MockFile("invalid json", "bad.json");
      const data2 = [{ id: 2 }];
      const file2 = new MockFile(JSON.stringify(data2), "good.json");
      const fileList = createFileList([file1, file2]);

      const result = await fileListToTypedObjects(fileList);
      expect(result).toHaveLength(1);
      expect(result).toEqual(data2);
    });

    it("returns empty array for empty file list", async () => {
      const fileList = createFileList([]);
      const result = await fileListToTypedObjects(fileList);
      expect(result).toEqual([]);
    });
  });

  describe("filterHistoryByMonth", () => {
    const mockHistory: EnhancedMusicHistoryTrack[] = [
      { endTime: "2023-01-15T12:00:00Z" } as any,
      { endTime: "2023-01-20T12:00:00Z" } as any,
      { endTime: "2023-02-01T12:00:00Z" } as any,
    ];

    it("filters by month index (0-11)", () => {
      const january = filterHistoryByMonth(mockHistory, 0);
      expect(january).toHaveLength(2);

      const february = filterHistoryByMonth(mockHistory, 1);
      expect(february).toHaveLength(1);
    });

    it("returns empty array if no match", () => {
      const march = filterHistoryByMonth(mockHistory, 2);
      expect(march).toHaveLength(0);
    });
  });
});
