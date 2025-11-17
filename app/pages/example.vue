<template>
  <main class="p-64">
    <div v-if="pending">Loading...</div>
    <div v-else>{{ data }}</div>
    <Button @click="refresh()" class="mt-4">Refresh</Button>
  </main>
</template>
<script lang="ts" setup>
definePageMeta({
  middleware: "connected",
});
useSeoMeta({
  title: "Example",
  description: "Example",
});

const { data, pending, refresh } = await useAsyncData("example", () =>
  useAuthFetch().execute("/api/example"),
);
</script>
