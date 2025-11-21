import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import type { Slide } from "~/types/wrapped";

export function useSlideshow(items: Slide[]) {
  const route = useRoute();
  const localePath = useLocalePath();

  const isPaused = ref(false);
  const hide = ref(false);
  const mounted = ref(false);
  const timeout = ref<number | null>(null);
  const slideEnded = ref(false);

  const currentIndex = computed(() => {
    const parts = route.path.split("/");
    const index = parts.indexOf("slideshow");
    const slug = parts[index + 1] ?? "";
    return items.findIndex((i) => i.slug === slug);
  });

  const togglePause = () => {
    isPaused.value = !isPaused.value;
  };

  const changeSlide = async (slide: Slide) => {
    await navigateTo(localePath(`/slideshow/${slide.slug}`));
  };

  const goToNextSlide = async () => {
    if (currentIndex.value === items.length - 1) return;
    const next = items[currentIndex.value + 1];
    if (next) await changeSlide(next);
  };

  const goToPrevSlide = async () => {
    if (currentIndex.value === 0) return;
    const prev = items[currentIndex.value - 1];
    if (prev) await changeSlide(prev);
  };

  const startAutoSlide = () => {
    slideEnded.value = false;
    if (timeout.value) window.clearTimeout(timeout.value);

    if (currentIndex.value === items.length - 1) return;

    timeout.value = window.setTimeout(() => {
      slideEnded.value = true;
      if (isPaused.value) return;

      smoothGoToNextSlide();
    }, items[currentIndex.value]?.duration);
  };

  const smoothGoToNextSlide = () => {
    hide.value = true;

    timeout.value = window.setTimeout(async () => {
      await goToNextSlide();
      hide.value = false;
    }, 500);
  };

  watch(currentIndex, () => startAutoSlide());

  watch(isPaused, () => {
    if (!isPaused.value && slideEnded.value) {
      smoothGoToNextSlide();
    }
  });

  onMounted(() => {
    mounted.value = true;
    startAutoSlide();
  });

  onBeforeUnmount(() => {
    if (timeout.value) window.clearTimeout(timeout.value);
  });

  return {
    isPaused,
    hide,
    mounted,
    currentIndex,
    togglePause,
    goToNextSlide,
    goToPrevSlide,
  };
}
