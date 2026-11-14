<template>
  <WrappedSlideshowSlide>
    <h2
      :style="style(100)"
      class="slide-display mt-[clamp(1rem,4vh,3.5rem)] text-[clamp(2.6rem,12vw,4rem)]"
    >
      {{ $t("slideshow.topGenres.title") }}
    </h2>

    <div
      class="mt-[clamp(1.5rem,5vh,3rem)] flex flex-col gap-[clamp(1rem,3vh,1.625rem)]"
    >
      <ClientOnly>
        <div
          v-for="(genre, index) in top5Genres"
          :key="genre.genreName"
          class="flex flex-col gap-2.5"
        >
          <div
            :style="style(300 + index * 150)"
            class="slide-display flex items-baseline gap-3.5 text-[clamp(1.7rem,7.5vw,2.5rem)]"
          >
            <i
              class="min-w-[1.625rem] text-[clamp(1rem,4.5vw,1.375rem)] not-italic opacity-85"
              >{{ index + 1 }}</i
            >
            <span class="wrap-anywhere capitalize">{{ genre.genreName }}</span>
          </div>
          <div
            :style="[
              style(400 + index * 150, { transform: 'scaleX(0)' }),
              { width: `${barWidth(genre.msPlayed)}%` },
            ]"
            class="h-3.5 origin-left rounded-full"
            :class="index === 0 ? 'bg-wrapped-lime' : 'bg-wrapped-cream'"
          />
        </div>
      </ClientOnly>
    </div>

    <p :style="style(1400)" class="slide-sub mt-auto max-w-[24rem]">
      {{ $t("slideshow.topGenres.subtitle") }}
    </p>
  </WrappedSlideshowSlide>
</template>

<script lang="ts" setup>
const { style } = useAnimationOnLoad();
const store = useWrappedStore();

useSeoMeta({
  title: $t("slideshow.topGenres.seo.title"),
  description: $t("slideshow.topGenres.seo.description"),
});

const top5Genres = computed(() => store.topGenres.slice(0, 5));
const topMs = computed(() => store.topGenres[0]?.msPlayed || 1);
const barWidth = (ms: number) =>
  Math.max(Math.round((ms / topMs.value) * 100), 4);
</script>
