<template>
  <main class="mx-auto mt-20 w-full max-w-4xl px-4 py-16">
    <ClientOnly>
      <WrappedEntityDetail type="artist" :name="name" />
    </ClientOnly>
  </main>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: ["wrapped"],
});

const route = useRoute();
const name = computed(() => String(route.params.name));
</script>
