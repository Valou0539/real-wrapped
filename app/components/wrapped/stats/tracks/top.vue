<template>
  <section class="font-wrapped flex flex-col gap-4">
    <h2
      class="font-display m-0 text-[30px] uppercase leading-none md:text-[44px]"
    >
      {{ $t("music-history.stats.tracksTable.title", { count: top.length }) }}
    </h2>

    <div class="ui-table hidden md:block">
      <div
        class="ui-th"
        style="
          grid-template-columns:
            56px 48px minmax(160px, 2fr) minmax(140px, 1.4fr)
            130px 100px 140px;
        "
      >
        <span>{{
          $t("music-history.stats.tracksTable.columns.position")
        }}</span>
        <span></span>
        <span>{{ $t("music-history.stats.tracksTable.columns.title") }}</span>
        <span>{{ $t("music-history.stats.tracksTable.columns.artist") }}</span>
        <span>{{
          $t("music-history.stats.tracksTable.columns.playTime")
        }}</span>
        <span>{{ $t("music-history.stats.tracksTable.columns.plays") }}</span>
        <span>{{
          $t("music-history.stats.tracksTable.columns.firstPlay")
        }}</span>
      </div>
      <NuxtLinkLocale
        v-for="(track, index) in top"
        :key="JSON.stringify([track.artistName, track.trackName])"
        :to="trackLink(track.artistName, track.trackName)"
        class="ui-tr"
        style="
          grid-template-columns:
            56px 48px minmax(160px, 2fr) minmax(140px, 1.4fr)
            130px 100px 140px;
        "
      >
        <span :class="['ui-rk', { 'ui-rk-top': index < 3 }]">{{
          index + 1
        }}</span>
        <WrappedTrackCover
          :artist="track.artistName"
          :track="track.trackName"
        />
        <span class="ui-lk">{{ track.trackName }}</span>
        <span class="ui-lk">{{ formatTrackArtists(track) }}</span>
        <span class="ui-nu">{{ formatDuration(track.msPlayed) }}</span>
        <span class="ui-nu">{{ track.playCount }}</span>
        <span class="ui-nu">{{
          formatDate(track.firstPlayDate, $i18n.locale)
        }}</span>
      </NuxtLinkLocale>
    </div>

    <div class="md:hidden">
      <NuxtLinkLocale
        v-for="(track, index) in top"
        :key="JSON.stringify([track.artistName, track.trackName])"
        :to="trackLink(track.artistName, track.trackName)"
        class="min-h-15 border-wrapped-fg/10 text-wrapped-fg grid grid-cols-[36px_48px_minmax(0,1fr)_auto] items-center gap-3 border-b px-4 py-1.5 no-underline"
      >
        <span :class="['ui-rk text-[22px]', { 'ui-rk-top': index < 3 }]">{{
          index + 1
        }}</span>
        <WrappedTrackCover
          :artist="track.artistName"
          :track="track.trackName"
        />
        <span class="min-w-0">
          <span class="block truncate text-base font-bold">{{
            track.trackName
          }}</span>
          <span class="text-wrapped-fg/80 block truncate text-sm">{{
            formatTrackArtists(track)
          }}</span>
        </span>
        <span class="text-wrapped-fg/80 text-sm">{{
          formatDuration(track.msPlayed)
        }}</span>
      </NuxtLinkLocale>
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { TopTrack } from "~/types/wrapped";

defineProps<{ top: TopTrack[] }>();

const { trackLink } = useWrappedEntityLinks();
</script>
