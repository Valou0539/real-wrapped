import type { MusicHistoryTrack } from "../../shared/types/music-history";

export const isHistoryYear = (year: unknown): year is number =>
  typeof year === "number" &&
  Number.isInteger(year) &&
  year >= 1970 &&
  year <= 9999;

export const getRecentHistoryYears = (
  count = 10,
  includeYear?: number,
): number[] => {
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: count },
    (_, index) => currentYear - index,
  );

  return includeYear !== undefined && !years.includes(includeYear)
    ? [includeYear, ...years]
    : years;
};

export const filterHistoryByYear = <T extends MusicHistoryTrack>(
  history: T[],
  year: number,
): T[] =>
  isHistoryYear(year)
    ? history.filter((track) => new Date(track.endTime).getFullYear() === year)
    : [];

export const partitionHistoryByYear = <T extends MusicHistoryTrack>(
  history: T[],
): Record<string, T[]> => {
  const years: Record<string, T[]> = {};
  for (const track of history) {
    const year = new Date(track.endTime).getFullYear();
    if (isHistoryYear(year)) (years[year] ??= []).push(track);
  }
  return years;
};
