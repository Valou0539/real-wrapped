import { describe, expect, it } from "vitest";
import {
  filterHistoryByYear,
  getRecentHistoryYears,
  isHistoryYear,
  partitionHistoryByYear,
} from "~/utils/historyYears";

const track = (endTime: string) => ({
  endTime,
  artistName: "Artist",
  trackName: "Song",
  msPlayed: 60000,
  genres: ["Pop"],
  cover: "",
});

describe("history years", () => {
  it("accepts integer years and rejects invalid values", () => {
    for (const year of [1970, 2025, 9999])
      expect(isHistoryYear(year)).toBe(true);
    for (const year of [1969, 10000, 2025.5, NaN, "2025", null, undefined])
      expect(isHistoryYear(year)).toBe(false);
  });

  it("filters the chosen calendar year without changing the source", () => {
    const old = track("2024-12-31 12:00");
    const current = track("2025-01-01 12:00");
    const history = [old, current, track("invalid")];

    expect(filterHistoryByYear(history, 2025)).toEqual([current]);
    expect(filterHistoryByYear(history, 2026)).toEqual([]);
    expect(filterHistoryByYear(history, NaN)).toEqual([]);
    expect(history).toHaveLength(3);
  });

  it("lists the most recent years and keeps the requested year", () => {
    const currentYear = new Date().getFullYear();
    const years = getRecentHistoryYears(10);

    expect(years).toHaveLength(10);
    expect(years[0]).toBe(currentYear);
    expect(years[9]).toBe(currentYear - 9);
    expect(getRecentHistoryYears(10, currentYear - 2)).toEqual(years);
    expect(getRecentHistoryYears(10, currentYear - 20)[0]).toBe(
      currentYear - 20,
    );
  });

  it("partitions legacy history without losing valid years or metadata", () => {
    const first = track("2025-02-01 12:00");
    const second = track("2024-02-01 12:00");
    const third = track("2025-03-01 12:00");

    expect(
      partitionHistoryByYear([first, second, track("invalid"), third]),
    ).toEqual({ "2024": [second], "2025": [first, third] });
    expect(partitionHistoryByYear([])).toEqual({});
  });
});
