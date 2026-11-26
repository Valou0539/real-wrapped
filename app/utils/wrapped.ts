import type { TopArtist, TopDate, TopGenre, TopTrack } from "~/types/wrapped";

export const computeDailyMsPlayed = (
  history: EnhancedMusicHistoryTrack[],
): Record<string, number> => {
  return history.reduce<Record<string, number>>((acc, track) => {
    const date = new Date(track.endTime).toISOString().split("T")[0] as string;
    acc[date] = (acc[date] ?? 0) + track.msPlayed;
    return acc;
  }, {});
};

export const computeTopDate = (
  history: EnhancedMusicHistoryTrack[],
): TopDate | undefined => {
  if (!history.length) return undefined;

  const dailyMsPlayed = computeDailyMsPlayed(history);

  const [day, msPlayed] = Object.entries(dailyMsPlayed).sort(
    (a, b) => b[1] - a[1],
  )[0] as [string, number];

  return { day, msPlayed };
};

export const computeHourlyMsPlayed = (
  history: EnhancedMusicHistoryTrack[],
): number[] => {
  const hours = new Array<number>(24).fill(0);

  history.forEach((track) => {
    const hour = new Date(track.endTime).getHours();
    hours[hour] = (hours[hour] ?? 0) + track.msPlayed;
  });

  return hours;
};

export const computeTopArtists = (
  history: EnhancedMusicHistoryTrack[],
): TopArtist[] => {
  if (!history.length) return [];

  const map = history.reduce<
    Record<string, TopArtist & { trackStats: Record<string, number> }>
  >((acc, track) => {
    const trackName = track.trackName;
    // A play credits every artist resolved at import (featurings), each with
    // the full listening time — no splitting. Legacy/unresolved rows credit
    // the export artist only.
    const credited = track.artists?.length ? track.artists : [track.artistName];

    for (const artist of new Set(credited)) {
      if (!acc[artist]) {
        acc[artist] = {
          artistName: artist,
          msPlayed: 0,
          playCount: 0,
          mostPlayedTrack: trackName,
          firstPlayDate: track.endTime,
          trackStats: {},
        };
      }
      const current = acc[artist];

      current.msPlayed += track.msPlayed;
      current.playCount += 1;

      // Mise à jour des stats de morceaux
      current.trackStats[trackName] =
        (current.trackStats[trackName] || 0) + track.msPlayed;

      // Recalcul du top morceau total
      const [topTrack] = Object.entries(current.trackStats).sort(
        (a, b) => b[1] - a[1],
      )[0] as [string, number];

      current.mostPlayedTrack = topTrack;

      // Mise à jour date du premier play
      if (new Date(track.endTime) < new Date(current.firstPlayDate)) {
        current.firstPlayDate = track.endTime;
      }
    }

    return acc;
  }, {});

  return Object.values(map)
    .map(({ trackStats, ...artist }) => artist)
    .sort((a, b) => b.msPlayed - a.msPlayed);
};

export const computeTopTracks = (
  history: EnhancedMusicHistoryTrack[],
): TopTrack[] => {
  if (!history.length) return [];

  const map = history.reduce<Record<string, TopTrack>>((acc, track) => {
    const key = `${track.artistName}::${track.trackName}`;

    if (!acc[key]) {
      acc[key] = {
        trackName: track.trackName,
        artistName: track.artistName,
        // Resolution is consistent per artist+track key, so carrying the
        // first occurrence's credited artists is enough.
        ...(track.artists?.length ? { artists: track.artists } : {}),
        msPlayed: track.msPlayed,
        playCount: 1,
        firstPlayDate: track.endTime,
      };
    } else {
      acc[key].msPlayed += track.msPlayed;
      acc[key].playCount += 1;

      if (new Date(track.endTime) < new Date(acc[key].firstPlayDate)) {
        acc[key].firstPlayDate = track.endTime;
      }
    }

    return acc;
  }, {});

  return Object.values(map).sort((a, b) => b.msPlayed - a.msPlayed);
};

export const computeTopGenres = (
  history: EnhancedMusicHistoryTrack[],
): TopGenre[] => {
  if (!history.length) return [];

  const genreMap = history.reduce<
    Record<
      string,
      { msPlayed: number; playCount: number; artists: Record<string, number> }
    >
  >((acc, track) => {
    const genres = track.genres ?? [];

    genres.forEach((genre) => {
      if (!acc[genre]) {
        acc[genre] = {
          msPlayed: track.msPlayed,
          playCount: 1,
          artists: { [track.artistName]: track.msPlayed },
        };
      } else {
        acc[genre].msPlayed += track.msPlayed;
        acc[genre].playCount += 1;
        acc[genre].artists[track.artistName] =
          (acc[genre].artists[track.artistName] ?? 0) + track.msPlayed;
      }
    });

    return acc;
  }, {});

  return Object.entries(genreMap)
    .map<TopGenre>(([genreName, data]) => {
      const mostPlayedArtist =
        Object.entries(data.artists).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";

      return {
        genreName,
        mostPlayedArtist,
        msPlayed: data.msPlayed,
        playCount: data.playCount,
      };
    })
    .sort((a, b) => b.msPlayed - a.msPlayed);
};
