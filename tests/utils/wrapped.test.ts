import { describe, it, expect } from "vitest";
import {
  computeTopDate,
  computeTopArtists,
  computeTopTracks,
  computeTopGenres,
} from "~/utils/wrapped";
import type { EnhancedMusicHistoryTrack } from "~/shared/types/music-history";

const createTrack = (
  overrides: Partial<EnhancedMusicHistoryTrack>,
): EnhancedMusicHistoryTrack => ({
  endTime: "2023-01-01T12:00:00Z",
  artistName: "Artist A",
  trackName: "Track 1",
  msPlayed: 100000, // 100s
  genres: ["Pop"],
  platform: "spotify",
  spotifyTrackUri: "spotify:track:1",
  isShuffle: false,
  isSkipped: false,
  timestamp: new Date("2023-01-01T12:00:00Z").getTime(),
  ...overrides,
});

describe("wrapped utils", () => {
  const history = [
    createTrack({
      endTime: "2023-01-01T10:00:00Z",
      msPlayed: 60000,
      artistName: "Artist A",
      trackName: "Track A1",
      genres: ["Pop", "Rock"],
    }),
    createTrack({
      endTime: "2023-01-01T14:00:00Z",
      msPlayed: 40000,
      artistName: "Artist A",
      trackName: "Track A1",
      genres: ["Pop", "Rock"],
    }),
    createTrack({
      endTime: "2023-01-02T10:00:00Z",
      msPlayed: 50000,
      artistName: "Artist B",
      trackName: "Track B1",
      genres: ["Jazz"],
    }),
    createTrack({
      endTime: "2023-01-02T12:00:00Z",
      msPlayed: 150000,
      artistName: "Artist B",
      trackName: "Track B2",
      genres: ["Jazz"],
    }),
  ];

  describe("computeTopDate", () => {
    it("identifies the day with most listening time", () => {
      // Day 1: 60k + 40k = 100k
      // Day 2: 50k + 150k = 200k
      const result = computeTopDate(history);
      expect(result).toBeDefined();
      expect(result?.day).toBe("2023-01-02");
      expect(result?.msPlayed).toBe(200000);
    });

    it("returns undefined for empty history", () => {
      expect(computeTopDate([])).toBeUndefined();
    });
  });

  describe("computeTopArtists", () => {
    it("ranks artists by msPlayed", () => {
      // Artist A: 100k
      // Artist B: 200k
      const result = computeTopArtists(history);
      expect(result).toHaveLength(2);
      expect(result[0].artistName).toBe("Artist B");
      expect(result[0].msPlayed).toBe(200000);
      expect(result[1].artistName).toBe("Artist A");
    });

    it("calculates playCount correctly", () => {
      const result = computeTopArtists(history);
      // Artist A: 2 plays
      // Artist B: 2 plays
      expect(result.find((a) => a.artistName === "Artist A")?.playCount).toBe(
        2,
      );
    });

    it("identifies most played track per artist", () => {
      const result = computeTopArtists(history);
      const artistB = result.find((a) => a.artistName === "Artist B");
      // Artist B has Track B1 (50k) and Track B2 (150k)
      expect(artistB?.mostPlayedTrack).toBe("Track B2");
    });
  });

  describe("computeTopTracks", () => {
    it("ranks tracks by msPlayed", () => {
      const result = computeTopTracks(history);
      // Track B2: 150k
      // Track A1: 100k
      // Track B1: 50k
      expect(result[0].trackName).toBe("Track B2");
      expect(result[0].msPlayed).toBe(150000);
      expect(result[1].trackName).toBe("Track A1");
      expect(result[1].msPlayed).toBe(100000);
    });
  });

  describe("computeTopGenres", () => {
    it("ranks genres by msPlayed", () => {
      // Pop: 100k (from A)
      // Rock: 100k (from A)
      // Jazz: 200k (from B)
      const result = computeTopGenres(history);
      expect(result[0].genreName).toBe("Jazz");
      expect(result[0].msPlayed).toBe(200000);
    });

    it("identifies most played artist per genre", () => {
      const result = computeTopGenres(history);
      const jazz = result.find((g) => g.genreName === "Jazz");
      expect(jazz?.mostPlayedArtist).toBe("Artist B");
    });
  });
});
