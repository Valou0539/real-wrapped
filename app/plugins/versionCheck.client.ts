export default defineNuxtPlugin(async () => {
  const wrappedStore = useWrappedStore();
  const musicHistoryStore = useMusicHistoryStore();
  const appConfig = useAppConfig();
  const { processHistory } = useMusicHistoryProcessor();

  // Load history from IndexedDB if not already loaded
  try {
    await musicHistoryStore.loadHistory();
  } catch (error) {
    console.error("Failed to load music history", error);
  }

  if (
    wrappedStore.processVersion &&
    wrappedStore.processVersion !== appConfig.processVersion
  ) {
    console.log(
      `Version mismatch (Store: ${wrappedStore.processVersion}, App: ${appConfig.processVersion}). Reprocessing...`,
    );
  }

  if (musicHistoryStore.history) {
    processHistory(musicHistoryStore.history);
  }
});
