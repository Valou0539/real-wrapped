import { describe, expect, it } from "vitest";
import type { EnhancedMusicHistoryTrack } from "../../shared/types/music-history";
import {
  buildWrappedSearchIndex,
  findWrappedEntryBySlug,
  findWrappedSearchEntry,
  getWrappedEntryTracks,
  searchWrappedIndex,
  wrappedEntitySlug,
} from "~/utils/wrappedSearch";

const track = (
  artistName: string,
  trackName: string,
  msPlayed: number,
  genres = ["Pop"],
  endTime = "2025-01-15 12:00",
): EnhancedMusicHistoryTrack => ({
  artistName,
  trackName,
  msPlayed,
  genres,
  endTime,
  cover: "",
});

const history = [
  track("Élodie", "Même titre", 60000, ["Pop", "Rock"]),
  track("Élodie", "Même titre", 60000, ["Pop", "Rock"]),
  track("Élodie", "Autre chanson", 10000, ["Jazz"]),
  track("Other Artist", "Même titre", 200000, ["Jazz"]),
  track("Élodie", "February only", 300000, ["Rock"], "2025-02-15 12:00"),
];

describe("wrapped search", () => {
  it("ranks the full scope by listening time, not play count", () => {
    const index = buildWrappedSearchIndex(history);

    expect(index.tracks.map((item) => [item.trackName, item.rank])).toEqual([
      ["February only", 1],
      ["Même titre", 2],
      ["Même titre", 3],
      ["Autre chanson", 4],
    ]);
    expect(index.tracks[2]?.playCount).toBe(2);
    expect(
      index.artists.map((item) => [item.artistName, item.msPlayed]),
    ).toEqual([
      ["Élodie", 430000],
      ["Other Artist", 200000],
    ]);
    expect(index.genres[0]).toMatchObject({
      genreName: "Rock",
      msPlayed: 420000,
      rank: 1,
    });
  });

  it("finds title, artist and genre without case or accent sensitivity", () => {
    const index = buildWrappedSearchIndex(history);

    expect(
      searchWrappedIndex(index, "  ELODIE ").map((item) => item.type),
    ).toEqual(["track", "track", "track", "artist"]);
    expect(searchWrappedIndex(index, "MEME TITRE")).toHaveLength(2);
    expect(searchWrappedIndex(index, "rock")).toEqual([
      expect.objectContaining({ type: "genre", name: "Rock", rank: 1 }),
    ]);
    expect(searchWrappedIndex(index, "   ")).toEqual([]);
    expect(searchWrappedIndex(index, "missing")).toEqual([]);
  });

  it("distinguishes identical titles by artist when opening details", () => {
    const index = buildWrappedSearchIndex(history);
    const selection = {
      type: "track" as const,
      key: JSON.stringify(["Élodie", "Même titre"]),
    };

    expect(findWrappedSearchEntry(index, selection)).toMatchObject({
      subtitle: "Élodie",
      rank: 3,
      playCount: 2,
      msPlayed: 120000,
    });
    expect(getWrappedEntryTracks(index, selection)).toEqual([
      expect.objectContaining({
        artistName: "Élodie",
        trackName: "Même titre",
        overallRank: 3,
        msPlayed: 120000,
      }),
    ]);
  });

  it("lists an artist's tracks with subgroup and overall positions", () => {
    const index = buildWrappedSearchIndex(history);
    const tracks = getWrappedEntryTracks(index, {
      type: "artist",
      key: "Élodie",
    });

    expect(
      tracks.map((item) => [item.trackName, item.rank, item.overallRank]),
    ).toEqual([
      ["February only", 1, 1],
      ["Même titre", 2, 3],
      ["Autre chanson", 3, 4],
    ]);
  });

  it("counts only plays tagged with the selected genre", () => {
    const index = buildWrappedSearchIndex([
      track("Artist", "Shared song", 90000, ["Rock"]),
      track("Artist", "Shared song", 60000, ["Jazz"]),
      track("Artist", "Jazz song", 200000, ["Jazz"]),
      track("Another artist", "Rock song", 100000, ["Rock"]),
    ]);
    const tracks = getWrappedEntryTracks(index, { type: "genre", key: "Rock" });

    expect(
      tracks.map((item) => [
        item.trackName,
        item.msPlayed,
        item.playCount,
        item.overallRank,
      ]),
    ).toEqual([
      ["Rock song", 100000, 1, 3],
      ["Shared song", 90000, 1, 2],
    ]);
  });

  it("respects the month for search, ranking and related tracks", () => {
    const index = buildWrappedSearchIndex(history, 0);

    expect(index.history).toHaveLength(4);
    expect(searchWrappedIndex(index, "February")).toEqual([]);
    expect(index.tracks[0]).toMatchObject({
      artistName: "Other Artist",
      rank: 1,
    });
    expect(
      getWrappedEntryTracks(index, { type: "artist", key: "Élodie" }).map(
        (item) => item.trackName,
      ),
    ).toEqual(["Même titre", "Autre chanson"]);
    expect(buildWrappedSearchIndex(history, 11).entries).toEqual([]);
  });

  it("searches past the displayed top 200 tracks", () => {
    const fullHistory = Array.from({ length: 205 }, (_, i) =>
      track(`Artist ${i}`, `Song ${i}`, 205 - i),
    );
    const index = buildWrappedSearchIndex(fullHistory);

    expect(searchWrappedIndex(index, "Song 204")).toEqual([
      expect.objectContaining({ type: "track", name: "Song 204", rank: 205 }),
    ]);
    expect(index.artists).toHaveLength(205);
  });

  it("slugifies names without spaces, slashes or accents", () => {
    expect(wrappedEntitySlug("Other Artist")).toBe("other-artist");
    expect(wrappedEntitySlug("AC/DC")).toBe("ac-dc");
    expect(wrappedEntitySlug("Élodie")).toBe("elodie");
    expect(wrappedEntitySlug("Même titre")).toBe("meme-titre");
    expect(wrappedEntitySlug("Hip-Hop/Rap")).toBe("hip-hop-rap");
    expect(wrappedEntitySlug("  !!!  ")).toBe("-");
  });

  it("resolves entries from slugs, including names with slashes", () => {
    const index = buildWrappedSearchIndex([
      ...history,
      track("AC/DC", "Back/In Black", 1000),
    ]);

    expect(findWrappedEntryBySlug(index, "artist", "ac-dc")).toMatchObject({
      name: "AC/DC",
    });
    expect(
      findWrappedEntryBySlug(index, "track", "back-in-black", "ac-dc"),
    ).toMatchObject({ name: "Back/In Black", subtitle: "AC/DC" });
    expect(
      findWrappedEntryBySlug(index, "track", "meme-titre", "other-artist"),
    ).toMatchObject({ subtitle: "Other Artist", rank: 2 });
    expect(findWrappedEntryBySlug(index, "artist", "elodie")).toMatchObject({
      name: "Élodie",
    });
    expect(
      findWrappedEntryBySlug(index, "track", "meme-titre", "wrong-artist"),
    ).toBeUndefined();
  });

  it("handles empty scopes and missing selections", () => {
    const index = buildWrappedSearchIndex([]);

    expect(index.entries).toEqual([]);
    expect(searchWrappedIndex(index, "song")).toEqual([]);
    expect(
      findWrappedSearchEntry(index, { type: "artist", key: "missing" }),
    ).toBeUndefined();
    expect(
      getWrappedEntryTracks(index, { type: "genre", key: "missing" }),
    ).toEqual([]);
  });
});
