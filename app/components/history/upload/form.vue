<template>
  <PrimevueForm
    v-slot="$form"
    :resolver="resolver"
    :initialValues="initialValues"
    @submit="submit($event as FormSubmitEvent<UploadHistoryFormValues>)"
  >
    <div class="flex flex-col gap-2">
      <label
        :for="yearInputId"
        class="text-wrapped-fg/80 block text-sm font-bold uppercase tracking-[0.12em]"
      >
        {{ $t("music-history.upload.year.label") }}
      </label>
      <Select
        :input-id="yearInputId"
        name="year"
        :options="yearOptions"
        fluid
        :pt="{
          root: {
            class:
              'h-13! rounded-[14px]! border-wrapped-fg/30! bg-wrapped-bg! text-wrapped-fg! font-wrapped text-[17px]! items-center px-4',
          },
          label: { class: 'text-wrapped-fg!' },
          dropdown: { class: 'text-wrapped-fg!' },
          overlay: {
            class:
              'bg-wrapped-card! border! border-wrapped-fg/20! rounded-2xl!',
          },
          option: { class: 'text-wrapped-fg! hover:bg-wrapped-fg/10!' },
        }"
      />
      <Message
        v-if="$form.year?.error"
        severity="error"
        size="small"
        variant="simple"
      >
        {{ $t($form.year?.error?.message ?? "") }}
      </Message>
    </div>

    <SharedFormLabelWithError
      label=""
      :error="$t($form.files?.error?.message ?? '')"
    >
      <SharedFormFileInput
        name="files"
        :title="$t('music-history.upload.dropzone')"
        :subtitle="$t('music-history.upload.dropzone-alt')"
        :hint="$t('music-history.upload.hint')"
        accept="json"
        multiple
      />
    </SharedFormLabelWithError>

    <Message v-if="responseError" severity="error">
      {{ $t(responseError) }}
    </Message>

    <div class="mt-5 flex flex-wrap gap-3">
      <button
        type="submit"
        class="ui-btn ui-cta h-13! px-7 text-[17px]"
        :disabled="!$form.valid || loading"
      >
        <i v-if="loading" class="pi pi-spinner pi-spin" aria-hidden="true" />
        {{ $t("music-history.upload.button") }}
      </button>
      <slot />
    </div>
  </PrimevueForm>
</template>

<script lang="ts" setup>
import { Form as PrimevueForm } from "@primevue/forms";
import type { FormSubmitEvent } from "@primevue/forms";
import type { UploadHistoryFormValues } from "~/types/history";

const yearInputId = useId();
const { resolver, initialValues, submit, loading, responseError } =
  useUploadHistoryForm();

const yearOptions = getRecentHistoryYears(10, initialValues.value.year);
</script>
