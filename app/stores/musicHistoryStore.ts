import { indexedDbStorage } from "@/utils/indexedDbStorage";

type HistoryArchive = Record<string, EnhancedMusicHistoryTrack[]>;

const ARCHIVE_KEY = "music-history-years";
const LEGACY_KEY = "music-history";

const sanitizeArchive = (value: unknown): HistoryArchive => {
  if (!value || typeof value !== "object") return {};

  return Object.fromEntries(
    Object.entries(value).filter(
      ([year, tracks]) =>
        isHistoryYear(Number(year)) &&
        Array.isArray(tracks) &&
        tracks.length > 0,
    ),
  );
};

export const useMusicHistoryStore = defineStore(
  "music-history",
  () => {
    const histories = shallowRef<HistoryArchive>({});
    const history = shallowRef<EnhancedMusicHistoryTrack[] | undefined>(
      undefined,
    );
    const jobs = ref<Record<string, number>>({});
    const selectedYear = ref<number | undefined>(undefined);
    const isImporting = ref(false);
    const isLoading = ref(false);
    const importError = ref<string | undefined>(undefined);

    let loadPromise: Promise<void> | null = null;

    const availableYears = computed(() =>
      [
        ...Object.keys(histories.value).map(Number),
        ...Object.values(jobs.value),
      ]
        .filter((year, index, all) => all.indexOf(year) === index)
        .sort((a, b) => b - a),
    );

    const activateYear = (year: number | undefined) => {
      selectedYear.value = year;
      history.value = year === undefined ? undefined : histories.value[year];
    };

    const readArchive = async (): Promise<HistoryArchive> => {
      const stored =
        await indexedDbStorage.getItem<HistoryArchive>(ARCHIVE_KEY);
      if (stored) return sanitizeArchive(stored);

      const legacy =
        await indexedDbStorage.getItem<EnhancedMusicHistoryTrack[]>(LEGACY_KEY);
      if (!Array.isArray(legacy)) return {};

      const migrated = sanitizeArchive(partitionHistoryByYear(legacy));
      if (Object.keys(migrated).length > 0) {
        await indexedDbStorage.setItem(ARCHIVE_KEY, toRaw(migrated));
      }
      return migrated;
    };

    const loadHistory = () => {
      loadPromise ??= (async () => {
        isLoading.value = true;
        try {
          histories.value = await readArchive();

          const years = availableYears.value;
          activateYear(
            selectedYear.value !== undefined &&
              years.includes(selectedYear.value)
              ? selectedYear.value
              : years[0],
          );
        } catch (error) {
          loadPromise = null;
          importError.value = "music-history.upload.errors.load-history";
          throw error;
        } finally {
          isLoading.value = false;
        }
      })();

      return loadPromise;
    };

    const saveYearHistory = async (
      year: number,
      tracks: EnhancedMusicHistoryTrack[],
    ) => {
      await loadHistory();

      if (!isHistoryYear(year)) {
        throw new Error(`Invalid history year: ${year}`);
      }

      const yearTracks = filterHistoryByYear(tracks, year);
      if (yearTracks.length === 0) {
        throw new Error(`No history tracks for year ${year}`);
      }

      const nextArchive = { ...histories.value, [year]: yearTracks };
      await indexedDbStorage.setItem(ARCHIVE_KEY, toRaw(nextArchive));

      histories.value = nextArchive;
      activateYear(year);
    };

    const saveHistory = async () => {
      if (!history.value) return;

      const [firstYear] = Object.keys(partitionHistoryByYear(history.value))
        .map(Number)
        .sort((a, b) => b - a);
      const year = selectedYear.value ?? firstYear;
      if (year === undefined) return;

      await saveYearHistory(year, history.value);
    };

    const selectYear = (year: number) => {
      if (!availableYears.value.includes(year)) return false;

      activateYear(year);
      return true;
    };

    const readYearHistory = async (
      year: number,
    ): Promise<EnhancedMusicHistoryTrack[] | undefined> => {
      if (!isHistoryYear(year)) return undefined;

      const tracks = (await readArchive())[year];
      return tracks ? [...tracks] : undefined;
    };

    const deleteHistory = async () => {
      await loadHistory();

      const year = selectedYear.value;
      if (year !== undefined && histories.value[year]) {
        const remaining = { ...histories.value };
        delete remaining[year];
        await indexedDbStorage.setItem(ARCHIVE_KEY, toRaw(remaining));
        histories.value = remaining;
      }

      activateYear(availableYears.value[0]);
      jobs.value = {};
    };

    return {
      histories,
      history,
      jobs,
      selectedYear,
      isImporting,
      isLoading,
      importError,
      availableYears,
      loadHistory,
      saveHistory,
      saveYearHistory,
      selectYear,
      readYearHistory,
      deleteHistory,
    };
  },
  {
    persist: {
      pick: ["jobs", "selectedYear"],
      storage: piniaPluginPersistedstate.localStorage(),
    },
  },
);
