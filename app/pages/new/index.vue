<template>
  <main class="mt-18 max-w-300 mx-auto w-full px-6 pb-20 pt-16">
    <ClientOnly>
      <HistoryUpload />
    </ClientOnly>
  </main>
</template>
<script lang="ts" setup>
useSeoMeta({
  title: $t("music-history.upload.app.title"),
  description: $t("music-history.upload.app.description"),
});
</script>
