<template>
  <div class="flex flex-wrap gap-1">
    <Button
      :label="$t('music-history.stats.all')"
      @click="updateParams('all')"
      :severity="selectedMonth === 'all' ? 'primary' : 'secondary'"
      rounded
    />
    <Button
      v-for="month in 12"
      :key="month"
      :label="$t(monthsKey[month - 1] ?? '')"
      :severity="month - 1 === selectedMonth ? 'primary' : 'secondary'"
      @click="updateParams(month)"
      rounded
    />
  </div>
</template>

<script lang="ts" setup>
defineProps<{ selectedMonth: "all" | number }>();

const route = useRoute();
const router = useRouter();

const updateParams = (value: string | number) => {
  router.push({
    query: {
      ...route.query,
      month: value,
    },
  });
};

const monthsKey = [
  "primevue.monthShortJanuary",
  "primevue.monthShortFebruary",
  "primevue.monthShortMarch",
  "primevue.monthShortApril",
  "primevue.monthShortMay",
  "primevue.monthShortJune",
  "primevue.monthShortJuly",
  "primevue.monthShortAugust",
  "primevue.monthShortSeptember",
  "primevue.monthShortOctober",
  "primevue.monthShortNovember",
  "primevue.monthShortDecember",
];
</script>
