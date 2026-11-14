<template>
  <SharedPopupMenu id="lang_menu" :items="items" rounded>
    <span class="ui-btn" :class="{ 'w-full': full }">
      <span class="sr-only">{{ $t("layout.topbar.toggle_lang_menu") }}</span>
      {{ full ? localeFull : locale.toUpperCase() }}
    </span>
  </SharedPopupMenu>
</template>

<script lang="ts" setup>
import type { MenuItem } from "primevue/menuitem";
import { computed } from "vue";

const props = withDefaults(defineProps<{ full?: boolean }>(), { full: false });

const { locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();

const localeFull = computed(() => {
  return locales.value.find((l) => l.code === locale.value)?.name;
});

const items = computed<MenuItem[]>(() => {
  return locales.value.map((lang): MenuItem => ({
    icon:
      lang.code === locale.value
        ? "pi pi-check text-wrapped-orange"
        : "pi pi-times opacity-0!",
    label: lang.name,
    to: switchLocalePath(lang.code),
  }));
});
</script>
