import { indexedDbStorage } from "@/utils/indexedDbStorage";

export const useMusicHistoryStore = defineStore("music-history", () => {
  const history = ref<EnhancedMusicHistoryTrack[] | undefined>(undefined);
  const jobId = ref<string | undefined>(undefined);

  const loadHistory = async () => {
    const data =
      await indexedDbStorage.getItem<EnhancedMusicHistoryTrack[]>(
        "music-history",
      );
    if (data) {
      history.value = data;
    }
  };

  const saveHistory = async () => {
    if (history.value) {
      await indexedDbStorage.setItem("music-history", toRaw(history.value));
    }
  };

  const deleteHistory = async () => {
    await indexedDbStorage.removeItem("music-history");
    history.value = undefined;
    jobId.value = undefined;
  };

  return {
    history,
    jobId,
    loadHistory,
    saveHistory,
    deleteHistory,
  };
});
