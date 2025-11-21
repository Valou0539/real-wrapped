<template>
  <div class="flex w-full flex-col items-center justify-center p-6 text-center">
    <h1 :style="style(0)" class="mb-4 text-5xl font-extrabold">Wrapped</h1>
    <p :style="style(500)" class="text-2xl opacity-80">
      {{ $t("slideshow.welcome.subtitle") }}
    </p>
    <div :style="style(1000)" class="mt-12">
      <i
        class="pi pi-spin pi-spinner text-primary-500 text-4xl"
        style="animation-duration: 3s"
      ></i>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { style } = useAnimationOnLoad();

useSeoMeta({
  title: $t("slideshow.welcome.seo.title"),
  description: $t("slideshow.welcome.seo.description"),
});
</script>
