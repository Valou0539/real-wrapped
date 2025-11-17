<template>
  <SharedFormDialog
    v-model:visible="visible"
    :header="$t('account.profile.updateName.title')"
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
          submitUpdate($event as FormSubmitEvent<IUpdateNameBody>, closeDialog)
        "
      >
        <p class="text-gray text-sm">
          {{ $t("account.profile.updateName.description") }}
        </p>

        <div class="flex flex-col gap-2">
          <SharedFormLabelWithError
            :label="$t('account.profile.updateName.label')"
            :error="$t($form.name?.error?.message || responseError || '')"
          >
            <InputText
              name="name"
              autocomplete="name"
              fluid
              :disabled="dialogLoading"
              autofocus
            />
          </SharedFormLabelWithError>
        </div>

        <div class="flex justify-end gap-2">
          <Button type="button" severity="secondary" text @click="closeDialog">
            {{ $t("account.profile.updateName.cancel") }}
          </Button>
          <Button
            type="submit"
            :loading="dialogLoading"
            :label="$t('account.profile.updateName.confirm')"
          />
        </div>
      </Form>
    </template>
  </SharedFormDialog>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from "@primevue/forms";

const visible = defineModel<boolean>("visible");

const { initialValues, resolver, responseError, loading, submit, reset } =
  useUpdateNameForm();

const submitUpdate = (
  form: FormSubmitEvent<IUpdateNameBody>,
  closeDialog: () => void,
) => {
  submit(form)?.then(() => {
    if (!responseError.value) {
      closeDialog();
    }
  });
};
</script>
