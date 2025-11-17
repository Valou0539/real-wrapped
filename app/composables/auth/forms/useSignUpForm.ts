import type { FormSubmitEvent } from "@primevue/forms";
import type { FormComposable } from "~/types/composables";
import { signUpResolver } from "~/constants/auth/resolvers";
import { AuthErrorContext } from "~/enums/AuthErrorContext";

export const useSignUpForm = (): FormComposable<IRegisterBody> => {
  const initialValues = ref<IRegisterBody>({
    name: "",
    email: "",
    password: "",
    consent: false,
  });
  const resolver = ref(signUpResolver);

  const responseError = ref<string | undefined>(undefined);
  const loading = ref(false);

  const submit = (form: FormSubmitEvent<IRegisterBody>) => {
    responseError.value = undefined;
    if (form.valid) {
      loading.value = true;
      return useRegisterRequest().execute(form.values, {
        onResponse: ({ response }) => {
          loading.value = false;

          if (response.ok) {
            const localePath = useLocalePath();
            navigateTo(
              localePath(`/auth/verify-email?email=${form.values.email}`),
            );
          }
        },
        onResponseError: (error) => {
          responseError.value = handleAuthError(
            error,
            AuthErrorContext.SIGN_UP,
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
