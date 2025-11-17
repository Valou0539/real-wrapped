<template>
  <LayoutProfile>
    <NuxtPage />
  </LayoutProfile>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: "connected",
});
</script>
