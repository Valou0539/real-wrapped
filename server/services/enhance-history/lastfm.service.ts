import { LastfmTrack } from "../../types/enhance-history";

const cache = new Map<string, { genres: string[]; cover: string }>();

export interface TrackEnhancement {
  genres: string[];
  cover: string;
}

export const fetchTrackInfo = async (
  track: MusicHistoryTrack,
  apiKey: string,
): Promise<TrackEnhancement> => {
  const key = `${track.artistName}-${track.trackName}`;

  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  try {
    const response = await $fetch<LastfmTrack>(
      `https://ws.audioscrobbler.com/2.0/?method=track.getinfo&api_key=${apiKey}&artist=${encodeURIComponent(track.artistName)}&track=${encodeURIComponent(track.trackName)}&format=json`,
    );

    const genres =
      response.track?.toptags.tag
        .map((t) => t.name)
        .filter((g) => g.toLowerCase() !== track.artistName.toLowerCase()) ??
      [];

    const images = response.track?.album?.image ?? [];
    const coverImage = images[images.length - 1];
    const cover = coverImage?.["#text"] ?? "";

    const data = { genres, cover };
    cache.set(key, data);

    return data;
  } catch (error) {
    console.error(`Error fetching track info for ${key}:`, error);
    return { genres: [], cover: "" };
  }
};
