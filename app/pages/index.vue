<template>
  <main class="mx-auto mt-20 w-full max-w-4xl px-4 py-16">
    <ClientOnly>
      <HistoryUpload v-if="!isWrapped" />
      <WrappedStats v-else />
    </ClientOnly>
  </main>
</template>
<script lang="ts" setup>
const { isWrapped } = storeToRefs(useWrappedStore());

useSeoMeta({
  title: $t("home.seo.title"),
  description: $t("home.seo.description"),
});
</script>
