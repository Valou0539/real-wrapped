<template>
  <section class="font-wrapped flex flex-col gap-8">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <NuxtLinkLocale
        :to="backLink"
        class="text-wrapped-fg inline-flex min-h-11 items-center gap-2 text-[17px] font-bold underline-offset-4 hover:underline"
      >
        <ArrowLeftIcon aria-hidden="true" class="size-4.5" />
        {{ $t("music-history.entity.back") }}
      </NuxtLinkLocale>
    </div>

    <SharedMonthSelector :selected-month="month" />

    <div
      v-if="loading"
      class="text-wrapped-fg/70 flex items-center justify-center gap-3 py-16 text-sm"
    >
      <ProgressSpinner
        class="size-5 shrink-0"
        strokeWidth="6"
        aria-hidden="true"
      />
      <p>{{ $t("music-history.search.loading") }}</p>
    </div>
    <p
      v-else-if="loadError"
      class="text-wrapped-fg/70 py-16 text-center text-sm"
    >
      {{ $t("music-history.search.load-error") }}
    </p>
    <div v-else-if="entry" class="flex flex-col gap-8">
      <header class="flex flex-col gap-4">
        <div
          class="text-wrapped-fg/80 text-[15px] font-bold uppercase tracking-[0.12em]"
        >
          {{
            $t("music-history.entity.scope", {
              year: selectedYear ?? "",
              period: periodLabel,
            })
          }}
        </div>
        <div class="flex flex-wrap items-center gap-x-7 gap-y-5">
          <WrappedSpotifyCover
            v-if="type === 'track' && entry.subtitle"
            :key="entry.key"
            :artist="entry.subtitle"
            :track="entry.name"
            class="w-28 shrink-0 empty:hidden"
          />
          <h1 class="slide-display m-0 text-[clamp(3rem,12vw,7.5rem)]">
            {{ entry.name }}
          </h1>
          <span
            class="bg-wrapped-lime text-wrapped-ink rounded-full px-5 py-2.5 text-[22px] font-bold"
          >
            {{ $t("music-history.search.rank") }} #{{ entry.rank }}
          </span>
        </div>
        <span
          v-if="type === 'track' && entry.subtitle && entry.artists?.length"
          class="w-fit"
        >
          <template v-for="(artist, index) in entry.artists" :key="artist">
            <template v-if="index > 0">{{ ", " }}</template>
            <NuxtLinkLocale :to="artistLink(artist)" class="ui-lk">
              {{ artist }}
            </NuxtLinkLocale>
          </template>
        </span>
        <NuxtLinkLocale
          v-else-if="type === 'track' && entry.subtitle"
          :to="artistLink(entry.subtitle)"
          class="ui-lk w-fit"
        >
          {{ entry.subtitle }}
        </NuxtLinkLocale>
        <WrappedSpotifyArtistGenres
          v-if="type === 'artist'"
          :key="entry.key"
          :artist="entry.name"
        />
      </header>

      <div class="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-4">
        <div
          class="ui-card bg-wrapped-orange text-wrapped-ink col-span-2 md:col-span-1"
        >
          <div class="ui-card-lb">{{ $t("music-history.search.time") }}</div>
          <div class="ui-card-val">{{ formatDuration(entry.msPlayed) }}</div>
        </div>
        <div class="ui-card bg-wrapped-purple text-wrapped-cream">
          <div class="ui-card-lb">{{ $t("music-history.search.plays") }}</div>
          <div class="ui-card-val">{{ entry.playCount }}</div>
        </div>
        <div class="ui-card bg-wrapped-lime text-wrapped-ink">
          <div class="ui-card-lb">
            {{ $t("music-history.search.firstPlay") }}
          </div>
          <div class="ui-card-val">
            {{
              entry.firstPlayDate
                ? formatDate(entry.firstPlayDate, $i18n.locale, {
                    month: "short",
                    day: "numeric",
                  })
                : "—"
            }}
          </div>
        </div>
      </div>

      <section v-if="type !== 'track'" class="flex flex-col gap-4">
        <h2
          class="font-display m-0 text-[30px] uppercase leading-none md:text-[44px]"
        >
          {{ $t("music-history.search.topTracks") }}
        </h2>
        <p v-if="!tracks.length" class="text-wrapped-fg/70 text-sm">
          {{ $t("music-history.search.noTracks") }}
        </p>
        <div v-else class="ui-table">
          <div
            class="ui-th"
            style="
              grid-template-columns:
                72px 96px 48px minmax(180px, 2fr)
                140px 110px;
            "
          >
            <span>{{ $t("music-history.entity.columns.rank") }}</span>
            <span>{{ $t("music-history.entity.columns.overallRank") }}</span>
            <span></span>
            <span>{{ $t("music-history.entity.columns.title") }}</span>
            <span>{{ $t("music-history.entity.columns.playTime") }}</span>
            <span>{{ $t("music-history.entity.columns.plays") }}</span>
          </div>
          <div
            v-for="track in tracks"
            :key="JSON.stringify([track.artistName, track.trackName])"
            class="ui-tr"
            style="
              grid-template-columns:
                72px 96px 48px minmax(180px, 2fr)
                140px 110px;
            "
          >
            <span class="ui-rk ui-rk-top">{{ track.rank }}</span>
            <span class="ui-nu text-wrapped-fg/85"
              >#{{ track.overallRank }}</span
            >
            <WrappedTrackCover
              :artist="track.artistName"
              :track="track.trackName"
            />
            <span class="min-w-0">
              <NuxtLinkLocale
                :to="trackLink(track.artistName, track.trackName)"
                class="block truncate font-bold hover:underline"
              >
                {{ track.trackName }}
              </NuxtLinkLocale>
              <NuxtLinkLocale
                :to="artistLink(track.artistName)"
                class="text-wrapped-fg/80 block truncate text-sm hover:underline"
              >
                {{ track.artistName }}
              </NuxtLinkLocale>
            </span>
            <span class="ui-nu">{{ formatDuration(track.msPlayed) }}</span>
            <span class="ui-nu">{{ track.playCount }}</span>
          </div>
        </div>
      </section>
    </div>

    <div v-else class="flex flex-col items-center gap-4 py-8 text-center">
      <p class="text-wrapped-fg/70">
        {{ $t("music-history.entity.not-found") }}
      </p>
      <button type="button" class="ui-btn ui-cta" @click="resetMonth">
        {{ $t("music-history.entity.show-year") }}
      </button>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ArrowLeftIcon } from "@heroicons/vue/24/outline";
