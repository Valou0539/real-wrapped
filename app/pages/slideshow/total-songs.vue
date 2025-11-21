<template>
  <div class="flex w-full flex-col items-center justify-center p-6 text-center">
    <h2 :style="style(0)" class="text-slide-title mb-8 font-bold">
      {{ $t("slideshow.totalSongs.title") }}
    </h2>
    <ClientOnly>
      <div
        :style="style(500)"
        class="text-primary-500 dark:text-primary-400 text-slide-value mb-4 font-extrabold"
      >
        {{ store.totalPlayCount }}
      </div>
    </ClientOnly>
    <p :style="style(1000)" class="text-slide-subtitle opacity-80">
      {{ $t("slideshow.totalSongs.subtitle") }}
    </p>
  </div>
</template>

<script lang="ts" setup>
const { style } = useAnimationOnLoad();
const store = useWrappedStore();

useSeoMeta({
  title: $t("slideshow.totalSongs.seo.title"),
  description: $t("slideshow.totalSongs.seo.description"),
});
</script>
