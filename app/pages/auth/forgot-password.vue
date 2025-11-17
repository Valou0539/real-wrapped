<template>
  <main class="background flex min-h-screen flex-1 px-4 py-20">
    <div class="mx-auto w-full max-w-sm duration-300 lg:w-96 xl:transition-all">
      <div class="mt-24">
        <Button
          :as="NuxtLinkLocale"
          to="/auth/login"
          severity="secondary"
          size="small"
        >
          <ArrowLeftIcon class="size-4" />
          {{ $t("authentication.forgot-password.back_to_login") }}
        </Button>

        <h2
          class="text-contrast mt-12 text-2xl/9 font-bold tracking-tight lg:mt-32"
        >
          {{ $t("authentication.forgot-password.title") }}
        </h2>
        <p class="text-gray mt-2 text-sm/6">
          <span v-if="step === 'email'">
            {{ $t("authentication.forgot-password.enter_email") }}
          </span>
          <span v-else>
            {{ $t("authentication.forgot-password.code_sent") }}
            <span class="font-semibold">{{ email }}</span>
          </span>
        </p>
      </div>

      <div class="mt-10">
        <!-- Step 1: Email form -->
        <div v-if="step === 'email'">
          <Form
            v-slot="$form"
            :initialValues="emailFormValues"
            :resolver="emailResolver"
            class="flex flex-col gap-6"
            @submit="
              onEmailSubmit($event as FormSubmitEvent<IForgotPasswordBody>)
            "
          >
            <SharedFormLabelWithError
              :error="$t($form.email?.error?.message || responseError || '')"
              :label="$t('authentication.forgot-password.email')"
            >
              <InputText
                autocomplete="email"
                fluid
                name="email"
                :disabled="emailForm.loading.value"
              />
            </SharedFormLabelWithError>

            <Button
              :loading="emailForm.loading.value"
              :label="$t('authentication.forgot-password.send_code')"
              fluid
              type="submit"
            />
          </Form>
        </div>

        <!-- Step 2: New password form -->
        <div v-else>
          <Form
            v-slot="$form"
            :initialValues="passwordFormValues"
            :resolver="passwordResolver"
            class="flex flex-col gap-6"
            @submit="
              passwordForm.submit(
                $event as FormSubmitEvent<ICreateNewPasswordBody>,
              )
            "
          >
            <SharedFormLabelWithError
              :error="$t($form.code?.error?.message || responseError || '')"
              :label="$t('authentication.forgot-password.verification_code')"
            >
              <InputOtp :length="8" integer-only name="code" />
            </SharedFormLabelWithError>

            <SharedFormLabelWithError
              :error="$t($form.password?.error?.message ?? '')"
              :label="$t('authentication.forgot-password.new_password')"
            >
              <Password
                :feedback="false"
                :input-props="{ autocomplete: 'new-password' }"
                fluid
                name="password"
                toggle-mask
              />
            </SharedFormLabelWithError>

            <SharedFormLabelWithError
              :error="$t($form.password_confirmation?.error?.message ?? '')"
              :label="$t('authentication.forgot-password.confirm_password')"
            >
              <Password
                :feedback="false"
                :input-props="{ autocomplete: 'new-password' }"
                fluid
                name="password_confirmation"
                toggle-mask
              />
            </SharedFormLabelWithError>

            <Button
              :loading="passwordForm.loading.value"
              :label="$t('authentication.forgot-password.reset_password')"
              fluid
              type="submit"
            />
          </Form>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts" setup>
import { NuxtLinkLocale } from "#components";
import { ArrowLeftIcon } from "@heroicons/vue/24/outline";
import type { FormSubmitEvent } from "@primevue/forms";

useSeoMeta({
  title: $t("authentication.forgot-password.seo.title"),
  description: $t("authentication.forgot-password.seo.description"),
});
definePageMeta({
  middleware: "disconnected",
});

const { step, email, emailForm, passwordForm, responseError, onEmailSubmit } =
  useForgotPasswordWorkflow();

const emailFormValues = emailForm.initialValues;
const emailResolver = emailForm.resolver;
const passwordFormValues = passwordForm.initialValues;
const passwordResolver = passwordForm.resolver;
</script>
