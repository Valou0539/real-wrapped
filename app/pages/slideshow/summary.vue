<template>
  <div class="flex w-full flex-col items-center justify-center p-6 text-center">
    <h2 :style="style(0)" class="mb-6 text-3xl font-bold">
      {{ $t("slideshow.summary.title") }}
    </h2>

    <div class="grid w-full max-w-4xl grid-cols-2 gap-4">
      <!-- Top Songs -->
      <div
        :style="style(500)"
        class="bg-surface-100 rounded-lg p-4 dark:bg-white/10"
      >
        <h3 class="mb-3 text-lg font-bold opacity-90">
          {{ $t("slideshow.summary.topSongs") }}
        </h3>
        <div class="space-y-2 text-left text-sm">
          <ClientOnly>
            <div
              v-for="(track, index) in top5Tracks"
              :key="track.trackName + index"
              class="flex items-center"
            >
              <span
                class="text-primary-500 dark:text-primary-400 mr-2 w-4 font-bold"
                >{{ index + 1 }}.</span
              >
              <div class="min-w-0 flex-1 truncate">
                <span class="font-semibold">{{ track.trackName }}</span>
                <span class="ml-1 text-xs opacity-60"
                  >- {{ track.artistName }}</span
                >
              </div>
            </div>
          </ClientOnly>
        </div>
      </div>

      <!-- Top Artists -->
      <div
        :style="style(700)"
        class="bg-surface-100 rounded-lg p-4 dark:bg-white/10"
      >
        <h3 class="mb-3 text-lg font-bold opacity-90">
          {{ $t("slideshow.summary.topArtists") }}
        </h3>
        <div class="space-y-2 text-left text-sm">
          <ClientOnly>
            <div
              v-for="(artist, index) in top5Artists"
              :key="artist.artistName + index"
              class="flex items-center"
            >
              <span
                class="text-primary-500 dark:text-primary-400 mr-2 w-4 font-bold"
                >{{ index + 1 }}.</span
              >
              <div class="min-w-0 flex-1 truncate font-semibold">
                {{ artist.artistName }}
              </div>
            </div>
          </ClientOnly>
        </div>
      </div>

      <!-- Total Time -->
      <div
        :style="style(900)"
        class="bg-surface-100 flex flex-1 flex-col items-center justify-center rounded-lg p-4 dark:bg-white/10"
      >
        <div class="mb-1 text-sm opacity-70">
          {{ $t("slideshow.summary.totalTime") }}
        </div>
        <ClientOnly>
          <div class="text-primary-500 dark:text-primary-400 text-xl font-bold">
            {{ formatDuration(store.totalPlayTime) }}
          </div>
        </ClientOnly>
      </div>

      <!-- Top Genre -->
      <div
        v-if="store.topGenres.length > 0"
        :style="style(1100)"
        class="bg-surface-100 flex flex-1 flex-col items-center justify-center rounded-lg p-4 dark:bg-white/10"
      >
        <div class="mb-1 text-sm opacity-70">
          {{ $t("slideshow.summary.topGenre") }}
        </div>
        <ClientOnly>
          <div
            class="text-primary-500 dark:text-primary-400 text-xl font-bold capitalize"
          >
            {{ store.topGenres[0]?.genreName }}
          </div>
        </ClientOnly>
      </div>
    </div>

    <div :style="style(1500)" class="mt-8 text-xl font-bold">
      {{ $t("slideshow.summary.seeYou") }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { formatDuration } from "~/utils/formatters";

const { style } = useAnimationOnLoad();
const store = useWrappedStore();

useSeoMeta({
  title: $t("slideshow.summary.seo.title"),
  description: $t("slideshow.summary.seo.description"),
});

const top5Tracks = computed(() => store.topTracks.slice(0, 5));
const top5Artists = computed(() => store.topArtists.slice(0, 5));
</script>
