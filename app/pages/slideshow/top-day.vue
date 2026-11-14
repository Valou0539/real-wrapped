<template>
  <WrappedSlideshowSlide>
    <div class="relative mt-[clamp(1rem,5vh,4.5rem)] flex flex-col gap-3.5">
      <p :style="style(100)" class="slide-kicker text-wrapped-orange">
        {{ $t("slideshow.topDay.title") }}
      </p>
      <ClientOnly>
        <div
          :style="style(350)"
          class="slide-display text-[clamp(3rem,15vw,6.5rem)] leading-none"
        >
          {{ formattedDate }}
        </div>
        <div
          :style="style(600)"
          class="slide-display text-wrapped-orange text-[clamp(1.9rem,9vw,3.25rem)]"
        >
          {{ formattedDuration }}
        </div>
        <p :style="style(850)" class="slide-sub mt-2 max-w-[24rem]">
          {{ $t("slideshow.topDay.subtitle") }}
        </p>
      </ClientOnly>
    </div>

    <div class="mt-auto flex flex-col gap-3.5">
      <ClientOnly>
        <div class="gap-0.75 flex flex-col" aria-hidden="true">
          <div
            v-for="(month, m) in calendar"
            :key="m"
            class="gap-0.75 grid grid-cols-[1.1rem_repeat(31,minmax(0,1fr))] items-center"
          >
            <span class="text-xs font-bold leading-none opacity-85">{{
              month.label
            }}</span>
            <span
              v-for="(day, d) in month.days"
              :key="day.key"
              class="rounded-xs aspect-square"
              :class="[
                day.hidden
                  ? 'invisible'
                  : [levelClass(day), 'animate-slide-pop'],
              ]"
              :style="cellStyle(m, d, day)"
            />
          </div>
        </div>
      </ClientOnly>
      <p :style="style(3300)" class="text-sm leading-snug opacity-85">
        {{ $t("slideshow.topDay.caption") }}
      </p>
    </div>
  </WrappedSlideshowSlide>
</template>

<script lang="ts" setup>
import type { CSSProperties } from "vue";

const { style } = useAnimationOnLoad();
const store = useWrappedStore();
const musicHistoryStore = useMusicHistoryStore();
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

const year = computed(
  () =>
    musicHistoryStore.selectedYear ??
    Number(store.topDate?.day.split("-")[0]) ??
    new Date().getFullYear(),
);

interface DayCell {
  key: string;
  level: number;
  hidden: boolean;
}

const calendar = computed(() => {
  const max = store.topDate?.msPlayed || 1;

  return Array.from({ length: 12 }, (_, m) => ({
    label: formatDate(`${year.value}-${m + 1}-15`, locale.value, {
      month: "narrow",
    }),
    days: Array.from({ length: 31 }, (_, d): DayCell => {
      const day = d + 1;
      const hidden = day > new Date(year.value, m + 1, 0).getDate();
      const key = `${year.value}-${String(m + 1).padStart(2, "0")}-${String(
        day,
      ).padStart(2, "0")}`;
      const ms = store.dailyMsPlayed[key] ?? 0;
      const ratio = ms / max;
      const level = !ms
        ? 0
        : ratio < 0.25
          ? 1
          : ratio < 0.5
            ? 2
            : ratio < 0.75
              ? 3
              : 4;

      return { key, level, hidden };
    }),
  }));
});

const LEVEL_CLASSES = [
  "bg-wrapped-cream/15",
  "bg-wrapped-heat-1",
  "bg-wrapped-heat-2",
  "bg-wrapped-heat-3",
  "bg-wrapped-orange",
];

const levelClass = (day: DayCell) =>
  day.key === store.topDate?.day
    ? "bg-wrapped-cream"
    : LEVEL_CLASSES[day.level];

const WAVE_START = 700;
const WAVE_STEP = 5;
const PEAK_POP = 3000;

const peakStyle = {
  // Pops after the year fills, then keeps pulsing its ring.
  animation: `slide-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${PEAK_POP}ms both, peak-pulse 1.5s ease-in-out ${PEAK_POP + 400}ms infinite`,
  boxShadow: "0 0 0 2px #121110, 0 0 0 4px #F3EEE3",
  zIndex: 10,
};

const cellStyle = (m: number, d: number, day: DayCell): CSSProperties => {
  if (day.key === store.topDate?.day) return peakStyle;
  if (day.hidden) return {};
  return { animationDelay: `${WAVE_START + (m * 31 + d) * WAVE_STEP}ms` };
};
</script>
