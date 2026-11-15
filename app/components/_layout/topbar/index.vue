<template>
  <header
    class="max-w-screen border-wrapped-fg/15 bg-wrapped-bg font-wrapped text-wrapped-fg fixed left-0 top-0 z-10 w-full border-b"
  >
    <nav
      aria-label="Global"
      class="min-h-18 mx-auto flex max-w-7xl items-center gap-x-5 px-4 py-3 lg:px-10"
    >
      <NuxtLinkLocale
        class="text-wrapped-fg mr-1 flex shrink-0 items-center gap-2.5 no-underline"
        to="/"
      >
        <svg
          width="30"
          height="30"
          viewBox="0 0 30 30"
          aria-hidden="true"
          class="shrink-0"
        >
          <circle cx="15" cy="15" r="14" fill="var(--color-wrapped-fg)" />
          <circle
            cx="15"
            cy="15"
            r="9"
            fill="none"
            stroke="var(--color-wrapped-bg)"
            stroke-width="1"
          />
          <circle cx="15" cy="15" r="5" fill="#FF5B2E" />
          <circle cx="15" cy="15" r="1.5" fill="var(--color-wrapped-bg)" />
        </svg>
        <span class="font-display text-2xl uppercase tracking-[0.02em]">
          {{ appConfig.title }}
        </span>
        <span class="sr-only">{{ appConfig.title }}</span>
      </NuxtLinkLocale>

      <div class="hidden items-center gap-1 lg:flex">
        <NuxtLinkLocale
          v-for="item in navigation"
          :key="item.name"
          :to="item.to"
          v-show="!item.condition || item.condition()"
          :class="['ui-nav', { 'ui-nav-on': isActive(item.to) }]"
          >{{ item.name }}
        </NuxtLinkLocale>
      </div>

      <div class="flex-1"></div>

      <div class="flex items-center justify-end gap-x-3">
        <ClientOnly>
          <div
            v-if="isWrapped || availableYears.length"
            class="flex items-center gap-x-3"
          >
            <SharedHistoryYearSelector class="hidden lg:flex" />
            <WrappedSearch v-if="canBrowse" />
            <NuxtLinkLocale
              v-if="canBrowse"
              to="/slideshow"
              class="ui-btn ui-cta hidden lg:flex"
              :aria-label="$t('layout.topbar.show-slideshow')"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <polygon points="6 4 20 12 6 20" />
              </svg>
              {{ $t("layout.topbar.show-slideshow") }}
            </NuxtLinkLocale>
          </div>
        </ClientOnly>
        <LayoutSharedLangButton class="hidden lg:flex" />
        <LayoutSharedColorTheme class="hidden lg:flex" />
        <LayoutTopbarMobileMenu :navigation="navigation" />
      </div>
    </nav>
  </header>
</template>

<script lang="ts" setup>
const appConfig = useAppConfig();
const route = useRoute();

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

const isHome = computed(
  () => route.path.replace(/\/$/, "") === localePath("/").replace(/\/$/, ""),
);

const isActive = (to: string) => {
  const category = to.split("category=")[1];
  const current = (route.query.category as string) || "tracks";

  return isHome.value && category === current;
};

const localePath = useLocalePath();

const { isWrapped } = storeToRefs(useWrappedStore());
const { availableYears, jobs, selectedYear } = storeToRefs(
  useMusicHistoryStore(),
);
const canBrowse = computed(
  () =>
    isWrapped.value &&
    !Object.values(jobs.value).some((year) => year === selectedYear.value),
);
</script>
