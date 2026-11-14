<template>
  <div class="font-wrapped flex flex-wrap items-start gap-14">
    <section class="flex min-w-0 flex-[1_1_440px] flex-col gap-7">
      <h1 class="slide-display m-0 text-[clamp(3.5rem,10vw,6.5rem)]">
        <i18n-t keypath="music-history.upload.app.title" scope="global">
          <template #spotify>
            <span class="text-wrapped-orange">Spotify</span>
          </template>
        </i18n-t>
      </h1>
      <p class="text-wrapped-fg/90 m-0 max-w-xl text-lg leading-relaxed">
        {{ $t("music-history.upload.app.description") }}
      </p>
    </section>

    <section class="flex min-w-0 flex-[1_1_480px] flex-col gap-5">
      <div
        class="border-wrapped-fg/15 bg-wrapped-card flex flex-col gap-5 rounded-[28px] border p-8"
      >
        <h2 class="m-0 text-[26px] font-bold">
          {{ $t("music-history.upload.title") }}
        </h2>
        <Message v-if="importError" severity="error">
          {{ $t(importError) }}
        </Message>
        <HistoryUploadForm>
          <button
            v-if="availableYears.length"
            type="button"
            class="ui-btn h-13! px-7 text-[17px] font-bold"
            :disabled="isLoading"
            @click="cancelImport"
          >
            {{ $t("music-history.upload.cancel") }}
          </button>
        </HistoryUploadForm>
      </div>

      <div
        class="bg-wrapped-purple flex flex-col gap-2.5 rounded-3xl p-7 text-white"
      >
        <h3 class="m-0 text-xl font-bold">
          {{ $t("music-history.upload.tutorial.title") }}
        </h3>
        <i18n-t
          keypath="music-history.upload.tutorial.description"
          tag="p"
          scope="global"
          class="m-0 text-base leading-normal"
        >
          <template #spotifyPrivacy>
            <a
              href="https://www.spotify.com/account/privacy/"
              target="_blank"
              rel="noopener noreferrer"
              class="font-bold text-white underline underline-offset-4"
              >{{ $t("music-history.upload.tutorial.spotify-privacy-link") }}
            </a>
          </template>
        </i18n-t>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
const { importError, availableYears, isLoading } = storeToRefs(
  useMusicHistoryStore(),
);
const { cancelImport } = useHistoryLibrary();
</script>
