/**
 * Composable pour suivre la progression de l'enrichissement de l'historique musical via SSE
 */
export const useEnhanceHistoryProgress = () => {
  const progress = ref(0);
  const musicHistoryStore = useMusicHistoryStore();
  const error = ref<string | undefined>();

  let sse: EventSource | null = null;

  /**
   * Démarre l'écoute SSE pour suivre la progression
   */
  const startTracking = () => {
    const jobId = musicHistoryStore.jobId;

    if (!jobId) {
      error.value = "No jobId found in store";
      console.error(error.value);
      return;
    }

    sse = new EventSource(`/api/enhance-history?jobId=${jobId}`);

    sse.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.error) {
        error.value = data.error;
        console.error("SSE Error:", data.error);
        stopTracking();
        return;
      }

      if (data.progress !== undefined) {
        progress.value = data.progress;
      }

      if (data.done) {
        musicHistoryStore.history = data.results;

        await musicHistoryStore.saveHistory();

        const { processHistory } = useMusicHistoryProcessor();
        processHistory(data.results);

        const localePath = useLocalePath();
        navigateTo(localePath("/slideshow"));
        stopTracking();
      }
    };

    sse.onerror = (err) => {
      error.value = "SSE Connection Error";
      console.error("SSE Connection Error:", err);
      stopTracking();
    };
  };

  /**
   * Arrête l'écoute SSE
   */
  const stopTracking = () => {
    if (sse) {
      sse.close();
      sse = null;
    }
  };

  // Cleanup automatique au démontage
  onBeforeUnmount(() => {
    stopTracking();
  });

  return {
    progress: readonly(progress),
    error: readonly(error),
    startTracking,
    stopTracking,
  };
};
