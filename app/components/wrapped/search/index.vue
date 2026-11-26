<template>
  <div :class="{ 'w-full': inMenu }">
    <button
      v-if="!inMenu"
      type="button"
      class="ui-ib"
      :aria-label="$t('music-history.search.label')"
      :title="$t('music-history.search.label')"
      @click="isSearchOpen = true"
    >
      <MagnifyingGlassIcon aria-hidden="true" class="size-5" />
    </button>

    <Dialog
      v-model:visible="isSearchOpen"
      modal
      dismissableMask
      :draggable="false"
      class="max-w-170 mx-4 w-full"
      :pt="{
        root: {
          class:
            'bg-wrapped-card! border! border-wrapped-fg/20! rounded-[28px]! shadow-[0_40px_80px_rgba(0,0,0,0.5)] font-wrapped',
        },
        mask: { class: 'bg-wrapped-bg/80!' },
        header: { class: 'px-6! pt-6! pb-0!' },
        title: {
          class:
            'text-[15px]! font-bold! tracking-widest! uppercase! text-wrapped-fg/85!',
        },
        content: { class: 'px-6! pb-6! text-wrapped-fg!' },
        pcCloseButton: { root: { class: 'text-wrapped-fg!' } },
      }"
      :header="$t('music-history.search.label')"
      @show="onOpen"
    >
      <div class="gap-4.5 flex flex-col">
        <div
          class="border-wrapped-orange bg-wrapped-bg flex h-14 items-center gap-3 rounded-2xl border-2 px-4"
        >
          <MagnifyingGlassIcon
            aria-hidden="true"
            class="size-5.5 text-wrapped-fg shrink-0"
          />
          <InputText
            id="wrapped-search"
            ref="inputRef"
            v-model="query"
            type="search"
            autofocus
            autocomplete="off"
            unstyled
            class="text-wrapped-fg placeholder:text-wrapped-fg/50 min-w-0 flex-1 text-lg outline-none"
            :disabled="loading || !hasHistory"
            :placeholder="$t('music-history.search.placeholder')"
            :aria-label="$t('music-history.search.placeholder')"
          />
          <span
            class="text-wrapped-fg bg-wrapped-hover shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-bold"
          >
            {{ selectedYear }}
          </span>
        </div>

        <div
          v-if="loading"
          class="text-wrapped-fg/70 flex items-center gap-3 text-sm"
        >
          <ProgressSpinner
            class="size-5 shrink-0"
            strokeWidth="6"
            aria-hidden="true"
          />
          <p>{{ $t("music-history.search.loading") }}</p>
        </div>
        <p v-else-if="loadError" class="text-wrapped-fg/70 text-sm">
          {{ $t("music-history.search.load-error") }}
        </p>
        <p v-else-if="!hasHistory" class="text-wrapped-fg/70 text-sm">
          {{ $t("music-history.search.unavailable") }}
        </p>
        <p v-else-if="!query.trim()" class="text-wrapped-fg/70 text-sm">
          {{ $t("music-history.search.prompt") }}
        </p>

        <template v-else>
          <div
            class="scrollbar-none flex gap-2 overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
          >
            <button
              v-for="tab in searchTabs"
              :key="tab.value"
              type="button"
              role="tab"
              :aria-selected="activeTab === tab.value"
              :class="[
                'ui-chip h-10! text-[15px]! font-bold!',
                {
                  'ui-chip-on border-wrapped-fg! bg-wrapped-fg text-wrapped-bg':
                    activeTab === tab.value,
                },
              ]"
              @click="activeTab = tab.value"
            >
              {{ $t(tab.label) }}
            </button>
          </div>

          <div class="gap-4.5 flex max-h-[50vh] flex-col overflow-y-auto">
            <p
              v-if="!hasVisibleResults(activeTab)"
              class="text-wrapped-fg/70 text-sm"
            >
              {{ $t("music-history.search.empty") }}
            </p>

            <div
              v-for="group in visibleGroups(activeTab)"
              :key="group.type"
              class="flex flex-col"
            >
              <div
                v-if="group.total"
                class="text-wrapped-fg/80 px-3 pb-2 text-[13px] font-bold uppercase tracking-[0.12em]"
              >
                {{ $t(group.title, { count: group.count }) }}
              </div>
              <NuxtLinkLocale
                v-for="entry in group.items"
                :key="`${entry.type}-${entry.key}`"
                :to="entityLink(entry)"
                class="text-wrapped-fg hover:bg-wrapped-hover flex min-h-14 items-center gap-3.5 rounded-[14px] px-3 py-1.5 no-underline"
                @click="isSearchOpen = false"
              >
                <WrappedTrackCover
                  v-if="entry.type === 'track' && entry.subtitle"
                  :artist="entry.subtitle"
                  :track="entry.name"
                  :spotify-track-id="entry.spotifyTrackId"
                  class="size-11!"
                />
                <span class="flex min-w-0 flex-1 flex-col">
                  <b
                    class="truncate text-[17px]"
                    :class="{ capitalize: group.type === 'genre' }"
                    >{{ entry.name }}</b
                  >
                  <small
                    v-if="entry.subtitle"
                    class="text-wrapped-fg/80 truncate text-sm"
                    >{{
                      formatTrackArtists({
                        artistName: entry.subtitle ?? "",
                        artists: entry.artists,
                      })
                    }}</small
                  >
                </span>
                <span class="font-display text-wrapped-orange text-xl"
                  >#{{ entry.rank }}</span
                >
              </NuxtLinkLocale>
              <button
                v-if="activeTab !== 'best' && group.total > group.limit"
                type="button"
                class="ui-btn mt-2 self-center"
                @click="limits[group.type] += LOAD_STEP"
              >
                {{ $t("music-history.search.load-more", { count: LOAD_STEP }) }}
              </button>
            </div>
          </div>
        </template>
      </div>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline";
