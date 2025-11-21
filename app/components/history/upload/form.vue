<template>
  <PrimevueForm
    v-slot="$form"
    :resolver="resolver"
    :initialValues="initialValues"
    @submit="submit($event as FormSubmitEvent<UploadHistoryFormValues>)"
  >
    <SharedFormLabelWithError
      label=""
      :error="$t($form.files?.error?.message ?? '')"
    >
      <SharedFormFileInput
        name="files"
        :title="$t('music-history.upload.title')"
        :hint="$t('music-history.upload.hint')"
        accept="json"
        multiple
      />
    </SharedFormLabelWithError>
    <Button
      fluid
      class="mt-4"
      type="submit"
      :disabled="!$form.valid"
      :loading="loading"
      :label="$t('music-history.upload.button')"
    />
  </PrimevueForm>
</template>

<script lang="ts" setup>
import { Form as PrimevueForm } from "@primevue/forms";
import type { FormSubmitEvent } from "@primevue/forms";
import type { UploadHistoryFormValues } from "~/types/history";
const emit = defineEmits<{ (e: "processStart"): void }>();

const { resolver, initialValues, submit, loading } = useUploadHistoryForm(() =>
  emit("processStart"),
);
</script>
