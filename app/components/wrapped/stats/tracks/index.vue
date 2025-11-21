<template>
  <WrappedStatsDataWrapper :top="top">
    <WrappedStatsTracksGlobal
      :play-time="playTime"
      :play-count="playCount"
      :tracks-count="tracksCount"
    />
    <WrappedStatsTracksTop :top="top" />
  </WrappedStatsDataWrapper>
</template>

<script lang="ts" setup>
const props = defineProps<{
  month: number | "all";
  playTime: number;
  playCount: number;
}>();

const { topTracks, monthlyTopTracks, totalTracks, monthlyTotalTracks } =
  storeToRefs(useWrappedStore());

const top = computed(() => {
  return props.month === "all"
    ? topTracks.value
    : (monthlyTopTracks.value[props.month] ?? []);
});

const tracksCount = computed(() => {
  return props.month === "all"
    ? totalTracks.value
    : (monthlyTotalTracks.value[props.month] ?? 0);
});
</script>
