<template>
  <main class="background pt-20">
    <section
      class="mx-auto min-h-[calc(100vh-8rem)] max-w-sm space-y-8 px-6 pb-24 pt-12 lg:px-8"
    >
      <div>
        <h2
          class="text-contrast mt-24 text-2xl/9 font-bold tracking-tight lg:mt-32"
        >
          {{ $t("authentication.verify-email.title") }}
        </h2>
        <p class="text-gray mt-2 text-sm/6">
          {{ $t("authentication.verify-email.email_sent") }}
          <span class="font-semibold">{{ email }}</span>
        </p>
      </div>
      <Form
        v-slot="$form"
        :initialValues="initialValues"
        :resolver="resolver"
        @submit="submit($event as FormSubmitEvent<IVerifyEmailBody>)"
      >
        <SharedFormLabelWithError
          :error="$t($form.code?.error?.message || responseError || '')"
          label=""
        >
          <InputOtp v-model="code" :length="6" integer-only name="code" />
        </SharedFormLabelWithError>
        <div class="mt-4 flex items-center gap-4">
          <Button
            :loading="loading"
            :label="$t('authentication.verify-email.verify')"
            type="submit"
          />
          <Button
            :disabled="loading"
            :loading="resendLoading"
            :label="$t('authentication.verify-email.resend_code')"
            severity="secondary"
            text
            @click="resendVerificationEmail(email)"
          />
        </div>
      </Form>
    </section>
  </main>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from "@primevue/forms";

useSeoMeta({
  title: $t("authentication.verify-email.seo.title"),
  description: $t("authentication.verify-email.seo.description"),
});
definePageMeta({
  middleware: ["disconnected", "verify-email-guard"],
});

const email = useRoute().query.email as string;
const code = ref("");

const { initialValues, resolver, responseError, loading, submit } =
  useVerifyEmailForm(email);

const { resend: resendVerificationEmail, loading: resendLoading } =
  useResendVerificationEmail();
</script>
