<template>
  <WrappedSlideshowLayout :items="items">
    <NuxtPage />
  </WrappedSlideshowLayout>
</template>

<script lang="ts" setup>
import type { Slide } from "~/types/wrapped";

definePageMeta({
  middleware: ["wrapped"],
  layout: false,
});

const items: Slide[] = [
  {
    slug: "",
    duration: 3000,
  },
  {
    slug: "total-time",
    duration: 5000,
  },
  {
    slug: "top-day",
    duration: 5000,
  },
  {
    slug: "total-songs",
    duration: 5000,
  },
  {
    slug: "top-song",
    duration: 6000,
  },
  {
    slug: "top-songs-list",
    duration: 8000,
  },
  {
    slug: "top-artist",
    duration: 6000,
  },
  {
    slug: "top-artists-list",
    duration: 8000,
  },
  {
    slug: "top-genres",
    duration: 7000,
  },
  {
    slug: "summary",
    duration: 0,
  },
];
</script>
