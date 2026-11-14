<template>
  <WrappedSlideshowSlide>
    <h2
      :style="style(100)"
      class="slide-display text-wrapped-orange mt-[clamp(0.5rem,2.5vh,2.25rem)] text-[clamp(3rem,13vw,4.5rem)]"
    >
      {{ $t("slideshow.summary.title") }}
    </h2>

    <div class="mt-[clamp(0.9rem,2.5vh,1.375rem)] grid grid-cols-2 gap-3">
      <!-- Top Songs -->
      <div
        :style="style(300)"
        class="bg-wrapped-cream text-wrapped-ink col-span-2 flex flex-col gap-2.5 rounded-[20px] p-[18px_20px]"
      >
        <div class="text-sm font-bold uppercase tracking-[0.12em]">
          {{ $t("slideshow.summary.topSongs") }}
        </div>
        <ClientOnly>
          <div
            v-for="(track, index) in top5Tracks"
            :key="track.trackName + index"
            class="flex gap-2 text-base font-medium leading-snug"
          >
            <b class="font-display min-w-4 font-normal">{{ index + 1 }}.</b>
            <span class="wrap-anywhere min-w-0"
              >{{ track.trackName }} - {{ track.artistName }}</span
            >
          </div>
        </ClientOnly>
      </div>

      <!-- Top Artists -->
      <div
        :style="style(450)"
        class="bg-wrapped-purple flex flex-col gap-2.5 rounded-[20px] p-[18px_20px]"
      >
        <div class="text-sm font-bold uppercase tracking-[0.12em]">
          {{ $t("slideshow.summary.topArtists") }}
        </div>
        <ClientOnly>
          <div
            v-for="(artist, index) in top5Artists"
            :key="artist.artistName + index"
            class="flex gap-2 text-base font-medium leading-snug"
          >
            <b class="font-display min-w-4 font-normal">{{ index + 1 }}.</b>
            <span class="wrap-anywhere min-w-0">{{ artist.artistName }}</span>
          </div>
        </ClientOnly>
      </div>

      <!-- Total Time & Top Genre -->
      <div class="flex min-w-0 flex-col gap-3">
        <div
          :style="style(600)"
          class="bg-wrapped-orange text-wrapped-ink flex flex-1 flex-col justify-between gap-2.5 rounded-[20px] p-[18px_20px]"
        >
          <div class="text-sm font-bold uppercase tracking-[0.12em]">
            {{ $t("slideshow.summary.totalTime") }}
          </div>
          <ClientOnly>
            <div
              class="slide-display wrap-anywhere text-[clamp(1.7rem,7vw,2.625rem)]"
            >
              {{ formatDuration(store.totalPlayTime) }}
            </div>
          </ClientOnly>
        </div>
        <div
          v-if="store.topGenres.length > 0"
          :style="style(750)"
          class="bg-wrapped-lime text-wrapped-ink flex flex-1 flex-col justify-between gap-2.5 rounded-[20px] p-[18px_20px]"
        >
          <div class="text-sm font-bold uppercase tracking-[0.12em]">
            {{ $t("slideshow.summary.topGenre") }}
          </div>
          <ClientOnly>
            <div
              class="slide-display wrap-anywhere text-[clamp(1.7rem,7vw,2.625rem)] capitalize"
            >
              {{ store.topGenres[0]?.genreName }}
            </div>
          </ClientOnly>
        </div>
      </div>
    </div>

    <p
      :style="style(1000)"
      class="slide-display mt-auto text-[clamp(1.9rem,8.5vw,2.75rem)]"
    >
      {{ $t("slideshow.summary.seeYou") }}
    </p>
  </WrappedSlideshowSlide>
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
