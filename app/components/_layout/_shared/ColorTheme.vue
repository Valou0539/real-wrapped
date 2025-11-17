<template>
  <Button
    aria-hidden="true"
    @click="
      $colorMode.preference = $colorMode.value === 'light' ? 'dark' : 'light'
    "
    text
    rounded
    class="p-2"
    severity="contrast"
  >
    <ClientOnly>
      <component
        :is="$colorMode.value === 'light' ? MoonIcon : SunIcon"
        class="size-5"
      />
    </ClientOnly>
  </Button>
</template>

<script lang="ts" setup>
import { MoonIcon, SunIcon } from "@heroicons/vue/24/outline";
</script>
