<template>
  <WrappedSlideshowSlide>
    <div class="relative mt-[clamp(1rem,6vh,5rem)] flex flex-col gap-3.5">
      <p :style="style(100)" class="slide-kicker">
        {{ $t("slideshow.totalSongs.title") }}
      </p>
      <ClientOnly>
        <div
          :style="style(400)"
          class="slide-display text-wrapped-red text-[clamp(5rem,29vw,10.625rem)]"
        >
          {{ store.totalPlayCount }}
        </div>
        <p :style="style(700)" class="slide-sub max-w-[25rem]">
          <strong class="font-bold">{{
            $t("slideshow.totalSongs.times")
          }}</strong>
          {{ $t("slideshow.totalSongs.subtitle") }}
        </p>
      </ClientOnly>
    </div>

    <div class="mt-auto grid grid-cols-12 gap-2" aria-hidden="true">
      <span
        v-for="(hi, i) in dots"
        :key="i"
        class="animate-slide-pop aspect-square rounded-full"
        :class="hi ? 'bg-wrapped-red' : 'bg-current opacity-[0.14]'"
        :style="{ animationDelay: `${800 + i * 12}ms` }"
      />
    </div>
  </WrappedSlideshowSlide>
</template>

<script lang="ts" setup>
const { style } = useAnimationOnLoad();
const store = useWrappedStore();

useSeoMeta({
  title: $t("slideshow.totalSongs.seo.title"),
  description: $t("slideshow.totalSongs.seo.description"),
});

const dots = Array.from({ length: 72 }, (_, i) => (i * 13) % 7 < 3);
</script>
