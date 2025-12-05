<template>
  <div
    class="flex h-full flex-col items-center justify-center gap-8 pb-32 pt-16"
  >
    <!-- Equalizer Animation -->
    <div class="flex h-16 items-end justify-center gap-1">
      <div class="bg-primary-500 animate-equalizer-1 w-3 rounded-full"></div>
      <div class="bg-primary-500 animate-equalizer-2 w-3 rounded-full"></div>
      <div class="bg-primary-500 animate-equalizer-3 w-3 rounded-full"></div>
      <div class="bg-primary-500 animate-equalizer-4 w-3 rounded-full"></div>
      <div class="bg-primary-500 animate-equalizer-5 w-3 rounded-full"></div>
    </div>

    <div class="flex w-full flex-col gap-2">
      <ProgressBar :value="progress" class="h-2 w-full" :show-value="false" />
      <p class="text-surface-400 dark:text-surface-400 text-center font-medium">
        <template v-if="queuePosition">
          {{
            $t(
              "music-history.upload.queue",
              { count: queuePosition },
              queuePosition,
            )
          }}
        </template>
        <template v-else>
          {{ $t("music-history.upload.processing") }}
          <span class="text-primary-500">{{ progress }}%</span>
        </template>
      </p>
    </div>

    <!-- Cancel Button (only for pending jobs) -->
    <Button
      v-if="queuePosition"
      severity="secondary"
      outlined
      :loading="cancelling"
      @click="handleCancel"
    >
      {{ $t("music-history.upload.cancel") }}
    </Button>
  </div>
</template>

<script setup lang="ts">
const { progress, queuePosition, startTracking, cancelJob } =
  useEnhanceHistoryProgress();
const cancelling = ref(false);

const handleCancel = async () => {
  cancelling.value = true;
  await cancelJob();
  cancelling.value = false;
};

onMounted(() => {
  startTracking();
});
</script>

<style scoped>
@keyframes equalizer {
  0% {
    height: 20%;
    opacity: 0.5;
  }
  50% {
    height: 100%;
    opacity: 1;
  }
  100% {
    height: 20%;
    opacity: 0.5;
  }
}

.animate-equalizer-1 {
  animation: equalizer 1s ease-in-out infinite;
}
.animate-equalizer-2 {
  animation: equalizer 1.2s ease-in-out infinite 0.1s;
}
.animate-equalizer-3 {
  animation: equalizer 0.8s ease-in-out infinite 0.2s;
}
.animate-equalizer-4 {
  animation: equalizer 1.1s ease-in-out infinite 0.3s;
}
.animate-equalizer-5 {
  animation: equalizer 0.9s ease-in-out infinite 0.4s;
}
</style>
