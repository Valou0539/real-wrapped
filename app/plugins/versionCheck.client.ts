export default defineNuxtPlugin(async () => {
  const wrappedStore = useWrappedStore();
  const musicHistoryStore = useMusicHistoryStore();
  const appConfig = useAppConfig();
  const { processHistory } = useMusicHistoryProcessor();

  if (
    wrappedStore.processVersion &&
    wrappedStore.processVersion !== appConfig.processVersion
  ) {
    console.log(
      `Version mismatch (Store: ${wrappedStore.processVersion}, App: ${appConfig.processVersion}). Reprocessing...`,
    );

    // Load history from IndexedDB if not already loaded
    if (!musicHistoryStore.history) {
      await musicHistoryStore.loadHistory();
    }

    if (musicHistoryStore.history) {
      processHistory(musicHistoryStore.history);
    }
  }
});
