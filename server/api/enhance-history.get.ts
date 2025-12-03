import { LastfmTrack } from "../types/enhance-history";
import { mergeArtistsForSameTracks } from "../utils/mergeArtists";

const cache = new Map<string, any>();
const CONCURRENCY = 25;

export default defineEventHandler(async (event) => {
  const res = event.node.res;
  const query = getQuery(event);
  const jobId = query.jobId as string;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const send = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  if (!globalThis.__enhanceHistoryJobs) {
    globalThis.__enhanceHistoryJobs = new Map();
  }

  const job = globalThis.__enhanceHistoryJobs.get(jobId);

  if (!job) {
    send({ error: "Job not found" });
    return res.end();
  }

  const total = job.tracks.length;
  let done = 0;
  const results: (EnhancedMusicHistoryTrack & {
    duration: string;
    listeners: number;
  })[] = [];
  const apiKey = useRuntimeConfig().lastfmApiKey;

  // Split into chunks of size CONCURRENCY
  const chunks = [];
  for (let i = 0; i < total; i += CONCURRENCY) {
    chunks.push(job.tracks.slice(i, i + CONCURRENCY));
  }

  for (const chunk of chunks) {
    const promises = chunk.map(async (track) => {
      const key = `${track.artistName}-${track.trackName}`;

      let data = cache.get(key);

      if (!data) {
        let genres: string[] = [];
        let cover: string = "";
        let duration: string = "";
        let listeners: number = 0;

        try {
          const response = await $fetch<LastfmTrack>(
            `https://ws.audioscrobbler.com/2.0/?method=track.getinfo&api_key=${apiKey}&artist=${track.artistName}&track=${track.trackName}&format=json`,
          );

          genres =
            response.track?.toptags.tag
              .map((t) => t.name)
              .filter(
                (g) => g.toLowerCase() !== track.artistName.toLowerCase(),
              ) ?? [];

          const images = response.track?.album?.image ?? [];
          const coverImage = images[images.length - 1];

          cover = coverImage?.["#text"] ?? "";

          duration = response.track?.duration ?? "";
          listeners = Number(response.track?.listeners ?? 0);
        } catch (error) {
          console.log(track);
          console.error(error);
          genres = [];
          cover = "";
          duration = "";
          listeners = 0;
        }

        data = { genres, cover, duration, listeners };
        cache.set(key, data);
      }

      results.push({
        endTime: track.endTime,
        trackName: track.trackName,
        artistsName: [track.artistName],
        msPlayed: track.msPlayed,
        genres: data.genres,
        cover: data.cover,
        duration: data.duration,
        listeners: data.listeners,
      });

      done++;
      const percent = Math.floor((done / total) * 100);
      job.progress = percent;
      send({ progress: percent });
    });

    await Promise.all(promises);
  }

  const mergedResults: EnhancedMusicHistoryTrack[] =
    mergeArtistsForSameTracks(results);
  job.result = mergedResults;
  send({ done: true, results: mergedResults });

  setTimeout(() => {
    globalThis.__enhanceHistoryJobs.delete(jobId);
  }, 60000);

  res.end();
});
