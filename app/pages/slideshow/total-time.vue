<template>
  <div class="flex w-full flex-col items-center justify-center p-6 text-center">
    <h2 :style="style(0)" class="text-slide-title mb-8 font-bold">
      {{ $t("slideshow.totalTime.title") }}
    </h2>
    <ClientOnly>
      <div
        :style="style(500)"
        class="text-primary-500 dark:text-primary-400 text-slide-value mb-4 font-extrabold"
      >
        {{ formattedTime }}
      </div>
    </ClientOnly>
    <p :style="style(1000)" class="text-slide-subtitle opacity-80">
      {{ $t("slideshow.totalTime.subtitle") }}
    </p>
  </div>
</template>

<script lang="ts" setup>
const { style } = useAnimationOnLoad();
const store = useWrappedStore();

useSeoMeta({
  title: $t("slideshow.totalTime.seo.title"),
  description: $t("slideshow.totalTime.seo.description"),
});

const formattedTime = computed(() => formatDuration(store.totalPlayTime));
</script>
