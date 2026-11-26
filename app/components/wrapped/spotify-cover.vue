<template>
  <div>
    <a
      v-if="cover"
      :href="cover.albumUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="flex flex-col items-start gap-2"
      :aria-label="$t('music-history.spotify.open-album')"
    >
      <img
        :src="cover.imageUrl"
        alt=""
        class="aspect-square w-full rounded object-contain md:rounded-lg"
        @error="
          cover = null;
          unavailable = true;
        "
      />
      <span class="inline-flex rounded bg-white px-1.5 py-0.5">
        <img src="/spotify-logo.svg" alt="Spotify" class="h-auto w-[72px]" />
      </span>
    </a>
    <slot v-else :unavailable="unavailable" />
  </div>
</template>

<script lang="ts" setup>
import type { SpotifyCover } from "~~/shared/types/spotify";

const props = defineProps<{ artist: string; track: string }>();

const cover = shallowRef<SpotifyCover | null>(null);
const unavailable = ref(false);

onMounted(() => {
  watch(
    () => [props.artist, props.track] as const,
    async ([artist, track], _, onCleanup) => {
      let active = true;
      onCleanup(() => {
        active = false;
      });
      cover.value = null;
      unavailable.value = false;
      if (!artist.trim() || !track.trim()) return;

      const result = await fetchSpotifyCover(artist, track);
      if (!active) return;
      if (result) {
        cover.value = result;
      } else {
        unavailable.value = true;
      }
    },
    { immediate: true },
  );
});
</script>
