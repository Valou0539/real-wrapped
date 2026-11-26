<template>
  <span
    ref="root"
    class="block size-12 shrink-0 overflow-hidden rounded-md bg-[repeating-linear-gradient(135deg,#F3EEE3_0_6px,#E4DDCE_6px_12px)]"
  >
    <img
      v-if="cover"
      :src="cover.imageUrl"
      alt=""
      loading="lazy"
      class="size-full object-cover"
      @error="cover = null"
    />
  </span>
</template>

<script lang="ts" setup>
import type { SpotifyCover } from "~~/shared/types/spotify";

const props = defineProps<{ artist: string; track: string; spotifyTrackId?: string }>();

const root = useTemplateRef("root");
const cover = shallowRef<SpotifyCover | null>(null);
let observer: IntersectionObserver | undefined;
let cleanup: (() => void) | undefined;

const load = () => {
  let active = true;
  fetchSpotifyCover(props.artist, props.track, props.spotifyTrackId).then(
    (result) => {
      if (active) cover.value = result;
    },
  );
  // A null result keeps the striped fallback: the cover is optional metadata.

  return () => {
    active = false;
  };
};

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer?.disconnect();
      observer = undefined;
      cleanup = load();
    },
    { rootMargin: "200px" },
  );

  if (root.value) observer.observe(root.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  cleanup?.();
});
</script>