import type { WrappedSearchEntry } from "~/types/wrappedSearch";

type SearchTab = "best" | "track" | "artist" | "genre";

const LOAD_STEP = 20;
const BEST_LIMIT = 5;

withDefaults(defineProps<{ inMenu?: boolean }>(), { inMenu: false });

const searchTabs: { value: SearchTab; label: string }[] = [
  { value: "best", label: "music-history.search.tabs.best" },
  { value: "track", label: "music-history.stats.tracks" },
  { value: "artist", label: "music-history.stats.artists" },
  { value: "genre", label: "music-history.stats.genres" },
];

const route = useRoute();
const { artistLink, genreLink, trackLink } = useWrappedEntityLinks();

const musicHistoryStore = useMusicHistoryStore();
const { selectedYear } = storeToRefs(musicHistoryStore);

const isSearchOpen = ref(false);
const inputRef = ref<{ $el?: HTMLInputElement } | null>(null);
const activeTab = ref<SearchTab>("best");

const searchHistory = shallowRef<EnhancedMusicHistoryTrack[] | undefined>(
  undefined,
);
const loading = ref(false);
const loadError = ref(false);
let loadGeneration = 0;

const hasHistory = computed(() => !!searchHistory.value?.length);

const index = computed(() =>
  buildWrappedSearchIndex(searchHistory.value ?? []),
);

const loadSearchHistory = async () => {
  const year = selectedYear.value;
  const generation = ++loadGeneration;

  loading.value = true;
  loadError.value = false;

  try {
    const tracks =
      year === undefined
        ? undefined
        : await musicHistoryStore.readYearHistory(year);
    if (generation !== loadGeneration) return;
    searchHistory.value = tracks;
  } catch {
    if (generation !== loadGeneration) return;
    searchHistory.value = undefined;
    loadError.value = true;
  } finally {
    if (generation === loadGeneration) loading.value = false;
  }
};

const query = ref("");

const limits = reactive({
  track: LOAD_STEP,
  artist: LOAD_STEP,
  genre: LOAD_STEP,
});

const resetLimits = () => {
  limits.track = LOAD_STEP;
  limits.artist = LOAD_STEP;
  limits.genre = LOAD_STEP;
};

const results = computed(() => searchWrappedIndex(index.value, query.value));

const resultGroups = computed(() => [
  {
    type: "track" as const,
    title: "music-history.search.tracks-count",
    items: results.value.filter((entry) => entry.type === "track"),
  },
  {
    type: "artist" as const,
    title: "music-history.search.artists-count",
    items: results.value.filter((entry) => entry.type === "artist"),
  },
  {
    type: "genre" as const,
    title: "music-history.search.genres-count",
    items: results.value.filter((entry) => entry.type === "genre"),
  },
]);

const visibleGroups = (tab: SearchTab) =>
  resultGroups.value
    .filter((group) => tab === "best" || group.type === tab)
    .map((group) => {
      const limit = tab === "best" ? BEST_LIMIT : limits[group.type];
      const items = group.items.slice(0, limit);

      return {
        ...group,
        items,
        limit,
        total: group.items.length,
        count: tab === "best" ? items.length : group.items.length,
      };
    });

const hasVisibleResults = (tab: SearchTab) =>
  visibleGroups(tab).some((group) => group.total > 0);

const entityLink = (entry: WrappedSearchEntry) => {
  if (entry.type === "track") {
    return trackLink(entry.subtitle ?? "", entry.name);
  }

  return entry.type === "genre" ? genreLink(entry.key) : artistLink(entry.key);
};

const focusInput = () => {
  inputRef.value?.$el?.focus();
};

const onOpen = () => {
  activeTab.value = "best";
  loadSearchHistory();
  nextTick(() => setTimeout(focusInput, 50));
};

const periodKeys = [
  "primevue.monthShortJanuary",
  "primevue.monthShortFebruary",
  "primevue.monthShortMarch",
  "primevue.monthShortApril",
  "primevue.monthShortMay",
  "primevue.monthShortJune",
  "primevue.monthShortJuly",
  "primevue.monthShortAugust",
  "primevue.monthShortSeptember",
  "primevue.monthShortOctober",
  "primevue.monthShortNovember",
  "primevue.monthShortDecember",
];

watch(query, resetLimits);

watch(selectedYear, () => {
  query.value = "";
  activeTab.value = "best";
  resetLimits();
  if (isSearchOpen.value) loadSearchHistory();
});

watch(
  () => route.path,
  () => {
    isSearchOpen.value = false;
  },
);
</script>
