export const getDefaultHistoryYear = (): number => new Date().getFullYear();

export const useHistoryLibrary = () => {
  const musicHistoryStore = useMusicHistoryStore();
  const { processHistory } = useMusicHistoryProcessor();
  const localePath = useLocalePath();

  const { availableYears, selectedYear, isImporting, isLoading, importError } =
    storeToRefs(musicHistoryStore);

  const isSelectorDisabled = computed(() => isLoading.value);

  const selectYear = (year: number) => {
    if (isSelectorDisabled.value) return;
    if (!musicHistoryStore.selectYear(year)) return;

    isImporting.value = false;
    if (musicHistoryStore.history) {
      processHistory(musicHistoryStore.history);
    }

    if (useRoute().path === localePath("/new")) {
      navigateTo(localePath("/"));
    }
  };

  const beginImport = () => {
    if (isSelectorDisabled.value) return;

    importError.value = undefined;
    isImporting.value = true;
    navigateTo(localePath("/new"));
  };

  const cancelImport = () => {
    if (isSelectorDisabled.value) return;

    isImporting.value = false;
    navigateTo(localePath("/"));
  };

  return {
    availableYears,
    selectedYear,
    isSelectorDisabled,
    selectYear,
    beginImport,
    cancelImport,
  };
};
