<template>
  <div class="flex w-full flex-col items-center justify-center p-6 text-center">
    <h2 :style="style(0)" class="text-slide-title mb-8 font-bold">
      {{ $t("slideshow.topSong.title") }}
    </h2>

    <div v-if="topTrack" class="flex flex-col items-center">
      <ClientOnly>
        <img
          v-if="topTrack.cover"
          :src="topTrack.cover"
          :style="style(500)"
          class="mb-6 h-48 w-48 rounded-lg object-cover shadow-lg"
          alt="Album Art"
        />

        <div
          :style="style(1000)"
          class="text-primary-500 dark:text-primary-400 text-slide-title mb-2 font-bold"
        >
          {{ topTrack.trackName }}
        </div>
        <div
          :style="style(1200)"
          class="mb-4 text-xl font-semibold sm:text-2xl"
        >
          {{ topTrack.artistName }}
        </div>

        <div :style="style(1500)" class="text-slide-subtitle opacity-80">
          {{ topTrack.playCount }} {{ $t("slideshow.topSong.plays") }}
        </div>
      </ClientOnly>
    </div>

    <p :style="style(2000)" class="text-slide-subtitle mt-8 opacity-80">
      {{ $t("slideshow.topSong.subtitle") }}
    </p>
  </div>
</template>

<script lang="ts" setup>
const { style } = useAnimationOnLoad();
const store = useWrappedStore();

useSeoMeta({
  title: $t("slideshow.topSong.seo.title"),
  description: $t("slideshow.topSong.seo.description"),
});

const topTrack = computed(() => store.topTracks[0]);
</script>
