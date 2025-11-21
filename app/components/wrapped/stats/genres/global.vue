<template>
  <div class="md: my-8 grid grid-cols-1 gap-8 md:grid-cols-3">
    <Card>
      <template #title>
        {{ $t("music-history.stats.genresGlobal.cards.totalPlayTime") }}
      </template>
      <template #content>
        <p>
          {{ formatDuration(playTime) }}
        </p>
      </template>
    </Card>
    <Card>
      <template #title>
        {{ $t("music-history.stats.genresGlobal.cards.totalGenres") }}
      </template>
      <template #content>
        <p>{{ genresCount }}</p>
      </template>
    </Card>
    <Card>
      <template #title>
        {{ $t("music-history.stats.genresGlobal.cards.totalPlayCount") }}
      </template>
      <template #content>
        <p>{{ playCount }}</p>
      </template>
    </Card>
  </div>
</template>

<script lang="ts" setup>
defineProps<{ playTime: number; playCount: number; genresCount: number }>();
</script>
