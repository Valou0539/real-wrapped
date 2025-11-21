<template>
  <WrappedStatsDataWrapper :top="top">
    <WrappedStatsArtistsGlobal
      :play-time="playTime"
      :play-count="playCount"
      :artists-count="artistsCount"
    />
    <WrappedStatsArtistsTop :top="top" />
  </WrappedStatsDataWrapper>
</template>

<script lang="ts" setup>
const props = defineProps<{
  month: number | "all";
  playTime: number;
  playCount: number;
}>();

const { topArtists, monthlyTopArtists, totalArtists, monthlyTotalArtists } =
  storeToRefs(useWrappedStore());

const top = computed(() => {
  return props.month === "all"
    ? topArtists.value
    : (monthlyTopArtists.value[props.month] ?? []);
});

const artistsCount = computed(() => {
  return props.month === "all"
    ? totalArtists.value
    : (monthlyTotalArtists.value[props.month] ?? 0);
});
</script>
