<template>
  <button
    type="button"
    class="ui-ib"
    :aria-label="$t('layout.topbar.toggle_theme')"
    @click="
      $colorMode.preference = $colorMode.value === 'light' ? 'dark' : 'light'
    "
  >
    <ClientOnly>
      <component
        :is="$colorMode.value === 'light' ? MoonIcon : SunIcon"
        class="size-5"
        aria-hidden="true"
      />
    </ClientOnly>
  </button>
</template>

<script lang="ts" setup>
import { MoonIcon, SunIcon } from "@heroicons/vue/24/outline";
</script>