import type { WrappedSearchSelection } from "~/types/wrappedSearch";

const props = defineProps<{
  type: WrappedSearchSelection["type"];
  name: string;
  artist?: string;
}>();

const route = useRoute();
const router = useRouter();
const localePath = useLocalePath();
const month = useWrappedMonth();
const { artistLink, trackLink } = useWrappedEntityLinks();

const musicHistoryStore = useMusicHistoryStore();
const { selectedYear } = storeToRefs(musicHistoryStore);

const searchHistory = shallowRef<EnhancedMusicHistoryTrack[] | undefined>(
  undefined,
);
const loading = ref(false);
const loadError = ref(false);
const loaded = ref(false);
let loadGeneration = 0;

const index = computed(() =>
  buildWrappedSearchIndex(searchHistory.value ?? [], month.value),
);

const yearIndex = computed(() =>
  buildWrappedSearchIndex(searchHistory.value ?? [], "all"),
);

const loadYearHistory = async () => {
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
    if (generation === loadGeneration) {
      loading.value = false;
      loaded.value = true;
    }
  }
};

onMounted(loadYearHistory);

watch([selectedYear, month], loadYearHistory);

const entry = computed(() =>
  findWrappedEntryBySlug(index.value, props.type, props.name, props.artist),
);

watchEffect(() => {
  if (!loaded.value || loading.value || loadError.value) return;

  const existsInYear = findWrappedEntryBySlug(
    yearIndex.value,
    props.type,
    props.name,
    props.artist,
  );
  if (existsInYear) return;

  showError(
    createError({
      statusCode: 404,
      message: $t("music-history.entity.not-found"),
    }),
  );
});

useSeoMeta({
  title: () =>
    entry.value?.subtitle
      ? `${entry.value.name} — ${entry.value.subtitle}`
      : (entry.value?.name ?? props.name),
});

const tracks = computed(() =>
  entry.value && props.type !== "track"
    ? getWrappedEntryTracks(index.value, entry.value)
    : [],
);

const backCategories = {
  artist: "artists",
  genre: "genres",
  track: "tracks",
} as const;

const backLink = computed(() =>
  localePath({
    path: "/",
    query: {
      category: backCategories[props.type],
      month: route.query.month,
    },
  }),
);

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

const resetMonth = () => {
  router.push({ query: { ...route.query, month: "all" } });
};

const periodLabel = computed(() =>
  month.value === "all"
    ? $t("music-history.stats.all")
    : $t(periodKeys[month.value] ?? ""),
);
</script>
