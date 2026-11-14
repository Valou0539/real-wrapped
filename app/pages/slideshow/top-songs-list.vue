<template>
  <WrappedSlideshowSlide>
    <h2
      :style="style(100)"
      class="slide-display mt-[clamp(1rem,4vh,3.5rem)] text-[clamp(2.6rem,12vw,4rem)]"
    >
      {{ $t("slideshow.topSongsList.title") }}<br /><span
        class="text-wrapped-orange"
        >{{ $t("slideshow.topSongsList.titleAccent") }}</span
      >
    </h2>

    <div class="mt-auto flex flex-col">
      <ClientOnly>
        <div
          v-for="(track, index) in top5Tracks"
          :key="track.trackName + track.artistName"
          :style="style(350 + index * 150)"
          class="border-wrapped-cream/25 grid grid-cols-[clamp(3rem,15vw,5.25rem)_minmax(0,1fr)] items-center gap-3 border-t py-[clamp(0.7rem,2vh,1.125rem)]"
        >
          <div
            class="slide-display text-wrapped-orange text-[clamp(3rem,14vw,4.75rem)] leading-none"
          >
            {{ index + 1 }}
          </div>
          <div>
            <div
              class="wrap-anywhere text-[clamp(1.1rem,4.5vw,1.5rem)] font-bold leading-tight"
            >
              {{ track.trackName }}
            </div>
            <div
              class="mt-1 text-[clamp(0.85rem,3.5vw,1.0625rem)] font-medium opacity-85"
            >
              {{ track.artistName }}
            </div>
          </div>
        </div>
      </ClientOnly>
    </div>
  </WrappedSlideshowSlide>
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
