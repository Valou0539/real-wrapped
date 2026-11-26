<template>
  <section class="font-wrapped flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2
        class="font-display m-0 text-[30px] uppercase leading-none md:text-[44px]"
      >
        {{
          $t("music-history.stats.artistsTable.title", { count: top.length })
        }}
      </h2>
      <WrappedStatsPlaylistButton
        v-if="playlistTracks.length"
        :tracks="playlistTracks"
        :name="playlistName"
      />
    </div>

    <div class="ui-table hidden md:block">
      <div
        class="ui-th"
        style="
          grid-template-columns:
            56px minmax(160px, 1.6fr) minmax(160px, 1.8fr)
            130px 100px 140px;
        "
      >
        <span>{{
          $t("music-history.stats.artistsTable.columns.position")
        }}</span>
        <span>{{ $t("music-history.stats.artistsTable.columns.artist") }}</span>
        <span>{{
          $t("music-history.stats.artistsTable.columns.mostPlayedTrack")
        }}</span>
        <span>{{
          $t("music-history.stats.artistsTable.columns.playTime")
        }}</span>
        <span>{{ $t("music-history.stats.artistsTable.columns.plays") }}</span>
        <span>{{
          $t("music-history.stats.artistsTable.columns.firstPlay")
        }}</span>
      </div>
      <NuxtLinkLocale
        v-for="(artist, index) in top"
        :key="artist.artistName"
        :to="artistLink(artist.artistName)"
        class="ui-tr"
        style="
          grid-template-columns:
            56px minmax(160px, 1.6fr) minmax(160px, 1.8fr)
            130px 100px 140px;
        "
      >
        <span :class="['ui-rk', { 'ui-rk-top': index < 3 }]">{{
          index + 1
        }}</span>
        <span class="ui-lk">{{ artist.artistName }}</span>
        <span class="ui-tx">{{ artist.mostPlayedTrack }}</span>
        <span class="ui-nu">{{ formatDuration(artist.msPlayed) }}</span>
        <span class="ui-nu">{{ artist.playCount }}</span>
        <span class="ui-nu">{{
          formatDate(artist.firstPlayDate, $i18n.locale)
        }}</span>
      </NuxtLinkLocale>
    </div>

    <div class="md:hidden">
      <NuxtLinkLocale
        v-for="(artist, index) in top"
        :key="artist.artistName"
        :to="artistLink(artist.artistName)"
        class="min-h-15 border-wrapped-fg/10 text-wrapped-fg grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 border-b px-4 py-1.5 no-underline"
      >
        <span :class="['ui-rk text-[22px]', { 'ui-rk-top': index < 3 }]">{{
          index + 1
        }}</span>
        <span class="min-w-0">
          <span class="block truncate text-base font-bold">{{
            artist.artistName
          }}</span>
          <span class="text-wrapped-fg/80 block truncate text-sm">{{
            artist.mostPlayedTrack
          }}</span>
        </span>
        <span class="text-wrapped-fg/80 text-sm">{{
          formatDuration(artist.msPlayed)
        }}</span>
      </NuxtLinkLocale>
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { TopArtist, TopTrack } from "~/types/wrapped";

const props = defineProps<{
  top: TopArtist[];
  month: number | "all";
  monthView?: boolean;
}>();

const { artistLink } = useWrappedEntityLinks();
const playlistName = usePlaylistName("artists", toRef(props, "month"));
const { history } = storeToRefs(useMusicHistoryStore());

// The export is one track per artist: their most-played one, in artist
// ranking order. The global track ranking is scanned once — the first track
// credited to an artist (primary or featuring) is their most-played.
const playlistTracks = computed((): TopTrack[] => {
  const year = history.value;
  if (!year?.length) return [];
  const scoped =
    props.month === "all" ? year : filterHistoryByMonth(year, props.month);
  const ranked = computeTopTracks(scoped);
  // Featuring credits mean two artists can share the same top track ("All I
  // Need" for both Air and Beth Hirsch): deduplicate, first artist wins.
  const seen = new Set<string>();
  return props.top
    .map((artist) =>
      ranked.find(
        (track) =>
          track.artistName === artist.artistName ||
          !!track.artists?.includes(artist.artistName),
      ),
    )
    .filter((track): track is TopTrack => {
      if (!track) return false;
      const key =
        track.spotifyTrackId ??
        JSON.stringify([track.artistName, track.trackName]);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
});
</script>
