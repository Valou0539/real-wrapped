<template>
  <NuxtLoadingIndicator color="var(--color-primary-500)" />
  <Html :lang="locale">
    <NuxtLayout>
      <div
        class="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-8 lg:mx-0 lg:max-w-none"
      >
        <div class="flex flex-col items-center gap-3">
          <span class="text-primary-500 text-sm font-semibold tracking-wide">
            {{ statusCode }}
          </span>
          <h1 class="text-contrast text-3xl font-semibold sm:text-4xl">
            {{ title }}
          </h1>
          <p class="text-gray max-w-xl text-center text-base">
            {{ description }}
          </p>
          <p
            v-if="errorDetails"
            class="max-w-xl text-sm text-gray-400 dark:text-gray-600"
          >
            {{ errorDetails }}
          </p>
        </div>
        <div class="flex w-full max-w-md flex-col gap-2 sm:flex-row">
          <Button
            :as="NuxtLink"
            severity="secondary"
            outlined
            class="flex-1"
            type="button"
            @click="$router.back()"
          >
            {{ $t("error.actions.back") }}
          </Button>
          <Button
            :as="NuxtLinkLocale"
            class="flex-1"
            type="button"
            :to="localePath('/')"
          >
            {{ $t("error.actions.home") }}
          </Button>
        </div>
      </div>
    </NuxtLayout>
  </Html>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";
import { NuxtLink, NuxtLinkLocale } from "#components";

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
