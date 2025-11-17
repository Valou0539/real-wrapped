<template>
  <SharedFormDialog
    v-model:visible="visible"
    :header="$t('account.profile.updateEmail.title')"
    :loading="loading"
    @hide="reset"
  >
    <template #default="{ closeDialog, loading: dialogLoading }">
      <Form
        v-slot="$form"
        :initialValues="initialValues"
        :resolver="resolver"
        class="flex flex-col gap-4"
        @submit="
          submitUpdate(
            $event as FormSubmitEvent<IRequestEmailChangeBody>,
            closeDialog,
          )
        "
      >
        <p class="text-gray text-sm">
          {{ $t("account.profile.updateEmail.description") }}
        </p>

        <div class="flex flex-col gap-2">
          <SharedFormLabelWithError
            :label="$t('account.profile.updateEmail.label')"
            :error="$t($form.new_email?.error?.message || responseError || '')"
          >
            <InputText
              id="profile-update-email"
              name="new_email"
              type="email"
              autocomplete="email"
              fluid
              :disabled="dialogLoading"
              autofocus
            />
          </SharedFormLabelWithError>
        </div>

        <div class="flex justify-end gap-2">
          <Button type="button" severity="secondary" text @click="closeDialog">
            {{ $t("account.profile.updateEmail.cancel") }}
          </Button>
          <Button
            type="submit"
            :loading="dialogLoading"
            :label="$t('account.profile.updateEmail.confirm')"
          />
        </div>
      </Form>
    </template>
  </SharedFormDialog>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from "@primevue/forms";

const visible = defineModel<boolean>("visible");
const emit = defineEmits<{ (e: "newEmailRequested"): void }>();

const { initialValues, resolver, responseError, loading, submit, reset } =
  useUpdateEmailForm();

const submitUpdate = (
  form: FormSubmitEvent<IRequestEmailChangeBody>,
  closeDialog: () => void,
) => {
  submit(form)?.then(() => {
    if (!responseError.value) {
      closeDialog();
      emit("newEmailRequested");
    }
  });
};
</script>
