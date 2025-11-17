import type { FormSubmitEvent } from "@primevue/forms";

export const useForgotPasswordWorkflow = () => {
  const step = ref<"email" | "password">("email");
  const email = ref<string>("");

  // Email form
  const emailForm = useForgotPasswordEmailForm();

  // Password form
  const passwordForm = useForgotPasswordPasswordForm();

  const responseError = computed(() => {
    return step.value === "email"
      ? emailForm.responseError.value
      : passwordForm.responseError.value;
  });

  const onEmailSubmit = async (form: FormSubmitEvent<IForgotPasswordBody>) => {
    email.value = form.values.email;
    const result = await emailForm.submit(form);
    if (result) {
      step.value = "password";
    }
  };

  return {
    step,
    email,
    emailForm,
    passwordForm,
    responseError,
    onEmailSubmit,
  };
};
