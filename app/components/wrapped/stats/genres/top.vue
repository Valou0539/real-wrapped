<template>
  <div class="my-8">
    <div class="mb-4 flex items-baseline justify-between gap-4">
      <h2 class="text-xl font-semibold">
        {{
          $t("music-history.stats.genresTable.title", {
            count: top.length,
          })
        }}
      </h2>
    </div>
    <div class="border-low-contrast overflow-hidden rounded-lg border">
      <DataTable :value="top" table-class="text-sm min-w-2xl">
        <Column
          :header="$t('music-history.stats.genresTable.columns.position')"
          style="width: 4rem"
        >
          <template #body="{ index }">
            {{ index + 1 }}
          </template>
        </Column>
        <Column :header="$t('music-history.stats.genresTable.columns.genre')">
          <template #body="{ data }">
            {{ data.genreName }}
          </template>
        </Column>
        <Column
          :header="
            $t('music-history.stats.genresTable.columns.mostPlayedArtist')
          "
        >
          <template #body="{ data }">
            {{ data.mostPlayedArtist }}
          </template>
        </Column>
        <Column
          :header="$t('music-history.stats.genresTable.columns.playTime')"
        >
          <template #body="{ data }">
            {{ formatDuration(data.msPlayed) }}
          </template>
        </Column>
        <Column :header="$t('music-history.stats.genresTable.columns.plays')">
          <template #body="{ data }">
            {{ data.playCount }}
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TopGenre } from "~/types/wrapped";

defineProps<{ top: TopGenre[] }>();
</script>
