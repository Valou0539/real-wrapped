<template>
  <div class="my-8">
    <div class="mb-4 flex items-baseline justify-between gap-4">
      <h2 class="text-xl font-semibold">
        {{
          $t("music-history.stats.artistsTable.title", {
            count: top.length,
          })
        }}
      </h2>
    </div>
    <div class="border-low-contrast overflow-hidden rounded-lg border">
      <DataTable :value="top" table-class="text-sm min-w-2xl">
        <Column
          :header="$t('music-history.stats.artistsTable.columns.position')"
          style="width: 4rem"
        >
          <template #body="{ index }">
            {{ index + 1 }}
          </template>
        </Column>
        <Column :header="$t('music-history.stats.artistsTable.columns.artist')">
          <template #body="{ data }">
            {{ data.artistName }}
          </template>
        </Column>
        <Column
          :header="
            $t('music-history.stats.artistsTable.columns.mostPlayedTrack')
          "
        >
          <template #body="{ data }">
            {{ data.mostPlayedTrack }}
          </template>
        </Column>
        <Column
          :header="$t('music-history.stats.artistsTable.columns.playTime')"
        >
          <template #body="{ data }">
            {{ formatDuration(data.msPlayed) }}
          </template>
        </Column>
        <Column :header="$t('music-history.stats.artistsTable.columns.plays')">
          <template #body="{ data }">
            {{ data.playCount }}
          </template>
        </Column>
        <Column
          :header="$t('music-history.stats.artistsTable.columns.firstPlay')"
        >
          <template #body="{ data }">
            {{ formatDate(data.firstPlayDate, $i18n.locale) }}
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TopArtist } from "~/types/wrapped";

defineProps<{ top: TopArtist[]; monthView?: boolean }>();
</script>
