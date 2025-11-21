<template>
  <div class="flex w-full flex-col items-center justify-center p-6 text-center">
    <h2 :style="style(0)" class="text-slide-title mb-8 font-bold">
      {{ $t("slideshow.topArtistsList.title") }}
    </h2>

    <div class="w-full max-w-md gap-4 space-y-4">
      <ClientOnly>
        <div
          v-for="(artist, index) in top5Artists"
          :key="artist.artistName"
          :style="style(500 + index * 200)"
          class="bg-surface-100 flex items-center rounded-lg p-3 dark:bg-white/10"
        >
          <div
            class="text-primary-500 dark:text-primary-400 mr-4 w-8 text-xl font-bold sm:text-2xl"
          >
            #{{ index + 1 }}
          </div>
          <div class="flex-1 overflow-hidden text-left">
            <div class="truncate font-bold sm:text-lg">
              {{ artist.artistName }}
            </div>
            <div class="truncate text-sm opacity-80 sm:text-base">
              {{ $t("slideshow.common.mostPlayed") }}:
              {{ artist.mostPlayedTrack }}
            </div>
          </div>
        </div>
      </ClientOnly>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { formatDuration } from "~/utils/formatters";

const { style } = useAnimationOnLoad();
const store = useWrappedStore();

useSeoMeta({
  title: $t("slideshow.topArtistsList.seo.title"),
  description: $t("slideshow.topArtistsList.seo.description"),
});

const top5Artists = computed(() => store.topArtists.slice(0, 5));
</script>
