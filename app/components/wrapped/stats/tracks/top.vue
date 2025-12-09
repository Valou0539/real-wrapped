<template>
  <div class="my-8">
    <div class="mb-4 flex items-baseline justify-between gap-4">
      <h2 class="text-xl font-semibold">
        {{
          $t("music-history.stats.tracksTable.title", {
            count: top.length,
          })
        }}
      </h2>
    </div>
    <div class="border-low-contrast overflow-hidden rounded-lg border">
      <DataTable :value="top" table-class="text-sm min-w-2xl">
        <Column
          :header="$t('music-history.stats.tracksTable.columns.position')"
          style="width: 4rem"
        >
          <template #body="{ index }">
            {{ index + 1 }}
          </template>
        </Column>
        <Column :header="$t('music-history.stats.tracksTable.columns.title')">
          <template #body="{ data }">
            <div class="flex items-center gap-3">
              <img
                v-if="data.cover && !data.coverError"
                :src="data.cover"
                alt="cover"
                class="size-10 shrink-0 rounded object-cover"
                @error="data.coverError = true"
                loading="lazy"
              />
              <div v-else class="size-10 shrink-0 rounded bg-gray-200"></div>
              <span class="font-medium">{{ data.trackName }}</span>
            </div>
          </template>
        </Column>
        <Column :header="$t('music-history.stats.tracksTable.columns.artist')">
          <template #body="{ data }">
            {{ data.artistName }}
          </template>
        </Column>
        <Column
          :header="$t('music-history.stats.tracksTable.columns.playTime')"
        >
          <template #body="{ data }">
            {{ formatDuration(data.msPlayed) }}
          </template>
        </Column>
        <Column :header="$t('music-history.stats.tracksTable.columns.plays')">
          <template #body="{ data }">
            {{ data.playCount }}
          </template>
        </Column>
        <Column
          :header="$t('music-history.stats.tracksTable.columns.firstPlay')"
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
import type { TopTrack } from "~/types/wrapped";

defineProps<{ top: TopTrack[] }>();
</script>
