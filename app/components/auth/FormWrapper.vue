<template>
  <main class="background flex min-h-screen flex-1 px-4 py-20">
    <div class="mx-auto w-full max-w-sm duration-300 lg:w-96 xl:transition-all">
      <div>
        <h2
          class="text-contrast mt-24 text-2xl/9 font-bold tracking-tight lg:mt-32"
        >
          {{ title }}
        </h2>
        <p class="text-gray mt-2 text-sm/6">
          {{ description }}
          {{ " " }}
          <NuxtLinkLocale class="link-primary" :to="linkTo">
            {{ linkText }}
          </NuxtLinkLocale>
        </p>
      </div>

      <Message
        v-if="errorMessage"
        severity="error"
        size="small"
        variant="simple"
        class="mt-10"
      >
        {{ errorMessage }}
      </Message>

      <div class="mt-10">
        <slot />
      </div>
    </div>
  </main>
</template>

<script lang="ts" setup>
defineProps<{
  title: string;
  description: string;
  linkTo: string;
  linkText: string;
  errorMessage?: string;
}>();
</script>
