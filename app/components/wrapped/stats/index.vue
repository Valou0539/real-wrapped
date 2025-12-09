<template>
  <Tabs :value="category" @update:value="updateParams($event)">
    <TabList class="bg-transparent">
      <Tab value="tracks">{{ $t("music-history.stats.tracks") }}</Tab>
      <Tab value="artists">{{ $t("music-history.stats.artists") }}</Tab>
      <Tab value="genres">{{ $t("music-history.stats.genres") }}</Tab>
    </TabList>
    <TabPanels class="bg-transparent">
      <TabPanel value="tracks">
        <SharedMonthSelector :selected-month="month" />
        <WrappedStatsTracks
          :month="month"
          :play-time="playTime"
          :play-count="playCount"
        />
      </TabPanel>
      <TabPanel value="artists">
        <SharedMonthSelector :selected-month="month" />
        <WrappedStatsArtists
          :month="month"
          :play-time="playTime"
          :play-count="playCount"
        />
      </TabPanel>
      <TabPanel value="genres">
        <SharedMonthSelector :selected-month="month" />
        <WrappedStatsGenres
          :month="month"
          :play-time="playTime"
          :play-count="playCount"
        />
      </TabPanel>
    </TabPanels>
  </Tabs>
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
