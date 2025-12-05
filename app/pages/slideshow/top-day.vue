<template>
  <div class="flex w-full flex-col items-center justify-center p-6 text-center">
    <h2 :style="style(0)" class="text-slide-title mb-8 font-bold">
      {{ $t("slideshow.topDay.title") }}
    </h2>
    <ClientOnly>
      <div
        :style="style(500)"
        class="text-primary-500 dark:text-primary-400 text-slide-value mb-2 font-extrabold"
      >
        {{ formattedDate }}
      </div>
      <div :style="style(1000)" class="mb-4 text-2xl font-bold sm:text-3xl">
        {{ formattedDuration }}
      </div>
    </ClientOnly>
    <p :style="style(1500)" class="text-slide-subtitle opacity-80">
      {{ $t("slideshow.topDay.subtitle") }}
    </p>
  </div>
</template>

<script lang="ts" setup>
const { style } = useAnimationOnLoad();
const store = useWrappedStore();
const { locale } = useI18n();

useSeoMeta({
  title: $t("slideshow.topDay.seo.title"),
  description: $t("slideshow.topDay.seo.description"),
});

const formattedDate = computed(() =>
  store.topDate
    ? formatDate(store.topDate.day, locale.value, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "",
);
const formattedDuration = computed(() =>
  store.topDate ? formatDuration(store.topDate.msPlayed) : "",
);
</script>
