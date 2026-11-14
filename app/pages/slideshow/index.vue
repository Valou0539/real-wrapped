<template>
  <WrappedSlideshowSlide>
    <WrappedSlideshowVinyl
      variant="ghost"
      grooves="#F3EEE3"
      center="#FF5B2E"
      hole="#121110"
      class="absolute bottom-[-8%] left-0 aspect-square w-full"
    />

    <div class="relative mt-[clamp(1.5rem,9vh,7.5rem)] flex flex-col gap-7">
      <h1
        :style="style(100)"
        class="slide-display text-wrapped-orange text-[clamp(4.5rem,21vw,8.875rem)] leading-[0.9]"
      >
        Wrapped
      </h1>
      <p :style="style(500)" class="slide-sub max-w-[24rem]">
        {{ $t("slideshow.welcome.subtitle") }}
      </p>
    </div>
  </WrappedSlideshowSlide>
</template>

<script lang="ts" setup>
const { style } = useAnimationOnLoad();

useSeoMeta({
  title: $t("slideshow.welcome.seo.title"),
  description: $t("slideshow.welcome.seo.description"),
});
</script>
