<template>
  <label class="block">
    <span class="text-contrast mb-2 block text-sm/6 font-medium">{{
      label
    }}</span>
    <span class="mt-2">
      <slot />
      <Message
        v-if="!error && !!hint"
        severity="secondary"
        size="small"
        variant="simple"
      >
        {{ hint }}
      </Message>
      <Message v-if="!!error" severity="error" size="small" variant="simple">
        {{ error }}
      </Message>
    </span>
  </label>
</template>

<script lang="ts" setup>
defineProps<{
  label: string;
  error?: string;
  hint?: string;
}>();
</script>
