<template>
  <div
    class="font-wrapped scrollbar-none flex gap-2 overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
  >
    <button
      type="button"
      :class="['ui-chip', { 'ui-chip-on': selectedMonth === 'all' }]"
      @click="updateParams('all')"
    >
      {{ $t("music-history.stats.all") }}
    </button>
    <button
      v-for="month in 12"
      :key="month"
      type="button"
      :class="['ui-chip', { 'ui-chip-on': month - 1 === selectedMonth }]"
      @click="updateParams(month)"
    >
      {{ $t(monthsKey[month - 1] ?? "") }}
    </button>
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
