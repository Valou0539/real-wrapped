import type { TopArtist, TopDate, TopGenre, TopTrack } from "~/types/wrapped";

export const useWrappedStore = defineStore(
  "wrapped",
  () => {
    const totalPlayTime = ref(0);
    const totalPlayCount = ref(0);
    const totalArtists = ref(0);
    const totalTracks = ref(0);
    const totalGenres = ref(0);
    const topDate = ref<TopDate | undefined>(undefined);

    // Detailed stats
    const topArtists = ref<TopArtist[]>([]); // Top 100
    const topGenres = ref<TopGenre[]>([]); // Top 100
    const topTracks = ref<TopTrack[]>([]); // Top 200

    // Monthly stats
    const monthlyTotalPlayTime = ref<Record<string, number>>({});
    const monthlyTotalPlayCount = ref<Record<string, number>>({});
    const monthlyTotalArtists = ref<Record<string, number>>({});
    const monthlyTotalTracks = ref<Record<string, number>>({});
    const monthlyTotalGenres = ref<Record<string, number>>({});

    const monthlyTopTracks = ref<Record<string, TopTrack[]>>({}); // Top 40 per month
    const monthlyTopArtists = ref<Record<string, TopArtist[]>>({}); // Top 20 per month
    const monthlyTopGenres = ref<Record<string, TopGenre[]>>({}); // Top 20 per month

    const processVersion = ref<string>("");

    const isWrapped = computed(() => !!processVersion.value);

    const resetAll = () => {
      totalPlayTime.value = 0;
      totalPlayCount.value = 0;
      totalArtists.value = 0;
      totalTracks.value = 0;
      totalGenres.value = 0;
      topDate.value = undefined;
      topArtists.value = [];
      topGenres.value = [];
      topTracks.value = [];
      monthlyTotalPlayTime.value = {};
      monthlyTotalPlayCount.value = {};
      monthlyTotalArtists.value = {};
      monthlyTotalTracks.value = {};
      monthlyTotalGenres.value = {};
      monthlyTopTracks.value = {};
      monthlyTopArtists.value = {};
      monthlyTopGenres.value = {};
      processVersion.value = "";
    };

    return {
      totalPlayTime,
      totalPlayCount,
      totalArtists,
      totalTracks,
      totalGenres,
      topDate,
      topArtists,
      topGenres,
      topTracks,
      monthlyTotalPlayTime,
      monthlyTotalPlayCount,
      monthlyTotalArtists,
      monthlyTotalTracks,
      monthlyTotalGenres,
      monthlyTopTracks,
      monthlyTopArtists,
      monthlyTopGenres,
      processVersion,
      isWrapped,
      resetAll,
    };
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.localStorage(),
    },
  },
);
