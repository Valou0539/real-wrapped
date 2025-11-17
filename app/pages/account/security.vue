<template>
  <div class="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
    <h2 class="text-contrast text-base/7 font-semibold">
      {{ $t("account.security.title") }}
    </h2>
    <p class="text-gray mt-1 text-sm/6">
      {{ $t("account.security.description") }}
    </p>

    <dl
      class="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6 dark:divide-white/5 dark:border-white/5"
    >
      <div class="py-6 sm:flex">
        <dt class="text-contrast font-medium sm:w-64 sm:flex-none sm:pr-6">
          {{ $t("account.security.sections.password.title") }}
        </dt>
        <dd class="mt-1 flex flex-col gap-6 sm:mt-0 sm:flex-auto">
          <Form
            v-slot="$form"
            :initialValues="initialValues"
            :resolver="resolver"
            class="flex w-full max-w-md flex-col gap-6"
            @submit="submit($event as FormSubmitEvent<IUpdatePasswordBody>)"
          >
            <SharedFormLabelWithError
              :label="$t('account.security.form.current_password')"
              :error="
                $t(
                  $form.current_password?.error?.message || responseError || '',
                )
              "
            >
              <Password
                :feedback="false"
                :input-props="{ autocomplete: 'current-password' }"
                fluid
                name="current_password"
                toggle-mask
                :disabled="loading"
              />
            </SharedFormLabelWithError>

            <SharedFormLabelWithError
              :label="$t('account.security.form.new_password')"
              :error="$t($form.password?.error?.message ?? '')"
            >
              <Password
                :feedback="false"
                :input-props="{ autocomplete: 'new-password' }"
                fluid
                name="password"
                toggle-mask
                :disabled="loading"
              />
            </SharedFormLabelWithError>

            <SharedFormLabelWithError
              :label="$t('account.security.form.password_confirmation')"
              :error="$t($form.password_confirmation?.error?.message ?? '')"
            >
              <Password
                :feedback="false"
                :input-props="{ autocomplete: 'new-password' }"
                fluid
                name="password_confirmation"
                toggle-mask
                :disabled="loading"
              />
            </SharedFormLabelWithError>

            <div class="flex justify-end">
              <Button
                :loading="loading"
                :label="$t('account.security.form.submit')"
                type="submit"
              />
            </div>
          </Form>
        </dd>
      </div>
      <div class="py-6 sm:flex">
        <dt class="text-contrast font-medium sm:w-64 sm:flex-none sm:pr-6">
          {{ $t("account.security.sections.deleteAccount.title") }}
        </dt>
        <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
          <div class="text-gray-900 dark:text-gray-300">
            {{ $t("account.security.sections.deleteAccount.description") }}
          </div>
          <button
            type="button"
            class="link-danger text-nowrap"
            @click="isDeleteDialogVisible = true"
          >
            {{ $t("account.security.deleteAccount.confirm") }}
          </button>
        </dd>
      </div>
    </dl>

    <AccountDeleteAccountDialog v-model:visible="isDeleteDialogVisible" />
  </div>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from "@primevue/forms";

useSeoMeta({
  title: $t("account.security.seo.title"),
  description: $t("account.security.seo.description"),
});

const { initialValues, resolver, responseError, loading, submit } =
  useUpdatePasswordForm();

const isDeleteDialogVisible = ref(false);
</script>
