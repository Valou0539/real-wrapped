interface JobState {
  jobId: string;
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
  result: EnhancedMusicHistoryTrack[] | null;
  error?: string;
  queuePosition?: number;
}

interface TrackingSession {
  jobId: string;
  jobYear: number;
  checking: boolean;
}

const POLLING_INTERVAL = 10000;

/**
 * Composable pour suivre la progression de l'enrichissement de l'historique musical via polling
 */
export const useEnhanceHistoryProgress = (jobId: string) => {
  const progress = ref(0);
  const queuePosition = ref<number | undefined>();
  const musicHistoryStore = useMusicHistoryStore();
  const error = ref<string | undefined>();

  let tracking: TrackingSession | null = null;
  let pollingInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Récupère l'état du job
   */
  const fetchJobState = async (
    id: string,
  ): Promise<JobState | null | "missing"> => {
    try {
      return await $fetch<JobState>(`/api/enhance-history?jobId=${id}`);
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 404) return "missing";
      console.error("Polling error:", err);
      return null;
    }
  };

  /**
   * Démarre le polling pour suivre la progression
   */
  const startTracking = () => {
    const jobYear = musicHistoryStore.jobs[jobId];

    if (jobYear === undefined) {
      error.value = "music-history.upload.errors.missing-job";
      console.error("No pending job found in store");
      return;
    }

    invalidateTracking();
    error.value = undefined;

    const session: TrackingSession = { jobId, jobYear, checking: false };
    tracking = session;

    const isCurrent = () =>
      tracking === session && musicHistoryStore.jobs[jobId] === jobYear;

    const runCheck = async () => {
      if (!isCurrent() || session.checking) return;
      session.checking = true;

      try {
        const state = await fetchJobState(jobId);
        if (!isCurrent()) return;

        if (state === "missing") {
          // The job no longer exists server-side (server restart or
          // cancellation): retrying is pointless, forget it entirely.
          error.value = "music-history.upload.errors.fetch-job";
          stopTracking();
          return;
        }

        if (!state) {
          error.value = "music-history.upload.errors.fetch-job";
          stopPolling();
          return;
        }

        progress.value = state.progress;
        queuePosition.value = state.queuePosition;

        if (state.status === "error") {
          error.value = "music-history.upload.errors.job-failed";
          stopTracking();
          return;
        }

        if (state.status === "completed" && state.result) {
          stopPolling();

          await musicHistoryStore.saveYearHistory(jobYear, state.result);
          if (!isCurrent()) return;

          const { processHistory } = useMusicHistoryProcessor();
          if (musicHistoryStore.history) {
            processHistory(musicHistoryStore.history);
          }

          musicHistoryStore.isImporting = false;
          stopTracking();

          const localePath = useLocalePath();
          navigateTo(localePath("/slideshow"));
        }
      } catch (err) {
        if (!isCurrent()) return;

        console.error("Failed to complete history import:", err);
        error.value = "music-history.upload.errors.save-job";
        stopPolling();
      } finally {
        session.checking = false;
      }
    };

    runCheck();
    pollingInterval = setInterval(runCheck, POLLING_INTERVAL);
  };

  /**
   * Arrête le polling sans effacer le job
   */
  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };

  const invalidateTracking = () => {
    tracking = null;
    stopPolling();
  };

  /**
   * Arrête le polling et efface le job (job terminé ou annulé)
   */
  const stopTracking = () => {
    invalidateTracking();
    delete musicHistoryStore.jobs[jobId];
  };

  /**
   * Annule le job en cours (uniquement si en attente)
   */
  const cancelJob = async (): Promise<boolean> => {
    if (musicHistoryStore.jobs[jobId] === undefined) {
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

  // Cleanup automatique au démontage (arrête le polling mais garde le job)
  onBeforeUnmount(() => {
    invalidateTracking();
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
