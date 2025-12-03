import type { TopArtist, TopGenre, TopTrack } from "~/types/wrapped";

export const useMusicHistoryProcessor = () => {
  const wrappedStore = useWrappedStore();
  const appConfig = useAppConfig();

  const processHistory = (history: EnhancedMusicHistoryTrack[]) => {
    if (!history || history.length === 0) return;

    console.log("Starting history processing...");

    // Global Stats
    const totalPlayTime = history.reduce(
      (acc, track) => acc + track.msPlayed,
      0,
    );
    const totalPlayCount = history.length;

    const allArtists = computeTopArtists(history);
    const allGenres = computeTopGenres(history);
    const allTracks = computeTopTracks(history);

    const totalArtists = allArtists.length;
    const totalTracks = allTracks.length;
    const totalGenres = allGenres.length;

    const topDate = computeTopDate(history);

    // Top Lists
    const topArtists = allArtists.slice(0, 100);
    const topGenres = allGenres.slice(0, 50);
    const topTracks = allTracks.slice(0, 200);

    // Monthly Stats
    const monthlyTopTracks: Record<string, TopTrack[]> = {};
    const monthlyTopArtists: Record<string, TopArtist[]> = {};
    const monthlyTopGenres: Record<string, TopGenre[]> = {};

    const monthlyTotalPlayTime: Record<string, number> = {};
    const monthlyTotalPlayCount: Record<string, number> = {};
    const monthlyTotalArtists: Record<string, number> = {};
    const monthlyTotalTracks: Record<string, number> = {};
    const monthlyTotalGenres: Record<string, number> = {};

    for (let i = 0; i < 12; i++) {
      const monthHistory = filterHistoryByMonth(history, i);
      const monthKey = i.toString();

      if (monthHistory.length > 0) {
        const topTracks = computeTopTracks(monthHistory);
        const topArtists = computeTopArtists(monthHistory);
        const topGenres = computeTopGenres(monthHistory);

        monthlyTopTracks[monthKey] = topTracks.slice(0, 40);
        monthlyTopArtists[monthKey] = topArtists.slice(0, 20);
        monthlyTopGenres[monthKey] = topGenres.slice(0, 20);

        monthlyTotalPlayTime[monthKey] = monthHistory.reduce(
          (acc, track) => acc + track.msPlayed,
          0,
        );
        monthlyTotalPlayCount[monthKey] = monthHistory.length;
        monthlyTotalArtists[monthKey] = topArtists.length;
        monthlyTotalTracks[monthKey] = topTracks.length;
        monthlyTotalGenres[monthKey] = topGenres.length;
      } else {
        monthlyTopTracks[monthKey] = [];
        monthlyTopArtists[monthKey] = [];
        monthlyTopGenres[monthKey] = [];
        monthlyTotalPlayTime[monthKey] = 0;
        monthlyTotalPlayCount[monthKey] = 0;
        monthlyTotalArtists[monthKey] = 0;
        monthlyTotalTracks[monthKey] = 0;
        monthlyTotalGenres[monthKey] = 0;
      }
    }

    // Update Store
    wrappedStore.totalPlayTime = totalPlayTime;
    wrappedStore.totalPlayCount = totalPlayCount;
    wrappedStore.totalArtists = totalArtists;
    wrappedStore.totalTracks = totalTracks;
    wrappedStore.totalGenres = totalGenres;
    wrappedStore.topArtists = topArtists;
    wrappedStore.topGenres = topGenres;
    wrappedStore.topTracks = topTracks;
    wrappedStore.topDate = topDate;
    wrappedStore.monthlyTopTracks = monthlyTopTracks;
    wrappedStore.monthlyTopArtists = monthlyTopArtists;
    wrappedStore.monthlyTopGenres = monthlyTopGenres;

    wrappedStore.monthlyTotalPlayTime = monthlyTotalPlayTime;
    wrappedStore.monthlyTotalPlayCount = monthlyTotalPlayCount;
    wrappedStore.monthlyTotalArtists = monthlyTotalArtists;
    wrappedStore.monthlyTotalTracks = monthlyTotalTracks;
    wrappedStore.monthlyTotalGenres = monthlyTotalGenres;

    wrappedStore.processVersion = appConfig.processVersion;

    console.log("History processing completed.");
  };

  return {
    processHistory,
  };
};
