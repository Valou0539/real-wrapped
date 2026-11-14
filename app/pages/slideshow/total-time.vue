<template>
  <WrappedSlideshowSlide>
    <svg
      class="-right-42.5 -bottom-42.5 absolute size-[min(96vw,520px)]"
      viewBox="0 0 520 520"
      aria-hidden="true"
    >
      <circle
        cx="260"
        cy="260"
        r="250"
        fill="none"
        stroke="#121110"
        stroke-width="3"
      />
      <g stroke="#121110" stroke-width="3" opacity="0.5">
        <line x1="260" y1="20" x2="260" y2="50" />
        <line x1="260" y1="470" x2="260" y2="500" />
        <line x1="20" y1="260" x2="50" y2="260" />
        <line x1="470" y1="260" x2="500" y2="260" />
      </g>
      <line
        x1="260"
        y1="260"
        x2="260"
        y2="70"
        stroke="#121110"
        stroke-width="12"
        stroke-linecap="round"
        class="transform-view origin-center animate-[vinyl-spin_8s_linear_infinite]"
      />
      <line
        x1="260"
        y1="260"
        x2="120"
        y2="330"
        stroke="#121110"
        stroke-width="12"
        stroke-linecap="round"
        class="transform-view origin-center animate-[vinyl-spin_60s_linear_infinite]"
      />
      <circle cx="260" cy="260" r="16" fill="#121110" />
    </svg>

    <div class="relative mt-[clamp(1.5rem,8vh,7rem)] flex flex-col gap-5">
      <p :style="style(100)" class="slide-kicker">
        {{ $t("slideshow.totalTime.title") }}
      </p>
      <ClientOnly>
        <div
          :style="style(400)"
          class="slide-display text-[clamp(4.5rem,26vw,9.375rem)]"
        >
          {{ formattedTime }}
        </div>
        <p :style="style(700)" class="slide-sub">
          {{ $t("slideshow.totalTime.subtitle") }}
        </p>
        <div
          v-if="listeningDays >= 1"
          :style="style(1000)"
          class="px-4.5 mt-2 self-start rounded-full border-2 border-current py-2.5 text-lg font-bold"
        >
          {{ daysLabel }}
        </div>
      </ClientOnly>
    </div>
  </WrappedSlideshowSlide>
</template>

<script lang="ts" setup>
const { style } = useAnimationOnLoad();
const store = useWrappedStore();

useSeoMeta({
  title: $t("slideshow.totalTime.seo.title"),
  description: $t("slideshow.totalTime.seo.description"),
});

const formattedTime = computed(() => formatDuration(store.totalPlayTime));
const listeningDays = computed(() =>
  Math.floor(store.totalPlayTime / 86_400_000),
);
const daysLabel = computed(() =>
  listeningDays.value === 1
    ? $t("slideshow.totalTime.daysSingular", { days: listeningDays.value })
    : $t("slideshow.totalTime.daysPlural", { days: listeningDays.value }),
);
</script>
