<template>
  <div class="flex flex-col items-center gap-4 py-16">
    <ProgressBar :value="progress" class="w-full" />
    <p class="text-center">
      {{ $t("music-history.upload.processing") }} {{ progress }}%
    </p>
  </div>
</template>

<script setup lang="ts">
const { progress, startTracking } = useEnhanceHistoryProgress();

onMounted(() => {
  startTracking();
});
</script>
