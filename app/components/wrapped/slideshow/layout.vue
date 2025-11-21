<template>
  <main class="relative h-dvh w-full overflow-hidden">
    <!-- Top Progress Bars & Controls -->
    <div class="absolute left-0 top-0 z-50 flex w-full items-center gap-8 p-4">
      <!-- Progress Bars -->
      <div class="flex grow gap-1">
        <NuxtLinkLocale
          v-for="(item, index) in items"
          :key="item.slug"
          :to="`/slideshow/${item.slug}`"
          class="flex-1 py-1"
        >
          <div class="bg-contrast/30 h-1 w-full overflow-hidden rounded-full">
            <div
              class="bg-contrast h-full"
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
        <Button rounded text severity="contrast" @click="togglePause">
          <template #icon>
            <component :is="isPaused ? PlayIcon : PauseIcon" class="size-5" />
          </template>
        </Button>
        <LayoutSharedColorTheme />
        <Button :as="NuxtLinkLocale" rounded text severity="contrast" to="/">
          <template #icon>
            <component :is="XMarkIcon" class="size-5" />
          </template>
        </Button>
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
