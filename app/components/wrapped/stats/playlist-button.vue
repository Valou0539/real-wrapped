<template>
  <div class="flex flex-col items-start gap-2">
    <button
      type="button"
      class="ui-btn ui-cta h-11! px-5 text-sm"
      :disabled="loading"
      @click="openDialog"
    >
      <i v-if="loading" class="pi pi-spinner pi-spin" aria-hidden="true" />
      <WrappedSpotifyIcon v-else class="size-4" />
      {{ $t("music-history.stats.playlist.create") }}
    </button>

    <Dialog
      v-model:visible="dialogOpen"
      modal
      dismissableMask
      :draggable="false"
      class="mx-4 w-full max-w-120"
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
      :header="$t('music-history.stats.playlist.dialog-title')"
    >
      <form
        v-if="step === 'name'"
        class="flex flex-col gap-4 pt-2"
        @submit.prevent="confirmDialog"
      >
        <label
          for="playlist-name"
          class="text-wrapped-fg/80 text-sm font-bold"
        >
          {{ $t("music-history.stats.playlist.name-label") }}
        </label>
        <InputText
          id="playlist-name"
          v-model="playlistNameInput"
          type="text"
          autofocus
          autocomplete="off"
          maxlength="100"
          unstyled
          class="border-wrapped-fg/25 text-wrapped-fg focus:border-wrapped-orange h-12 rounded-xl border-2 px-4 text-lg outline-none"
        />
        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="ui-btn h-11 px-5 text-sm"
            @click="dialogOpen = false"
          >
            {{ $t("music-history.stats.playlist.cancel") }}
          </button>
          <button
            type="submit"
            class="ui-btn ui-cta h-11 px-5 text-sm"
            :disabled="!playlistNameInput.trim()"
          >
            <WrappedSpotifyIcon class="size-4" />
            {{ $t("music-history.stats.playlist.confirm") }}
          </button>
        </div>
      </form>

      <div
        v-else-if="step === 'loading'"
        class="flex items-center gap-3 py-4"
      >
        <i
          class="pi pi-spinner pi-spin text-wrapped-orange text-2xl"
          aria-hidden="true"
        />
        <p class="m-0 text-base">
          {{ $t("music-history.stats.playlist.loading") }}
        </p>
      </div>

      <div v-else class="flex flex-col gap-4 pt-2">
        <template v-if="playlistUrl">
          <p class="m-0 text-base font-bold">
            {{ $t("music-history.stats.playlist.success") }}
          </p>
          <p v-if="unresolvedCount" class="m-0 text-sm opacity-80">
            {{
              $t("music-history.stats.playlist.unresolved", {
                count: unresolvedCount,
              })
            }}
          </p>
          <div class="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              class="ui-btn h-11 px-5 text-sm"
              @click="dialogOpen = false"
            >
              {{ $t("music-history.stats.playlist.close") }}
            </button>
            <a
              :href="playlistUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="ui-btn ui-cta h-11 px-5 text-sm no-underline"
            >
              <WrappedSpotifyIcon class="size-4" />
              {{ $t("music-history.stats.playlist.open") }}
            </a>
          </div>
        </template>
        <template v-else>
          <p class="text-wrapped-orange m-0 text-base font-bold">
            {{ $t(error ?? "music-history.stats.playlist.error") }}
          </p>
          <div class="flex justify-end">
            <button
              type="button"
              class="ui-btn h-11 px-5 text-sm"
              @click="dialogOpen = false"
            >
              {{ $t("music-history.stats.playlist.close") }}
            </button>
          </div>
        </template>
      </div>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import type { TopTrack } from "~/types/wrapped";

// The pending creation survives the OAuth round trip: the custom name the
// user typed is stored alongside the flag so the resume uses their words.
const PENDING_KEY = "spotify-playlist-pending";

const props = defineProps<{ tracks: TopTrack[]; name: string }>();

const loading = ref(false);
const playlistUrl = ref<string | undefined>();
const unresolvedCount = ref(0);
const error = ref<string | undefined>();
const dialogOpen = ref(false);
const playlistNameInput = ref("");
const step = ref<"name" | "loading" | "result">("name");

const openDialog = () => {
  if (loading.value || !props.tracks.length) return;
  playlistNameInput.value = props.name;
  step.value = "name";
  dialogOpen.value = true;
};

const redirectToLogin = (name: string) => {
  // The creation auto-resumes when Spotify sends the user back here.
  sessionStorage.setItem(PENDING_KEY, JSON.stringify({ name }));
  window.location.href = `/api/spotify/login?return=${encodeURIComponent(window.location.href)}`;
};

const createPlaylist = async (name: string, allowLoginRedirect = true) => {
  loading.value = true;
  error.value = undefined;
  playlistUrl.value = undefined;
  unresolvedCount.value = 0;

  try {
    const result = await $fetch<{
      playlistUrl: string;
      added: number;
      unresolved: unknown[];
    }>("/api/spotify/playlists", {
      method: "POST",
      body: {
        name,
        description: "",
        tracks: props.tracks.map((track) => ({
          artistName: track.artistName,
          trackName: track.trackName,
          ...(track.spotifyTrackId
            ? { spotifyTrackId: track.spotifyTrackId }
            : {}),
        })),
      },
    });
    playlistUrl.value = result.playlistUrl;
    unresolvedCount.value = result.unresolved.length;
    step.value = "result";
  } catch (err) {
    const status = (err as { response?: { status?: number } })?.response
      ?.status;
    if (status === 401) {
      if (allowLoginRedirect) {
        redirectToLogin(name);
      } else {
        error.value = "music-history.stats.playlist.login-failed";
        step.value = "result";
      }
      return;
    }
    error.value = "music-history.stats.playlist.error";
    step.value = "result";
  } finally {
    loading.value = false;
  }
};

const startCreation = async (name: string, allowLoginRedirect = true) => {
  step.value = "loading";
  try {
    const status = await $fetch<{
      configured: boolean;
      authenticated: boolean;
    }>("/api/spotify/auth-status");
    if (!status.configured) {
      error.value = "music-history.stats.playlist.not-configured";
      step.value = "result";
      return;
    }
    if (!status.authenticated) {
      // The auto-resume must never chain another login redirect: if the
      // session is still missing right after the OAuth round trip, looping
      // back to Spotify would never end. Surface the failure instead —
      // clicking the button again restarts a clean login.
      if (!allowLoginRedirect) {
        error.value = "music-history.stats.playlist.login-failed";
        step.value = "result";
        return;
      }
      redirectToLogin(name);
      return;
    }
  } catch {
    error.value = "music-history.stats.playlist.error";
    step.value = "result";
    return;
  }

  await createPlaylist(name, allowLoginRedirect);
};

const confirmDialog = () => {
  const name = playlistNameInput.value.trim();
  if (!name) return;
  startCreation(name);
};

onMounted(() => {
  // Returning from the Spotify login: resume the creation the user asked
  // for, with the name they had typed.
  const pending = sessionStorage.getItem(PENDING_KEY);
  if (!pending) return;
  sessionStorage.removeItem(PENDING_KEY);
  if (!props.tracks.length) return;
  let name = props.name;
  try {
    const parsed = JSON.parse(pending) as { name?: unknown };
    if (typeof parsed.name === "string" && parsed.name.trim()) {
      name = parsed.name.trim();
    }
  } catch {
    // Legacy flag without a name: fall back to the default.
  }
  dialogOpen.value = true;
  startCreation(name, false);
});
</script>
