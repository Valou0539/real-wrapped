<template>
  <WrappedSlideshowSlide>
    <p
      :style="style(100)"
      class="slide-kicker relative mt-[clamp(1rem,4vh,3.5rem)]"
    >
      {{ $t("slideshow.topSong.title") }}
    </p>

    <ClientOnly>
      <div
        v-if="topTrack"
        :style="style(350)"
        class="relative mt-7 h-[calc(var(--cover)+2rem)]"
        style="--cover: clamp(190px, 62vw, 300px)"
      >
        <WrappedSlideshowVinyl
          grooves="#F3EEE3"
          center="#D6FF3D"
          hole="#121110"
          class="absolute top-0 aspect-square"
          style="left: calc(var(--cover) - 130px); height: var(--cover)"
        />
        <WrappedSpotifyCover
          :artist="topTrack.artistName"
          :track="topTrack.trackName"
          class="w-(--cover) absolute left-0 top-0 z-10"
        >
          <div
            class="flex aspect-square items-center justify-center bg-[repeating-linear-gradient(135deg,#F3EEE3_0_14px,#E4DDCE_14px_28px)] shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
          >
            <MusicalNoteIcon class="text-wrapped-ink size-16" />
          </div>
        </WrappedSpotifyCover>
      </div>

      <div v-if="topTrack" class="mt-9 flex flex-col gap-2.5">
        <div
          :style="style(600)"
          class="slide-display text-[clamp(2.3rem,11.5vw,3.875rem)] leading-none"
        >
          {{ topTrack.trackName }}
        </div>
        <div
          :style="style(750)"
          class="text-[clamp(1.1rem,4.5vw,1.625rem)] font-medium"
        >
          {{ formatTrackArtists(topTrack) }}
        </div>
        <div
          :style="style(950)"
          class="bg-wrapped-lime text-wrapped-ink mt-2 self-start rounded-full px-5 py-2.5 text-[clamp(1rem,4.5vw,1.375rem)] font-bold"
        >
          {{ topTrack.playCount }} {{ playsLabel }}
        </div>
      </div>
    </ClientOnly>

    <p :style="style(1300)" class="slide-sub mt-auto max-w-[24rem]">
      {{ $t("slideshow.topSong.subtitle") }}
    </p>
  </WrappedSlideshowSlide>
</template>

<script lang="ts" setup>
import { MusicalNoteIcon } from "@heroicons/vue/24/outline";

const { style } = useAnimationOnLoad();
const store = useWrappedStore();

useSeoMeta({
  title: $t("slideshow.topSong.seo.title"),
  description: $t("slideshow.topSong.seo.description"),
});

const topTrack = computed(() => store.topTracks[0]);
const playsLabel = computed(() =>
  (topTrack.value?.playCount ?? 0) > 1
    ? $t("slideshow.common.plays")
    : $t("slideshow.common.play"),
);
</script>
