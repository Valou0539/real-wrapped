<template>
  <Dialog
    v-model:visible="visible"
    modal
    dismissableMask
    :draggable="false"
    :header="$t('account.security.deleteAccount.title')"
    class="w-lg mx-4"
    @hide="onDialogHide"
  >
    <Form
      v-slot="$form"
      :initialValues="initialValues"
      :resolver="resolver"
      class="flex flex-col gap-4"
      @submit="submitDeletion($event as FormSubmitEvent<IDeleteAccountBody>)"
    >
      <p class="text-gray text-sm">
        {{ $t("account.security.deleteAccount.description") }}
      </p>

      <SharedFormLabelWithError
        :label="$t('account.security.deleteAccount.passwordLabel')"
        :error="$t($form.password?.error?.message || responseError || '')"
      >
        <Password
          id="delete-account-password"
          name="password"
          :feedback="false"
          :input-props="{ autocomplete: 'current-password' }"
          fluid
          toggle-mask
          :disabled="loading"
        />
      </SharedFormLabelWithError>

      <div class="flex justify-end gap-2">
        <Button type="button" severity="secondary" text @click="closeDialog">
          {{ $t("account.security.deleteAccount.cancel") }}
        </Button>
        <Button
          type="submit"
          severity="danger"
          :loading="loading"
          :label="$t('account.security.deleteAccount.confirm')"
        />
      </div>
    </Form>
  </Dialog>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from "@primevue/forms";

const visible = defineModel<boolean>("visible");

const { initialValues, resolver, responseError, loading, submit, reset } =
  useDeleteAccountForm();

const closeDialog = () => {
  visible.value = false;
  onDialogHide();
};

const onDialogHide = () => {
  reset?.();
};

const submitDeletion = (form: FormSubmitEvent<IDeleteAccountBody>) => {
  submit(form)?.then(() => {
    if (!responseError.value) {
      closeDialog();
    }
  });
};
</script>
