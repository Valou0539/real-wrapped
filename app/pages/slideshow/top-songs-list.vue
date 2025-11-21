<template>
  <div class="flex w-full flex-col items-center justify-center p-6 text-center">
    <h2 :style="style(0)" class="text-slide-title mb-8 font-bold">
      {{ $t("slideshow.topSongsList.title") }}
    </h2>

    <div class="w-full max-w-md space-y-4">
      <ClientOnly>
        <div
          v-for="(track, index) in top5Tracks"
          :key="track.trackName + track.artistName"
          :style="style(500 + index * 200)"
          class="bg-surface-100 flex items-center rounded-lg p-3 dark:bg-white/10"
        >
          <div
            class="text-primary-500 dark:text-primary-400 mr-4 w-8 text-xl font-bold sm:text-2xl"
          >
            #{{ index + 1 }}
          </div>
          <img
            v-if="track.cover"
            :src="track.cover"
            class="mr-4 h-12 w-12 rounded object-cover"
            alt="Album Art"
          />
          <div class="flex-1 overflow-hidden text-left">
            <div class="truncate font-bold sm:text-lg">
              {{ track.trackName }}
            </div>
            <div class="truncate text-sm opacity-80 sm:text-base">
              {{ track.artistName }}
            </div>
          </div>
        </div>
      </ClientOnly>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { style } = useAnimationOnLoad();
const store = useWrappedStore();

useSeoMeta({
  title: $t("slideshow.topSongsList.seo.title"),
  description: $t("slideshow.topSongsList.seo.description"),
});

const top5Tracks = computed(() => store.topTracks.slice(0, 5));
</script>
