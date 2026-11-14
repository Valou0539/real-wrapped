<template>
  <main class="pb-18 mt-18 max-w-300 mx-auto w-full px-6 pt-10">
    <ClientOnly>
      <HistoryUploadPending v-if="pendingJobId" :job-id="pendingJobId" />
      <WrappedStats v-else-if="isWrapped" />
    </ClientOnly>
  </main>
</template>
<script lang="ts" setup>
const { isWrapped } = storeToRefs(useWrappedStore());
const { availableYears, isLoading, jobs, selectedYear, isImporting } =
  storeToRefs(useMusicHistoryStore());
const localePath = useLocalePath();

const pendingJobId = computed(() =>
  Object.keys(jobs.value).find(
    (jobId) => jobs.value[jobId] === selectedYear.value,
  ),
);

if (import.meta.client) {
  watchEffect(() => {
    const needsUpload = !availableYears.value.length || isImporting.value;
    if (
      !isLoading.value &&
      !isWrapped.value &&
      !pendingJobId.value &&
      needsUpload
    ) {
      navigateTo(localePath("/new"));
    }
  });
}

useSeoMeta({
  title: $t("home.seo.title"),
  description: $t("home.seo.description"),
});
</script>
