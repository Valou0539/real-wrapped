<template>
  <div class="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-4">
    <div
      class="ui-card bg-wrapped-orange text-wrapped-ink col-span-2 md:col-span-1"
    >
      <div class="ui-card-lb">
        {{ $t("music-history.stats.tracksGlobal.cards.totalPlayTime") }}
      </div>
      <div class="ui-card-val">{{ formatDuration(playTime) }}</div>
    </div>
    <div class="ui-card bg-wrapped-purple text-wrapped-cream">
      <div class="ui-card-lb">
        {{ $t("music-history.stats.tracksGlobal.cards.totalSinglePlay") }}
      </div>
      <div class="ui-card-val">{{ tracksCount }}</div>
    </div>
    <div class="ui-card bg-wrapped-lime text-wrapped-ink">
      <div class="ui-card-lb">
        {{ $t("music-history.stats.tracksGlobal.cards.totalPlayCount") }}
      </div>
      <div class="ui-card-val">{{ playCount }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{ playTime: number; playCount: number; tracksCount: number }>();
</script>
