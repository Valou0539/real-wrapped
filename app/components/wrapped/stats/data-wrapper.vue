<template>
  <template v-if="top.length">
    <slot />
  </template>
  <p v-else class="w-full py-16 text-center">
    {{ $t("music-history.stats.empty") }}
  </p>
</template>

<script lang="ts" setup>
defineProps<{ top: unknown[] }>();
</script>
