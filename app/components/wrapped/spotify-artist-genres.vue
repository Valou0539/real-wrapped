<template>
  <section v-if="artistGenres" class="flex flex-col gap-2">
    <h2 class="text-wrapped-fg/80 m-0 text-sm font-bold">
      {{ $t("music-history.spotify.artist-genres") }}
    </h2>
    <div class="flex flex-wrap items-center gap-2">
      <NuxtLinkLocale
        v-for="genre in artistGenres.genres"
        :key="genre"
        :to="genreLink(genre)"
        class="border-wrapped-fg/20 ui-lk rounded-full border px-3 py-1 text-sm capitalize no-underline"
        >{{ genre }}</NuxtLinkLocale
      >
      <a
        :href="artistGenres.artistUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex rounded bg-white px-1.5 py-0.5"
        :aria-label="$t('music-history.spotify.open-artist')"
      >
        <img src="/spotify-logo.svg" alt="Spotify" class="h-auto w-[72px]" />
      </a>
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { SpotifyArtistGenres } from "~~/shared/types/spotify";

const props = defineProps<{ artist: string }>();

const { genreLink } = useWrappedEntityLinks();
const artistGenres = shallowRef<SpotifyArtistGenres | null>(null);

onMounted(() => {
  watch(
    () => props.artist,
    async (artist, _, onCleanup) => {
      const controller = new AbortController();
      onCleanup(() => controller.abort());
      artistGenres.value = null;
      if (!artist.trim()) return;

      try {
        const response = await $fetch<{
          artistGenres: SpotifyArtistGenres | null;
        }>("/api/spotify/artist-genres", {
          query: { artist },
          signal: controller.signal,
          retry: 0,
        });
        if (!controller.signal.aborted) {
          artistGenres.value = response.artistGenres;
        }
      } catch {
        // Catalog metadata is optional and must not block the artist details.
      }
    },
    { immediate: true },
  );
});
</script>
