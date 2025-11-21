<template>
  <header
    :class="[
      'max-w-screen fixed left-0 top-0 z-10 w-full transition-colors duration-200',
      {
        'bg-bg-light/70 dark:bg-bg-dark/70 shadow-sm backdrop-blur-lg dark:shadow-white/10':
          showBackground || !route.fullPath.startsWith(localePath('/')),
      },
    ]"
  >
    <nav
      aria-label="Global"
      class="mx-auto flex max-w-7xl items-center justify-between gap-x-6 p-6 lg:px-8"
    >
      <div class="flex lg:flex-1">
        <NuxtLinkLocale class="-m-1.5 p-1.5" to="/">
          <span class="sr-only">{{ appConfig.title }}</span>
          <SharedLogo alt="" class="h-8 w-auto" />
        </NuxtLinkLocale>
      </div>
      <div class="hidden lg:flex lg:gap-x-12">
        <NuxtLinkLocale
          v-for="item in navigation"
          :key="item.name"
          :to="item.to"
          v-show="!item.condition || item.condition()"
          class="text-contrast text-sm/6 font-semibold"
          >{{ item.name }}
        </NuxtLinkLocale>
      </div>
      <div class="flex flex-1 items-center justify-end gap-x-4">
        <LayoutSharedLangButton class="hidden lg:flex" />
        <LayoutSharedColorTheme class="hidden lg:flex" />
        <ClientOnly>
          <div v-if="isWrapped" class="flex gap-x-4">
            <Button
              class="hidden lg:flex"
              severity="secondary"
              @click="reset()"
            >
              {{ $t("layout.topbar.new-history") }}
            </Button>
            <Button :as="NuxtLinkLocale" to="/slideshow">
              {{ $t("layout.topbar.show-slideshow") }}
            </Button>
          </div>
        </ClientOnly>
      </div>
      <LayoutTopbarMobileMenu :navigation="navigation" />
    </nav>
  </header>
</template>

<script lang="ts" setup>
import { NuxtLinkLocale } from "#components";

const appConfig = useAppConfig();
const localePath = useLocalePath();

const navigation = computed<
  { name: string; to: string; condition?: () => boolean }[]
>(() => [
  {
    name: $t("layout.topbar.nav.tracks"),
    to: "/?category=tracks",
    condition: () => !!isWrapped.value,
  },
  {
    name: $t("layout.topbar.nav.artists"),
    to: "/?category=artists",
    condition: () => !!isWrapped.value,
  },
  {
    name: $t("layout.topbar.nav.genres"),
    to: "/?category=genres",
    condition: () => !!isWrapped.value,
  },
]);

const { showBackground } = useScrollBackground();

const route = useRoute();

const { reset } = useConfirmReset();

const { isWrapped } = storeToRefs(useWrappedStore());
</script>
