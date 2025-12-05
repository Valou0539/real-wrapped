interface JobState {
  jobId: string;
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
  result: EnhancedMusicHistoryTrack[] | null;
  error?: string;
  queuePosition?: number;
}

const POLLING_INTERVAL = 10000;

/**
 * Composable pour suivre la progression de l'enrichissement de l'historique musical via polling
 */
export const useEnhanceHistoryProgress = () => {
  const progress = ref(0);
  const queuePosition = ref<number | undefined>();
  const musicHistoryStore = useMusicHistoryStore();
  const error = ref<string | undefined>();

  let pollingInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Récupère l'état du job
   */
  const fetchJobState = async (jobId: string): Promise<JobState | null> => {
    try {
      return await $fetch<JobState>(`/api/enhance-history?jobId=${jobId}`);
    } catch (err) {
      console.error("Polling error:", err);
      return null;
    }
  };

  /**
   * Démarre le polling pour suivre la progression
   */
  const startTracking = () => {
    const jobId = musicHistoryStore.jobId;

    if (!jobId) {
      error.value = "No jobId found in store";
      console.error(error.value);
      return;
    }

    const runCheck = async () => {
      const state = await fetchJobState(jobId);

      if (!state) {
        error.value = "Failed to fetch job state";
        stopTracking();
        return;
      }

      progress.value = state.progress;
      queuePosition.value = state.queuePosition;

      if (state.status === "error") {
        error.value = state.error ?? "Unknown error";
        stopTracking();
        return;
      }

      if (state.status === "completed" && state.result) {
        stopTracking();

        musicHistoryStore.history = state.result;
        await musicHistoryStore.saveHistory();

        const { processHistory } = useMusicHistoryProcessor();
        processHistory(state.result);

        const localePath = useLocalePath();
        navigateTo(localePath("/slideshow"));
      }
    };

    runCheck();
    pollingInterval = setInterval(runCheck, POLLING_INTERVAL);
  };

  /**
   * Arrête le polling
   */
  const stopTracking = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    musicHistoryStore.jobId = undefined;
  };

  /**
   * Annule le job en cours (uniquement si en attente)
   */
  const cancelJob = async (): Promise<boolean> => {
    const jobId = musicHistoryStore.jobId;

    if (!jobId) {
      return false;
    }

    try {
      await useCancelJobRequest().execute(jobId);
      stopTracking();
      return true;
    } catch (err) {
      console.error("Failed to cancel job:", err);
      return false;
    }
  };

  // Cleanup automatique au démontage
  onBeforeUnmount(() => {
    stopTracking();
  });

  return {
    progress: readonly(progress),
    queuePosition: readonly(queuePosition),
    error: readonly(error),
    startTracking,
    stopTracking,
    cancelJob,
  };
};
