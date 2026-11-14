<template>
  <div class="font-wrapped flex flex-col gap-6">
    <div
      class="scrollbar-none flex gap-3 overflow-x-auto [-ms-overflow-style:none] lg:hidden [&::-webkit-scrollbar]:hidden"
      role="tablist"
    >
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        role="tab"
        :aria-selected="category === tab.value"
        :class="['ui-tab', { 'ui-tab-on': category === tab.value }]"
        @click="updateParams(tab.value)"
      >
        {{ $t(tab.label) }}
      </button>
    </div>

    <SharedMonthSelector :selected-month="month" />

    <WrappedStatsTracks
      v-if="category === 'tracks'"
      :month="month"
      :play-time="playTime"
      :play-count="playCount"
    />
    <WrappedStatsArtists
      v-else-if="category === 'artists'"
      :month="month"
      :play-time="playTime"
      :play-count="playCount"
    />
    <WrappedStatsGenres
      v-else
      :month="month"
      :play-time="playTime"
      :play-count="playCount"
    />
  </div>
</template>

<script lang="ts" setup>
const router = useRouter();
const route = useRoute();

const {
  totalPlayTime,
  monthlyTotalPlayTime,
  totalPlayCount,
  monthlyTotalPlayCount,
} = storeToRefs(useWrappedStore());

const tabs = [
  { value: "tracks", label: "music-history.stats.tracks" },
  { value: "artists", label: "music-history.stats.artists" },
  { value: "genres", label: "music-history.stats.genres" },
] as const;

const category = computed(() => {
  return (route.query.category as string) || "tracks";
});
const month = computed(() => {
  if (!route.query.month) return "all";

  return route.query.month === "all" ? "all" : Number(route.query.month) - 1;
});

const playTime = computed(() => {
  return month.value === "all"
    ? totalPlayTime.value
    : (monthlyTotalPlayTime.value[month.value] ?? 0);
});

const playCount = computed(() => {
  return month.value === "all"
    ? totalPlayCount.value
    : (monthlyTotalPlayCount.value[month.value] ?? 0);
});

const updateParams = (value: string | number) => {
  router.push({
    query: {
      ...route.query,
      category: value,
    },
  });
};
</script>
