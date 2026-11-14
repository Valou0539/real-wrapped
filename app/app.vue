<template>
  <NuxtLoadingIndicator color="var(--color-primary-500)" />
  <Html :lang="locale">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toast />
    <ConfirmDialog
      :pt="{
        root: {
          class:
            'bg-wrapped-card! border! border-wrapped-fg/20! rounded-3xl! font-wrapped text-wrapped-fg!',
        },
        mask: { class: 'bg-wrapped-bg/80!' },
        title: {
          class: 'font-display! text-[34px]! leading-none! uppercase!',
        },
        pcCloseButton: { root: { class: 'text-wrapped-fg!' } },
        message: {
          class: 'text-[17px]! leading-normal! text-wrapped-fg/90!',
        },
      }"
    />
  </Html>
</template>
<script lang="ts" setup>
useHead({
  titleTemplate: `%s - ${useAppConfig().title}`,
});
const { locale } = useI18n();

usePrimevueI18n();
</script>
