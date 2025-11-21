import type { EnhancedMusicHistoryTrack } from "../../shared/types/music-history";

export const fileListToTypedObjects = async <T = unknown>(
  files: FileList,
): Promise<T[]> => {
  const fileArray: File[] = Array.from(files);
  if (!fileArray.length) return [];

  const results: T[] = [];

  for (const file of fileArray) {
    const text = await file.text();

    try {
      const parsed = JSON.parse(text) as T[];
      results.push(...parsed);
    } catch (error) {
      console.error(`Invalid JSON in file: ${file.name}`, error);
      continue;
    }
  }

  return results;
};

export const filterHistoryByMonth = (
  history: EnhancedMusicHistoryTrack[],
  month: number,
): EnhancedMusicHistoryTrack[] => {
  if (!history.length) return [];

  return history.filter((track) => {
    const date = new Date(track.endTime);
    return date.getMonth() === month;
  });
};
