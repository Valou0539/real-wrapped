<template>
  <AuthFormWrapper
    :title="$t('authentication.sign-up.title')"
    :description="$t('authentication.sign-up.already_a_member')"
    :link-to="localePath('/auth/login')"
    :link-text="$t('authentication.sign-up.sign_in_now')"
    :error-message="responseError ? $t(responseError) : undefined"
  >
    <Form
      v-slot="$form"
      :initialValues="initialValues"
      :resolver="resolver"
      class="flex flex-col gap-6"
      @submit="submit($event as FormSubmitEvent<IRegisterBody>)"
    >
      <SharedFormLabelWithError
        :error="$t($form.name?.error?.message ?? '')"
        :label="$t('authentication.sign-up.username')"
      >
        <InputText autocomplete="username" fluid name="name" />
      </SharedFormLabelWithError>

      <SharedFormLabelWithError
        :error="$t($form.email?.error?.message ?? '')"
        :label="$t('authentication.sign-up.email')"
      >
        <InputText autocomplete="email" fluid name="email" />
      </SharedFormLabelWithError>

      <SharedFormLabelWithError
        :error="$t($form.password?.error?.message ?? '')"
        :label="$t('authentication.sign-up.password')"
      >
        <Password
          :feedback="false"
          :input-props="{ autocomplete: 'new-password' }"
          autocomplete="current-password"
          fluid
          name="password"
          toggle-mask
        />
      </SharedFormLabelWithError>

      <div>
        <label class="text-contrast flex items-center gap-3 text-sm/6">
          <Checkbox binary name="consent" />
          <span>
            {{ $t("authentication.sign-up.i_agree_to") }}
            <NuxtLinkLocale class="link-primary" to="#">
              {{ $t("authentication.sign-up.terms_of_service") }}
            </NuxtLinkLocale>
          </span>
        </label>
        <Message
          v-if="$form.consent?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $t($form.consent?.error?.message) }}
        </Message>
      </div>

      <Button
        :loading="loading"
        :label="$t('authentication.sign-up.sign_up')"
        fluid
        type="submit"
      />
    </Form>
  </AuthFormWrapper>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from "@primevue/forms";

useSeoMeta({
  title: $t("authentication.sign-up.seo.title"),
  description: $t("authentication.sign-up.seo.description"),
});
definePageMeta({
  middleware: "disconnected",
});

const localePath = useLocalePath();

const { initialValues, resolver, responseError, loading, submit } =
  useSignUpForm();
</script>
