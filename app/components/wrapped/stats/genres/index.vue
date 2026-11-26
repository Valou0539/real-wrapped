<template>
  <template v-if="top.length">
    <WrappedStatsGenresGlobal
      :play-time="playTime"
      :play-count="playCount"
      :genres-count="genresCount"
    />
    <WrappedStatsGenresTop :top="top" />
  </template>
  <p v-else class="w-full py-16 text-center">
    {{ $t("music-history.stats.genres-unavailable") }}
  </p>
</template>

<script lang="ts" setup>
const props = defineProps<{
  month: number | "all";
  playTime: number;
  playCount: number;
}>();

const { topGenres, monthlyTopGenres, totalGenres, monthlyTotalGenres } =
  storeToRefs(useWrappedStore());

const top = computed(() => {
  return props.month === "all"
    ? topGenres.value
    : (monthlyTopGenres.value[props.month] ?? []);
});

const genresCount = computed(() => {
  return props.month === "all"
    ? totalGenres.value
    : (monthlyTotalGenres.value[props.month] ?? 0);
});
</script>
