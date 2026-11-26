import type { EnhancedMusicHistoryTrack } from "../../shared/types/music-history";
import type {
  WrappedDetailTrack,
  WrappedSearchEntry,
  WrappedSearchIndex,
  WrappedSearchSelection,
} from "../types/wrappedSearch";
import { filterHistoryByMonth } from "./history";
import {
  computeTopArtists,
  computeTopGenres,
  computeTopTracks,
} from "./wrapped";

const trackKey = (artistName: string, trackName: string) =>
  JSON.stringify([artistName, trackName]);

const normalizeSearch = (value: string) =>
  value.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase().trim();

export const buildWrappedSearchIndex = (
  history: EnhancedMusicHistoryTrack[],
  month: number | "all" = "all",
): WrappedSearchIndex => {
  if (month !== "all") history = filterHistoryByMonth(history, month);
  const tracks = computeTopTracks(history).map((track, index) => ({
    ...track,
    rank: index + 1,
  }));
  const artists = computeTopArtists(history).map((artist, index) => ({
    ...artist,
    rank: index + 1,
  }));
  const genres = computeTopGenres(history).map((genre, index) => ({
    ...genre,
    rank: index + 1,
  }));
  const entries: WrappedSearchEntry[] = [
    ...tracks.map((track) => ({
      type: "track" as const,
      key: trackKey(track.artistName, track.trackName),
      name: track.trackName,
      subtitle: track.artistName,
      ...(track.artists?.length ? { artists: track.artists } : {}),
      ...(track.spotifyTrackId
        ? { spotifyTrackId: track.spotifyTrackId }
        : {}),
      rank: track.rank,
      msPlayed: track.msPlayed,
      playCount: track.playCount,
      firstPlayDate: track.firstPlayDate,
    })),
    ...artists.map((artist) => ({
      type: "artist" as const,
      key: artist.artistName,
      name: artist.artistName,
      rank: artist.rank,
      msPlayed: artist.msPlayed,
      playCount: artist.playCount,
      firstPlayDate: artist.firstPlayDate,
    })),
    ...genres.map((genre) => ({
      type: "genre" as const,
      key: genre.genreName,
      name: genre.genreName,
      rank: genre.rank,
      msPlayed: genre.msPlayed,
      playCount: genre.playCount,
    })),
  ];
  return { history, tracks, artists, genres, entries };
};

export const searchWrappedIndex = (
  index: WrappedSearchIndex,
  query: string,
): WrappedSearchEntry[] => {
  const normalized = normalizeSearch(query);
  if (!normalized) return [];
  return index.entries.filter((entry) =>
    normalizeSearch(`${entry.name} ${entry.subtitle ?? ""}`).includes(
      normalized,
    ),
  );
};

export const findWrappedSearchEntry = (
  index: WrappedSearchIndex,
  selection: WrappedSearchSelection,
): WrappedSearchEntry | undefined =>
  index.entries.find(
    (entry) => entry.type === selection.type && entry.key === selection.key,
  );

export const wrappedEntitySlug = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "") || "-";

export const findWrappedEntryBySlug = (
  index: WrappedSearchIndex,
  type: WrappedSearchSelection["type"],
  slug: string,
  artistSlug?: string,
): WrappedSearchEntry | undefined =>
  index.entries.find((entry) => {
    if (entry.type !== type) return false;
    if (type === "track") {
      return (
        wrappedEntitySlug(entry.name) === slug &&
        wrappedEntitySlug(entry.subtitle ?? "") === (artistSlug ?? "")
      );
    }
    return wrappedEntitySlug(entry.name) === slug;
  });

export const getWrappedEntryTracks = (
  index: WrappedSearchIndex,
  entry: WrappedSearchSelection,
): WrappedDetailTrack[] => {
  const overallRanks = new Map(
    index.tracks.map((track) => [
      trackKey(track.artistName, track.trackName),
      track.rank,
    ]),
  );
  const history = index.history.filter((track) => {
    if (entry.type === "artist") {
      // Featuring credits: an artist resolved in the track's credited artist
      // list sees those plays in their detail page too.
      return (
        track.artistName === entry.key || !!track.artists?.includes(entry.key)
      );
    }
    if (entry.type === "genre") return track.genres?.includes(entry.key);
    return trackKey(track.artistName, track.trackName) === entry.key;
  });
  return computeTopTracks(history).map((track, position) => ({
    ...track,
    rank: position + 1,
    overallRank:
      overallRanks.get(trackKey(track.artistName, track.trackName)) ?? 0,
  }));
};
