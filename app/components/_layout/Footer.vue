<template>
  <footer
    class="border-wrapped-fg/15 bg-wrapped-bg font-wrapped text-wrapped-fg/80 w-full border-t px-10 py-7 text-center text-[15px]"
  >
    {{ appName }} &copy; {{ year }} •
    {{ $t("layout.footer.created_by") }}
    <a
      href="https://valentin-gindre.fr"
      target="_blank"
      rel="noopener noreferrer"
      class="hover:text-wrapped-fg underline underline-offset-2 transition-colors"
    >
      Valentin Gindre
    </a>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear();
const appName = useAppConfig().title;
</script>
