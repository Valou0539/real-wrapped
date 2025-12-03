/**
 * Fusionne les artistes pour les morceaux ayant le même titre, la même durée,
 * et un nombre de listeners similaire (à 250000 près).
 * Si deux artistes différents ont un morceau avec ces critères,
 * on considère que c'est une collaboration et on fusionne les artistes.
 */
export const mergeArtistsForSameTracks = (
  tracks: (EnhancedMusicHistoryTrack & {
    duration: string;
    listeners: number;
  })[],
): EnhancedMusicHistoryTrack[] => {
  // Grouper par titre + durée (clé composite)
  const tracksByTitleAndDuration = new Map<
    string,
    (EnhancedMusicHistoryTrack & { duration: string; listeners: number })[]
  >();

  for (const track of tracks) {
    const key = `${track.trackName.toLowerCase().trim()}|${track.duration}`;
    const existing = tracksByTitleAndDuration.get(key) ?? [];

    // Vérifier si les listeners sont proches (à 250000 près) d'au moins un track existant
    const LISTENERS_THRESHOLD = 150000;
    const hasCloseListeners =
      existing.length === 0 ||
      existing.some(
        (t) => Math.abs(t.listeners - track.listeners) <= LISTENERS_THRESHOLD,
      );

    if (hasCloseListeners) {
      existing.push(track);
      tracksByTitleAndDuration.set(key, existing);
    }
  }

  // Map pour stocker les artistes et genres fusionnés par titre + durée
  const mergedDataByKey = new Map<
    string,
    { artists: Set<string>; genres: Set<string> }
  >();

  for (const [
    key,
    tracksWithSameTitleAndDuration,
  ] of tracksByTitleAndDuration) {
    // Collecter tous les artistes et genres uniques pour ce titre + durée
    const artists = new Set<string>();
    const genres = new Set<string>();

    for (const track of tracksWithSameTitleAndDuration) {
      const artist = track.artistsName[0];
      if (artist) artists.add(artist);
      for (const genre of track.genres) {
        genres.add(genre);
      }
    }

    if (artists.size > 1) {
      mergedDataByKey.set(key, { artists, genres });
    }
  }

  // Appliquer les fusions sur tous les tracks et retirer l'attribut duration
  return tracks.map((track) => {
    const key = `${track.trackName.toLowerCase().trim()}|${track.duration}`;
    const mergedData = mergedDataByKey.get(key);

    // Retirer duration du résultat
    const { duration, ...trackWithoutDuration } = track;

    if (mergedData && mergedData.artists.has(track.artistsName[0])) {
      return {
        ...trackWithoutDuration,
        artistsName: [...mergedData.artists],
        genres: [...mergedData.genres],
      };
    }

    return trackWithoutDuration;
  });
};
