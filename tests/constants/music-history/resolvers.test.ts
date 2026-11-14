import { describe, it, expect } from "vitest";
import { uploadHistoryResolver } from "~/constants/music-history/resolvers";

const validTrack = {
  endTime: "2024-01-01 10:00",
  artistName: "Artist",
  trackName: "Track",
  msPlayed: 180000,
};

const createFile = (content: string, type = "application/json") =>
  new File([content], "history.json", { type });

const createFileList = (files: File[]) =>
  ({ length: files.length, ...files }) as unknown as FileList;

const runResolver = (files: unknown) =>
  uploadHistoryResolver({ values: { files }, name: "files" });

const errorMessages = (errors: Record<string, { message: string }[]>) =>
  errors.files?.map((issue) => issue.message);

describe("uploadHistoryResolver", () => {
  it("returns required error when files are missing", async () => {
    const result = await runResolver(undefined);

    expect(errorMessages(result.errors)).toEqual([
      "music-history.upload.errors.required",
    ]);
  });

  it("returns required error when FileList is empty", async () => {
    const result = await runResolver(createFileList([]));

    expect(errorMessages(result.errors)).toEqual([
      "music-history.upload.errors.required",
    ]);
  });

  it("returns unsupported error when MIME type is not JSON", async () => {
    const file = createFile(JSON.stringify([validTrack]), "text/plain");
    const result = await runResolver(createFileList([file]));

    expect(errorMessages(result.errors)).toEqual([
      "music-history.upload.errors.unsupported",
    ]);
  });

  it("returns invalid-content error when JSON is malformed", async () => {
    const file = createFile("[{not valid json");
    const result = await runResolver(createFileList([file]));

    expect(errorMessages(result.errors)).toEqual([
      "music-history.upload.errors.invalid-content",
    ]);
  });

  it("returns invalid-content error when JSON array is empty", async () => {
    const file = createFile("[]");
    const result = await runResolver(createFileList([file]));

    expect(errorMessages(result.errors)).toEqual([
      "music-history.upload.errors.invalid-content",
    ]);
  });

  it("returns invalid-content error when JSON has the wrong shape", async () => {
    const file = createFile(JSON.stringify({ endTime: "2024-01-01" }));
    const result = await runResolver(createFileList([file]));

    expect(errorMessages(result.errors)).toEqual([
      "music-history.upload.errors.invalid-content",
    ]);
  });

  it("returns no errors for a valid single file", async () => {
    const file = createFile(JSON.stringify([validTrack]));
    const result = await runResolver(file);

    expect(result.errors).toEqual({});
  });

  it("returns no errors for a valid FileList with two files", async () => {
    const files = createFileList([
      createFile(JSON.stringify([validTrack])),
      createFile(JSON.stringify([{ ...validTrack, msPlayed: 60000 }])),
    ]);
    const result = await runResolver(files);

    expect(result.errors).toEqual({});
  });

  it("returns invalid-content error when one file in a FileList is invalid", async () => {
    const files = createFileList([
      createFile(JSON.stringify([validTrack])),
      createFile("[]"),
    ]);
    const result = await runResolver(files);

    expect(errorMessages(result.errors)).toEqual([
      "music-history.upload.errors.invalid-content",
    ]);
  });
});
