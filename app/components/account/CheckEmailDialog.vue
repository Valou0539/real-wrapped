<template>
  <Dialog
    v-model:visible="visible"
    modal
    dismissableMask
    :draggable="false"
    :header="$t('account.profile.checkEmail.title')"
    @hide="onDialogHide"
    class="w-lg mx-4"
  >
    <Form
      v-slot="$form"
      :initialValues="initialValues"
      :resolver="resolver"
      class="flex flex-col gap-4"
      @submit="submitCode($event as FormSubmitEvent<IConfirmEmailChangeBody>)"
    >
      <p class="text-gray text-sm">
        {{
          $t("account.profile.checkEmail.description", {
            email: email ?? $t("account.profile.checkEmail.defaultEmail"),
          })
        }}
      </p>

      <SharedFormLabelWithError
        :label="$t('account.profile.checkEmail.label')"
        :error="$t($form.code?.error?.message || responseError || '')"
      >
        <InputOtp
          :length="6"
          integer-only
          inputmode="numeric"
          pattern="\\d*"
          autocomplete="one-time-code"
          name="code"
        />
      </SharedFormLabelWithError>

      <div class="flex justify-between gap-2">
        <Button
          type="button"
          severity="secondary"
          text
          :disabled="loading"
          @click="requestEmailChange"
        >
          {{ $t("account.profile.checkEmail.changeEmail") }}
        </Button>
        <div class="flex gap-2">
          <Button type="button" severity="secondary" text @click="closeDialog">
            {{ $t("account.profile.checkEmail.cancel") }}
          </Button>
          <Button
            type="submit"
            :loading="loading"
            :label="$t('account.profile.checkEmail.confirm')"
          />
        </div>
      </div>
    </Form>
  </Dialog>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from "@primevue/forms";

const visible = defineModel<boolean>("visible");
const props = defineProps<{ email: string }>();
const emit = defineEmits<{ (e: "change-email"): void }>();

const { initialValues, resolver, responseError, loading, submit, reset } =
  useCheckEmailForm(props.email);

const closeDialog = () => {
  visible.value = false;
  onDialogHide();
};

const onDialogHide = () => {
  reset?.();
};

const requestEmailChange = () => {
  closeDialog();
  emit("change-email");
};

const submitCode = (form: FormSubmitEvent<IConfirmEmailChangeBody>) => {
  submit(form)?.then(() => {
    if (!responseError.value) {
      closeDialog();
    }
  });
};
</script>
