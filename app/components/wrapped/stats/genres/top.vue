<template>
  <section class="font-wrapped flex flex-col gap-4">
    <h2
      class="font-display m-0 text-[30px] uppercase leading-none md:text-[44px]"
    >
      {{ $t("music-history.stats.genresTable.title", { count: top.length }) }}
    </h2>

    <div class="ui-table hidden md:block">
      <div
        class="ui-th"
        style="
          grid-template-columns:
            56px minmax(160px, 1.6fr) minmax(160px, 1.8fr)
            130px 100px;
        "
      >
        <span>{{
          $t("music-history.stats.genresTable.columns.position")
        }}</span>
        <span>{{ $t("music-history.stats.genresTable.columns.genre") }}</span>
        <span>{{
          $t("music-history.stats.genresTable.columns.mostPlayedArtist")
        }}</span>
        <span>{{
          $t("music-history.stats.genresTable.columns.playTime")
        }}</span>
        <span>{{ $t("music-history.stats.genresTable.columns.plays") }}</span>
      </div>
      <NuxtLinkLocale
        v-for="(genre, index) in top"
        :key="genre.genreName"
        :to="genreLink(genre.genreName)"
        class="ui-tr"
        style="
          grid-template-columns:
            56px minmax(160px, 1.6fr) minmax(160px, 1.8fr)
            130px 100px;
        "
      >
        <span :class="['ui-rk', { 'ui-rk-top': index < 3 }]">{{
          index + 1
        }}</span>
        <span class="ui-lk">{{ genre.genreName }}</span>
        <span class="ui-tx">{{ genre.mostPlayedArtist }}</span>
        <span class="ui-nu">{{ formatDuration(genre.msPlayed) }}</span>
        <span class="ui-nu">{{ genre.playCount }}</span>
      </NuxtLinkLocale>
    </div>

    <div class="md:hidden">
      <NuxtLinkLocale
        v-for="(genre, index) in top"
        :key="genre.genreName"
        :to="genreLink(genre.genreName)"
        class="min-h-15 border-wrapped-fg/10 text-wrapped-fg grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 border-b px-4 py-1.5 no-underline"
      >
        <span :class="['ui-rk text-[22px]', { 'ui-rk-top': index < 3 }]">{{
          index + 1
        }}</span>
        <span class="min-w-0">
          <span class="block truncate text-base font-bold">{{
            genre.genreName
          }}</span>
          <span class="text-wrapped-fg/80 block truncate text-sm">{{
            genre.mostPlayedArtist
          }}</span>
        </span>
        <span class="text-wrapped-fg/80 text-sm">{{
          formatDuration(genre.msPlayed)
        }}</span>
      </NuxtLinkLocale>
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { TopGenre } from "~/types/wrapped";

defineProps<{ top: TopGenre[] }>();

const { genreLink } = useWrappedEntityLinks();
</script>
