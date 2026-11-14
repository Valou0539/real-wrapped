<template>
  <WrappedSlideshowSlide>
    <h2
      :style="style(100)"
      class="slide-display mt-[clamp(1rem,4vh,3.5rem)] text-[clamp(2.6rem,12vw,4rem)]"
    >
      {{ $t("slideshow.topArtistsList.title") }}<br /><span
        class="text-wrapped-red"
        >{{ $t("slideshow.topArtistsList.titleAccent") }}</span
      >
    </h2>

    <div class="mt-auto flex flex-col">
      <ClientOnly>
        <div
          v-for="(artist, index) in top5Artists"
          :key="artist.artistName"
          :style="style(350 + index * 150)"
          class="grid items-center gap-2.5"
          :class="
            index === 0
              ? 'bg-wrapped-ink text-wrapped-cream -mx-5 grid-cols-[clamp(3rem,14vw,4.5rem)_minmax(0,1fr)] px-5 py-[clamp(0.9rem,2.4vh,1.375rem)]'
              : 'border-wrapped-ink grid-cols-[clamp(2.5rem,11vw,4rem)_minmax(0,1fr)] border-t-2 py-[clamp(0.6rem,1.6vh,1rem)]'
          "
        >
          <div
            class="slide-display leading-none"
            :class="
              index === 0
                ? 'text-wrapped-orange text-[clamp(2.8rem,13vw,4.5rem)]'
                : 'text-wrapped-red text-[clamp(2.2rem,10vw,3.5rem)]'
            "
          >
            {{ index + 1 }}
          </div>
          <div>
            <div
              class="slide-display wrap-anywhere leading-[1.05]"
              :class="
                index === 0
                  ? 'text-[clamp(1.9rem,9vw,3.125rem)]'
                  : 'text-[clamp(1.5rem,7vw,2.5rem)]'
              "
            >
              {{ artist.artistName }}
            </div>
            <div
              class="mt-1 text-[clamp(0.85rem,3.5vw,1rem)] font-medium"
              :class="index === 0 ? 'opacity-90' : ''"
            >
              {{
                $t("slideshow.common.mostPlayedTrack", {
                  track: artist.mostPlayedTrack,
                })
              }}
            </div>
          </div>
        </div>
      </ClientOnly>
    </div>
  </WrappedSlideshowSlide>
</template>

<script lang="ts" setup>
const { style } = useAnimationOnLoad();
const store = useWrappedStore();

useSeoMeta({
  title: $t("slideshow.topArtistsList.seo.title"),
  description: $t("slideshow.topArtistsList.seo.description"),
});

const top5Artists = computed(() => store.topArtists.slice(0, 5));
</script>
