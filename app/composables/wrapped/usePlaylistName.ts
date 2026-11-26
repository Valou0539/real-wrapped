export const usePlaylistName = (
  kind: "tracks" | "artists" | "entity",
  month: Ref<number | "all">,
  entityName?: Ref<string | undefined>,
) => {
  const { selectedYear } = storeToRefs(useMusicHistoryStore());
  const { t, locale } = useI18n();

  return computed(() => {
    const year = selectedYear.value ?? "";
    const base =
      kind === "tracks"
        ? "music-history.stats.playlist.name"
        : kind === "artists"
          ? "music-history.stats.playlist.name-artists"
          : "music-history.stats.playlist.name-entity";
    const params: Record<string, string | number> = { year };
    if (kind === "entity") params.name = entityName?.value ?? "";
    if (month.value !== "all") {
      params.month = new Intl.DateTimeFormat(locale.value, {
        month: "long",
      }).format(new Date(2000, month.value, 1));
    }
    return t(month.value === "all" ? base : `${base}-month`, params);
  });
};
