<template>
  <NuxtLoadingIndicator color="var(--color-primary-500)" />
  <Html :lang="locale">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toast />
  </Html>
</template>
<script lang="ts" setup>
useHead({
  titleTemplate: `%s - ${useAppConfig().title}`,
});
const { locale } = useI18n();

usePrimevueI18n();
</script>
