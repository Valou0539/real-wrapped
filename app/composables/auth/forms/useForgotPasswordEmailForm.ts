import type { FormSubmitEvent } from "@primevue/forms";
import type { FormComposable } from "~/types/composables";
import { forgotPasswordEmailResolver } from "~/constants/auth/resolvers";
import { AuthErrorContext } from "~/enums/AuthErrorContext";

export const useForgotPasswordEmailForm =
  (): FormComposable<IForgotPasswordBody> => {
    const initialValues = ref<IForgotPasswordBody>({
      email: "",
    });
    const resolver = ref(forgotPasswordEmailResolver);

    const responseError = ref<string | undefined>(undefined);
    const loading = ref(false);

    const submit = async (form: FormSubmitEvent<IForgotPasswordBody>) => {
      responseError.value = undefined;
      if (form.valid) {
        loading.value = true;
        return useForgotPasswordRequest().execute(form.values, {
          onResponse: () => {
            loading.value = false;
          },
          onResponseError: (error) => {
            responseError.value = handleAuthError(
              error,
              AuthErrorContext.FORGOT_PASSWORD,
            );
          },
        });
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
