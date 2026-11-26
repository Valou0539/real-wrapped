<template>
  <div class="font-wrapped flex w-full flex-col gap-12">
    <h1 v-if="year" class="slide-display m-0 text-[clamp(3.5rem,10vw,6.5rem)]">
      {{ $t("music-history.upload.job-year", { year }) }}
    </h1>

    <div class="grid gap-5">
      <!-- Erreur -->
      <section
        v-if="error"
        class="border-wrapped-orange! bg-wrapped-danger-card flex flex-col gap-5 rounded-[28px] border p-8"
      >
        <span
          class="bg-wrapped-fg text-wrapped-bg w-fit rounded-full px-3.5 py-1.5 text-[13px] font-bold uppercase tracking-widest"
        >
          {{ $t("music-history.upload.error-chip") }}
        </span>
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          aria-hidden="true"
          class="shrink-0"
        >
          <circle
            cx="36"
            cy="36"
            r="34"
            fill="none"
            stroke="#FF5B2E"
            stroke-width="3"
          />
          <line
            x1="24"
            y1="24"
            x2="48"
            y2="48"
            stroke="#FF5B2E"
            stroke-width="5"
            stroke-linecap="round"
          />
          <line
            x1="48"
            y1="24"
            x2="24"
            y2="48"
            stroke="#FF5B2E"
            stroke-width="5"
            stroke-linecap="round"
          />
        </svg>
        <p class="m-0 text-[22px] font-medium leading-snug">
          {{ $t(error) }}
        </p>
        <button
          type="button"
          class="ui-btn ui-cta h-12! mt-auto w-fit px-6 text-base"
          @click="startTracking"
        >
          {{ $t("music-history.upload.retry") }}
        </button>
      </section>

      <!-- En file d'attente -->
      <section
        v-else-if="queuePosition"
        class="border-wrapped-fg/15 bg-wrapped-card flex flex-col gap-5 rounded-[28px] border p-8"
      >
        <span
          class="bg-wrapped-lime text-wrapped-ink w-fit rounded-full px-3.5 py-1.5 text-[13px] font-bold uppercase tracking-widest"
        >
          {{ $t("music-history.upload.queue-chip") }}
        </span>
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          aria-hidden="true"
          class="animate-vinyl-spin shrink-0"
        >
          <circle
            cx="36"
            cy="36"
            r="34"
            fill="none"
            stroke="var(--color-wrapped-fg)"
            stroke-width="2"
            stroke-dasharray="6 8"
          />
          <circle cx="36" cy="36" r="12" fill="#D6FF3D" />
        </svg>
        <p class="m-0 text-[22px] font-medium leading-snug">
          <i18n-t
            keypath="music-history.upload.queue"
            :plural="queuePosition"
            scope="global"
          >
            <template #count>
              <b class="text-wrapped-lime">{{ queuePosition }}</b>
            </template>
          </i18n-t>
        </p>
        <button
          type="button"
          class="ui-btn h-12! mt-auto w-fit px-6 text-base font-bold"
          :disabled="cancelling"
          @click="handleCancel"
        >
          <i
            v-if="cancelling"
            class="pi pi-spinner pi-spin"
            aria-hidden="true"
          />
          {{ $t("music-history.upload.cancel") }}
        </button>
      </section>

      <!-- Traitement -->
      <section
        v-else
        class="border-wrapped-fg/15 bg-wrapped-card flex flex-col gap-5 rounded-[28px] border p-8"
      >
        <span
          class="bg-wrapped-orange text-wrapped-ink w-fit rounded-full px-3.5 py-1.5 text-[13px] font-bold uppercase tracking-widest"
        >
          {{ $t("music-history.upload.processing-chip") }}
        </span>
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          aria-hidden="true"
          class="animate-vinyl-spin shrink-0"
        >
          <circle cx="36" cy="36" r="34" fill="var(--color-wrapped-fg)" />
          <circle
            cx="36"
            cy="36"
            r="23"
            fill="none"
            stroke="var(--color-wrapped-bg)"
            stroke-width="1.5"
          />
          <circle cx="36" cy="36" r="12" fill="#FF5B2E" />
          <circle cx="36" cy="36" r="3" fill="var(--color-wrapped-bg)" />
        </svg>
        <p class="m-0 text-[22px] font-medium leading-snug">
          {{ $t("music-history.upload.processing") }}
        </p>
        <button
          type="button"
          class="ui-btn h-12! w-fit px-6 text-base font-bold"
          :disabled="cancelling"
          @click="handleCancel"
        >
          <i
            v-if="cancelling"
            class="pi pi-spinner pi-spin"
            aria-hidden="true"
          />
          {{ $t("music-history.upload.cancel") }}
        </button>
        <div class="mt-auto flex flex-col gap-2.5">
          <div class="flex justify-between text-[15px] font-bold">
            <span>{{ $t("music-history.upload.progress") }}</span>
            <span>{{ progress }}%</span>
          </div>
          <div
            role="progressbar"
            :aria-label="$t('music-history.upload.progress')"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="progress"
            class="bg-wrapped-fg/15 h-3.5 overflow-hidden rounded-full"
          >
            <div
              class="bg-wrapped-orange h-full rounded-full transition-[width] duration-500"
              :style="{ width: `${progress}%` }"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ jobId: string }>();

const musicHistoryStore = useMusicHistoryStore();
const year = computed(() => musicHistoryStore.jobs[props.jobId]);

const { progress, queuePosition, error, startTracking, cancelJob } =
  useEnhanceHistoryProgress(props.jobId);
const cancelling = ref(false);

const handleCancel = async () => {
  cancelling.value = true;
  await cancelJob();
  cancelling.value = false;
};

onMounted(() => {
  startTracking();
});
</script>
