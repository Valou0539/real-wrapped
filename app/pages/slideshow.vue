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
    duration: 4000,
    bg: "#121110",
    fg: "#F3EEE3",
  },
  {
    slug: "total-time",
    duration: 5500,
    bg: "#FF5B2E",
    fg: "#121110",
  },
  {
    slug: "total-songs",
    duration: 5500,
    bg: "#F3EEE3",
    fg: "#121110",
  },
  {
    slug: "top-day",
    duration: 7500,
    bg: "#121110",
    fg: "#F3EEE3",
  },
  {
    slug: "top-hour",
    duration: 6500,
    bg: "#D6FF3D",
    fg: "#121110",
  },
  {
    slug: "top-song",
    duration: 6500,
    bg: "#5A3CEE",
    fg: "#F3EEE3",
  },
  {
    slug: "top-songs-list",
    duration: 8000,
    bg: "#121110",
    fg: "#F3EEE3",
  },
  {
    slug: "top-artist",
    duration: 6500,
    bg: "#FF5B2E",
    fg: "#121110",
  },
  {
    slug: "top-artists-list",
    duration: 8000,
    bg: "#F3EEE3",
    fg: "#121110",
  },
  {
    slug: "top-genres",
    duration: 7500,
    bg: "#5A3CEE",
    fg: "#F3EEE3",
  },
  {
    slug: "summary",
    duration: 0,
    bg: "#121110",
    fg: "#F3EEE3",
  },
];
</script>
