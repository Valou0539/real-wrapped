<template>
  <button type="button" class="ui-ib lg:hidden" @click="mobileMenuOpen = true">
    <span class="sr-only">
      {{ $t("layout.topbar.open_menu") }}
    </span>
    <Bars3Icon aria-hidden="true" class="size-5" />
  </button>

  <Drawer
    v-model:visible="mobileMenuOpen"
    blockScroll
    position="right"
    :pt="{
      mask: { class: 'lg:hidden!' },
      root: { class: 'bg-wrapped-bg text-wrapped-fg font-wrapped' },
      header: { class: 'border-b border-wrapped-fg/15 p-4!' },
      content: { class: 'font-wrapped' },
    }"
  >
    <template #header>
      <div class="flex flex-1 items-center gap-2">
        <svg
          width="28"
          height="28"
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
        </svg>
        <span class="font-display text-[22px] uppercase">{{ title }}</span>
      </div>
    </template>

    <nav
      aria-label="Navigation principale"
      class="font-wrapped flex flex-col pt-3"
    >
      <NuxtLinkLocale
        v-for="item in navigation"
        :key="item.name"
        :to="item.to"
        v-show="!item.condition || item.condition()"
        :class="[
          'border-wrapped-fg/15 font-display text-wrapped-fg flex min-h-16 items-center border-b text-[44px] uppercase no-underline',
          { 'text-wrapped-orange': !isActive(item.to) },
        ]"
        @click="mobileMenuOpen = false"
        >{{ item.name }}
      </NuxtLinkLocale>
    </nav>

    <div class="flex flex-col gap-3 pt-6">
      <ClientOnly>
        <SharedHistoryYearSelector
          class="w-full"
          @action="mobileMenuOpen = false"
        />
        <WrappedSearch v-if="canBrowse" :in-menu="true" />
        <NuxtLinkLocale
          v-if="canBrowse"
          to="/slideshow"
          class="ui-btn ui-cta h-13! text-[17px]"
          @click="mobileMenuOpen = false"
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
      </ClientOnly>
    </div>

    <div class="mt-auto flex gap-2.5 pb-2 pt-6">
      <LayoutSharedLangButton class="flex-1" full />
      <LayoutSharedColorTheme />
    </div>
  </Drawer>
</template>

<script lang="ts" setup>
import { Bars3Icon } from "@heroicons/vue/24/outline";
import { NuxtLinkLocale } from "#components";

defineProps<{
  navigation: { name: string; to: string; condition?: () => boolean }[];
}>();

const { mobileMenuOpen } = useResponsiveMenu();
const { title } = useAppConfig();
const route = useRoute();
const localePath = useLocalePath();

const isHome = computed(
  () => route.path.replace(/\/$/, "") === localePath("/").replace(/\/$/, ""),
);

const isActive = (to: string) => {
  const category = to.split("category=")[1];
  const current = (route.query.category as string) || "tracks";

  return isHome.value && category === current;
};

const { isWrapped } = storeToRefs(useWrappedStore());
const { isImporting, jobs } = storeToRefs(useMusicHistoryStore());
const canBrowse = computed(
  () =>
    isWrapped.value && !isImporting.value && !Object.keys(jobs.value).length,
);
</script>
