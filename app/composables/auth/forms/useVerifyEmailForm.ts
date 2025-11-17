import type { FormSubmitEvent } from "@primevue/forms";
import type { FormComposable } from "~/types/composables";
import { verifyEmailResolver } from "~/constants/auth/resolvers";
import { AuthErrorContext } from "~/enums/AuthErrorContext";

export const useVerifyEmailForm = (
  email: string,
): FormComposable<Omit<IVerifyEmailBody, "email">> => {
  const initialValues = ref({ code: "" });
  const resolver = ref(verifyEmailResolver);

  const responseError = ref<string | undefined>(undefined);
  const loading = ref(false);

  const submit = (form: FormSubmitEvent<Omit<IVerifyEmailBody, "email">>) => {
    responseError.value = undefined;
    if (form.valid) {
      loading.value = true;
      return useVerifyEmailRequest().execute(
        {
          email,
          code: form.values.code,
        },
        {
          onResponse: ({ response }) => {
            loading.value = false;

            if (response.ok) {
              const localePath = useLocalePath();
              navigateTo(localePath("/auth/login"));
            }
          },
          onResponseError: (error) => {
            responseError.value = handleAuthError(
              error,
              AuthErrorContext.VERIFY_EMAIL,
            );
          },
        },
      );
    }
  };

  return {
    initialValues,
    resolver,
    responseError,
    loading,
    submit,
  };
};
