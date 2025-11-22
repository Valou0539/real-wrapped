<template>
  <footer class="text-gray w-full py-6 text-center text-sm">
    <div
      class="flex flex-col items-center justify-center gap-1 md:flex-row md:gap-2"
    >
      <span>{{ appName }} &copy; {{ year }}</span>
      <span class="hidden md:inline">•</span>
      <span>
        {{ $t("layout.footer.created_by") }}
        <a
          href="https://valentin-gindre.fr"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-contrast underline decoration-dotted underline-offset-2 transition-colors"
        >
          Valentin Gindre
        </a>
      </span>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear();
const appName = useAppConfig().title;
</script>
