import type { FormSubmitEvent } from "@primevue/forms";
import type { FormComposable } from "~/types/composables";
import { forgotPasswordPasswordResolver } from "~/constants/auth/resolvers";
import { AuthErrorContext } from "~/enums/AuthErrorContext";

export const useForgotPasswordPasswordForm =
  (): FormComposable<ICreateNewPasswordBody> => {
    const initialValues = ref<ICreateNewPasswordBody>({
      code: "",
      password: "",
      password_confirmation: "",
    });
    const resolver = ref(forgotPasswordPasswordResolver);

    const responseError = ref<string | undefined>(undefined);
    const loading = ref(false);

    const submit = (form: FormSubmitEvent<ICreateNewPasswordBody>) => {
      responseError.value = undefined;
      if (form.valid) {
        loading.value = true;
        return useCreateNewPasswordRequest().execute(form.values, {
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
              AuthErrorContext.CREATE_PASSWORD,
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
