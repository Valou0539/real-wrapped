<template>
  <main
    class="font-wrapped relative h-dvh w-full overflow-hidden transition-colors duration-500"
    :style="{ backgroundColor: activeSlide?.bg, color: activeSlide?.fg }"
  >
    <!-- Top Progress Bars & Controls -->
    <div class="absolute left-0 top-0 z-50 flex w-full flex-col gap-3.5 p-4">
      <div class="flex items-center gap-8">
        <!-- Progress Bars -->
        <div class="flex grow gap-1">
          <NuxtLinkLocale
            v-for="(item, index) in items"
            :key="item.slug"
            :to="`/slideshow/${item.slug}`"
            class="flex-1 py-1"
          >
            <div class="bg-current/25 h-1 w-full overflow-hidden rounded-full">
              <div
                class="h-full bg-current"
                :class="{
                  'w-full': index < currentIndex,
                  'w-0': index > currentIndex || !mounted,
                  'animate-progress': index === currentIndex && mounted,
                }"
                :style="
                  index === currentIndex
                    ? {
                        animationDuration: `${item.duration + 500}ms`,
                      }
                    : {}
                "
              />
            </div>
          </NuxtLinkLocale>
        </div>

        <!-- Header Controls (Pause/Close) -->
        <div class="flex shrink-0 items-center justify-end gap-2">
          <Button
            rounded
            text
            severity="contrast"
            class="text-inherit"
            @click="togglePause"
          >
            <template #icon>
              <component :is="isPaused ? PlayIcon : PauseIcon" class="size-5" />
            </template>
          </Button>
          <Button
            :as="NuxtLinkLocale"
            rounded
            text
            severity="contrast"
            class="text-inherit"
            to="/"
          >
            <template #icon>
              <component :is="XMarkIcon" class="size-5" />
            </template>
          </Button>
        </div>
      </div>
    </div>

    <!-- Content Slot -->
    <div
      :class="{ 'opacity-0': hide }"
      class="relative z-10 flex size-full items-center justify-center transition-opacity duration-500 ease-in"
    >
      <slot />
    </div>

    <!-- Invisible Side Touch Zones (Mobile/Touch) -->
    <div
      class="w-1/10 absolute left-0 top-0 z-20 h-full"
      @touchend="goToPrevSlide"
    />
    <div
      class="w-1/10 absolute right-0 top-0 z-20 h-full"
      @touchend="goToNextSlide"
    />

    <!-- Visible Bottom Controls (Desktop/Manual) -->
    <div class="absolute bottom-8 right-8 z-50 flex gap-2">
      <Button
        icon="pi pi-chevron-left"
        rounded
        severity="secondary"
        @click.stop="goToPrevSlide"
        :disabled="currentIndex === 0"
      />
      <Button
        icon="pi pi-chevron-right"
        rounded
        severity="secondary"
        @click.stop="goToNextSlide"
        :disabled="currentIndex === items.length - 1"
      />
    </div>
  </main>
</template>

<script lang="ts" setup>
import { NuxtLinkLocale } from "#components";
import { PauseIcon, PlayIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import type { Slide } from "~/types/wrapped";

const props = defineProps<{
  items: Slide[];
}>();

const {
  isPaused,
  hide,
  mounted,
  currentIndex,
  togglePause,
  goToNextSlide,
  goToPrevSlide,
} = useSlideshow(props.items);

const activeSlide = computed(
  () => props.items[currentIndex.value] ?? props.items[0],
);
</script>

<style scoped>
@keyframes progress {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

.animate-progress {
  animation-name: progress;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}
</style>
