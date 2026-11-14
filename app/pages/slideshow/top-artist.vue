<template>
  <WrappedSlideshowSlide>
    <WrappedSlideshowVinyl
      grooves="#FF5B2E"
      center="#D6FF3D"
      :hole="''"
      :groove-opacity="0.5"
      class="max-w-100 absolute bottom-[-25%] left-[12%] aspect-square w-[75%]"
    />

    <div class="relative mt-[clamp(1rem,5vh,4rem)] flex flex-col gap-4">
      <p :style="style(100)" class="slide-kicker">
        {{ $t("slideshow.topArtist.title") }}
      </p>
      <ClientOnly>
        <template v-if="topArtist">
          <div
            :style="style(350)"
            class="slide-display text-[clamp(3.5rem,20vw,7.375rem)]"
          >
            {{ topArtist.artistName }}
          </div>

          <div class="mt-4 flex flex-col gap-3.5">
            <div
              :style="style(600)"
              class="flex flex-wrap items-baseline gap-3"
            >
              <span
                class="slide-display text-[clamp(2.2rem,10vw,3.5rem)] leading-none"
                >{{ formatDuration(topArtist.msPlayed) }}</span
              >
              <span class="text-[clamp(1.05rem,4.5vw,1.5rem)] font-medium">{{
                $t("slideshow.common.listened")
              }}</span>
            </div>
            <div
              :style="style(800)"
              class="flex flex-wrap items-baseline gap-3"
            >
              <span
                class="slide-display text-[clamp(2.2rem,10vw,3.5rem)] leading-none"
                >{{ topArtist.playCount }}</span
              >
              <span class="text-[clamp(1.05rem,4.5vw,1.5rem)] font-medium">{{
                playsLabel
              }}</span>
            </div>
          </div>

          <p
            :style="style(1100)"
            class="mt-5 text-[clamp(1.3rem,5.5vw,1.875rem)] font-bold leading-tight"
          >
            {{ $t("slideshow.topArtist.subtitle") }}
          </p>
        </template>
      </ClientOnly>
    </div>
  </WrappedSlideshowSlide>
</template>

<script lang="ts" setup>
import { formatDuration } from "~/utils/formatters";

const { style } = useAnimationOnLoad();
const store = useWrappedStore();

useSeoMeta({
  title: $t("slideshow.topArtist.seo.title"),
  description: $t("slideshow.topArtist.seo.description"),
});

const topArtist = computed(() => store.topArtists[0]);
const playsLabel = computed(() =>
  (topArtist.value?.playCount ?? 0) > 1
    ? $t("slideshow.common.plays")
    : $t("slideshow.common.play"),
);
</script>
