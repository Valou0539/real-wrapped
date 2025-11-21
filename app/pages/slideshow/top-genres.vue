<template>
  <div class="flex w-full flex-col items-center justify-center p-6 text-center">
    <h2 :style="style(0)" class="text-slide-title mb-8 font-bold">
      {{ $t("slideshow.topGenres.title") }}
    </h2>

    <div class="w-full max-w-md space-y-4">
      <ClientOnly>
        <div
          v-for="(genre, index) in top5Genres"
          :key="genre.genreName"
          :style="style(500 + index * 200)"
          class="bg-surface-100 flex items-center rounded-lg p-3 dark:bg-white/10"
        >
          <div
            class="text-primary-500 dark:text-primary-400 mr-4 w-8 text-xl font-bold sm:text-2xl"
          >
            #{{ index + 1 }}
          </div>
          <div class="flex-1 overflow-hidden text-left">
            <div class="truncate font-bold capitalize sm:text-lg">
              {{ genre.genreName }}
            </div>
          </div>
        </div>
      </ClientOnly>
    </div>
    <p :style="style(1500)" class="text-slide-subtitle mt-8 opacity-80">
      {{ $t("slideshow.topGenres.subtitle") }}
    </p>
  </div>
</template>

<script lang="ts" setup>
const { style } = useAnimationOnLoad();
const store = useWrappedStore();

useSeoMeta({
  title: $t("slideshow.topGenres.seo.title"),
  description: $t("slideshow.topGenres.seo.description"),
});

const top5Genres = computed(() => store.topGenres.slice(0, 5));
</script>
