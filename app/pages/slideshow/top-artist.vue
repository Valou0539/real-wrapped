<template>
  <div class="flex w-full flex-col items-center justify-center p-6 text-center">
    <h2 :style="style(0)" class="text-slide-title mb-8 font-bold">
      {{ $t("slideshow.topArtist.title") }}
    </h2>

    <div v-if="topArtist" class="flex flex-col items-center">
      <ClientOnly>
        <div
          :style="style(1000)"
          class="text-primary-500 dark:text-primary-400 text-slide-value mb-4 font-bold"
        >
          {{ topArtist.artistName }}
        </div>

        <div :style="style(1200)" class="mb-2 text-xl opacity-80 sm:text-2xl">
          {{ formatDuration(topArtist.msPlayed) }}
          {{ $t("slideshow.common.listened") }}
        </div>
        <div :style="style(1400)" class="text-lg opacity-60 sm:text-xl">
          {{ topArtist.playCount }} {{ $t("slideshow.common.plays") }}
        </div>
      </ClientOnly>
    </div>

    <p :style="style(2000)" class="text-slide-subtitle mt-8 opacity-80">
      {{ $t("slideshow.topArtist.subtitle") }}
    </p>
  </div>
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
</script>
