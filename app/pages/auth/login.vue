<template>
  <AuthFormWrapper
    :title="$t('authentication.login.title')"
    :description="$t('authentication.login.not_a_member')"
    :link-to="localePath('/auth/sign-up')"
    :link-text="$t('authentication.login.sign_up_now')"
  >
    <Form
      v-slot="$form"
      :initialValues="initialValues"
      :resolver="resolver"
      class="flex flex-col gap-6"
      @submit="submit($event as FormSubmitEvent<ILoginBody>)"
    >
      <SharedFormLabelWithError
        :error="$t($form.identifier?.error?.message ?? '')"
        :label="$t('authentication.login.username')"
      >
        <InputText autocomplete="username" fluid name="identifier" />
      </SharedFormLabelWithError>

      <SharedFormLabelWithError
        :error="$t($form.password?.error?.message || responseError || '')"
        :label="$t('authentication.login.password')"
      >
        <Password
          :feedback="false"
          :input-props="{ autocomplete: 'current-password' }"
          fluid
          name="password"
          toggle-mask
        />
      </SharedFormLabelWithError>

      <div class="flex items-center justify-between">
        <label class="text-contrast flex items-center gap-3 text-sm/6">
          <Checkbox binary name="remember" />
          {{ $t("authentication.login.remember_me") }}
        </label>

        <div class="text-sm/6">
          <NuxtLinkLocale class="link-primary" to="/auth/forgot-password">
            {{ $t("authentication.login.forgot_password") }}
          </NuxtLinkLocale>
        </div>
      </div>

      <Button
        :loading="loading"
        :label="$t('authentication.login.sign_in')"
        fluid
        type="submit"
      />
    </Form>
  </AuthFormWrapper>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from "@primevue/forms";

useSeoMeta({
  title: $t("authentication.login.seo.title"),
  description: $t("authentication.login.seo.description"),
});
definePageMeta({
  middleware: "disconnected",
});

const localePath = useLocalePath();

const { initialValues, resolver, responseError, loading, submit } =
  useLoginForm();
</script>
