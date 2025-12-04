<template>
  <div v-if="!jobId" class="space-y-12">
    <!-- App Description -->
    <div class="text-center">
      <h1 class="mb-4 text-4xl font-extrabold tracking-tight">
        {{ $t("music-history.upload.app.title") }}
      </h1>
      <p
        class="text-surface-600 dark:text-surface-300 mx-auto max-w-2xl text-lg"
      >
        {{ $t("music-history.upload.app.description") }}
      </p>
    </div>

    <div class="flex flex-col gap-12 md:flex-row md:items-start">
      <!-- Upload Form -->
      <div class="grow">
        <h2 class="mb-6 text-xl font-bold">
          {{ $t("music-history.upload.title") }}
        </h2>
        <HistoryUploadForm />
      </div>

      <!-- Tutorial Section -->
      <Card class="md:w-2/5 md:shrink-0">
        <template #title>
          {{ $t("music-history.upload.tutorial.title") }}
        </template>
        <template #content>
          <i18n-t
            keypath="music-history.upload.tutorial.description"
            tag="p"
            scope="global"
            class="text-surface-600 dark:text-surface-300 mb-6"
          >
            <template #spotifyPrivacy>
              <a
                href="https://www.spotify.com/account/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary-500 font-medium hover:underline"
                >{{ $t("music-history.upload.tutorial.spotify-privacy-link") }}
              </a>
            </template>
          </i18n-t>
        </template>
      </Card>
    </div>
  </div>
  <HistoryUploadPending v-else />
</template>

<script lang="ts" setup>
const { jobId } = storeToRefs(useMusicHistoryStore());
</script>
