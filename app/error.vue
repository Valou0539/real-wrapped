<template>
  <NuxtLoadingIndicator color="var(--color-wrapped-orange)" />
  <Html :lang="locale">
    <NuxtLayout>
      <main
        class="font-wrapped mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center gap-6 px-6 py-12 text-center"
      >
        <div
          v-if="statusCode === 404"
          aria-hidden="true"
          class="font-display text-wrapped-orange flex items-center gap-2 leading-none"
          style="font-size: clamp(6rem, 20vw, 15rem)"
        >
          <span>4</span>
          <svg
            viewBox="0 0 190 190"
            class="animate-vinyl-spin h-[0.8em] w-[0.8em]"
          >
            <circle cx="95" cy="95" r="92" fill="var(--color-wrapped-fg)" />
            <g fill="none" stroke="var(--color-wrapped-bg)" stroke-width="2">
              <circle cx="95" cy="95" r="76" />
              <circle cx="95" cy="95" r="62" />
              <circle cx="95" cy="95" r="48" />
            </g>
            <circle cx="95" cy="95" r="30" fill="#FF5B2E" />
            <circle cx="95" cy="95" r="6" fill="var(--color-wrapped-bg)" />
          </svg>
          <span>4</span>
        </div>
        <span
          v-else
          class="font-display text-wrapped-orange leading-none"
          style="font-size: clamp(4rem, 12vw, 8rem)"
        >
          {{ statusCode }}
        </span>

        <h1
          class="font-display m-0 text-[clamp(2.25rem,6vw,3.5rem)] uppercase leading-none"
        >
          {{ title }}
        </h1>
        <p class="text-wrapped-fg/90 m-0 max-w-lg text-lg leading-normal">
          {{ description }}
        </p>
        <p v-if="errorDetails" class="text-wrapped-fg/50 max-w-xl text-sm">
          {{ errorDetails }}
        </p>
        <div class="mt-2 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            class="ui-btn h-13! px-7 text-[17px] font-bold"
            @click="$router.back()"
          >
            {{ $t("error.actions.back") }}
          </button>
          <NuxtLinkLocale
            :to="localePath('/')"
            class="ui-btn ui-cta h-13! px-7 text-[17px]"
          >
            {{ $t("error.actions.home") }}
          </NuxtLinkLocale>
        </div>
      </main>
    </NuxtLayout>
  </Html>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";
import { NuxtLinkLocale } from "#components";

const props = defineProps<{ error: NuxtError }>();

const localePath = useLocalePath();
const { locale } = useI18n();

const statusCode = computed(() => props.error.statusCode ?? 500);

const statusKey = computed(() =>
  ["404", "403", "500"].includes(String(statusCode.value))
    ? String(statusCode.value)
    : "default",
);

const title = computed(() => $t(`error.title.${statusKey.value}`));
const description = computed(() => $t(`error.description.${statusKey.value}`));

const errorDetails = computed(
  () =>
    props.error.statusMessage ||
    (typeof props.error.message === "string" ? props.error.message : ""),
);

useSeoMeta({
  title: `${statusCode.value} · ${title.value}`,
  description: description.value,
});
</script>
