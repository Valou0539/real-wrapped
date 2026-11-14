<template>
  <WrappedSlideshowSlide>
    <div class="relative mt-[clamp(1rem,5vh,4.5rem)] flex flex-col gap-3.5">
      <p :style="style(100)" class="slide-kicker">
        {{ $t("slideshow.topHour.title") }}
      </p>
      <ClientOnly>
        <div
          :style="style(350)"
          class="slide-display text-[clamp(5rem,29vw,10.625rem)]"
        >
          {{ formattedPeakHour }}
        </div>
        <p :style="style(650)" class="slide-sub max-w-[25rem]">
          {{ subtitle }}
        </p>
      </ClientOnly>
    </div>

    <ClientOnly>
      <div v-if="hourly.length" class="mt-auto flex flex-col gap-2.5">
        <div
          class="grid-cols-24 grid h-[clamp(180px,32vh,300px)] items-end gap-1"
          aria-hidden="true"
        >
          <div
            v-for="(ms, h) in hourly"
            :key="h"
            :style="[
              style(500 + h * 40, { transform: 'scaleY(0)' }),
              { height: `${Math.max((ms / maxMs) * 100, 2)}%` },
            ]"
            class="min-h-1.5 origin-bottom rounded-t-[3px]"
            :class="h === peakHour ? 'bg-wrapped-red' : 'bg-current'"
          />
        </div>
        <div class="flex justify-between text-sm font-bold">
          <span v-for="h in hourLabels" :key="h">{{ formatHour(h) }}</span>
        </div>
      </div>
    </ClientOnly>
  </WrappedSlideshowSlide>
</template>

<script lang="ts" setup>
const { style } = useAnimationOnLoad();
const store = useWrappedStore();
const { locale, t } = useI18n();

useSeoMeta({
  title: $t("slideshow.topHour.seo.title"),
  description: $t("slideshow.topHour.seo.description"),
});

const hourly = computed(() => store.hourlyMsPlayed);
const maxMs = computed(() => Math.max(...hourly.value, 1));
const peakHour = computed(() =>
  hourly.value.length ? hourly.value.indexOf(maxMs.value) : -1,
);

const hourLabels = [0, 6, 12, 18, 23];

const formatHour = (hour: number) =>
  new Intl.DateTimeFormat(locale.value, { hour: "numeric" }).format(
    new Date(2000, 0, 1, hour),
  );

const formattedPeakHour = computed(() =>
  peakHour.value >= 0 ? formatHour(peakHour.value) : "",
);

const daypart = computed(() => {
  const h = peakHour.value;
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  if (h >= 18 && h < 23) return "evening";
  return "night";
});

const subtitle = computed(() =>
  t("slideshow.topHour.subtitle", {
    daypart: t(`slideshow.topHour.daypart.${daypart.value}`),
  }),
);
</script>
