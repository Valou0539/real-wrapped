<template>
  <SharedPopupMenu id="lang_menu" :items="items" rounded>
    <Button as="span" text rounded class="p-2" severity="contrast">
      <span class="sr-only">{{ $t("layout.topbar.toggle_lang_menu") }}</span>
      <LanguageIcon class="size-5" />
    </Button>
  </SharedPopupMenu>
</template>

<script lang="ts" setup>
import { LanguageIcon } from "@heroicons/vue/24/solid";
import type { MenuItem } from "primevue/menuitem";
import { computed } from "vue";

const { locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();

const items = computed<MenuItem[]>(() => {
  return locales.value.map(
    (lang): MenuItem => ({
      icon:
        lang.code === locale.value
          ? "pi pi-check text-primary-500 dark:text-primary-400"
          : "pi pi-times !opacity-0",
      label: lang.name,
      to: switchLocalePath(lang.code),
    }),
  );
});
</script>
