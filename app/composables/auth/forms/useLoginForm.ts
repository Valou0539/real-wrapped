import type { FormSubmitEvent } from "@primevue/forms";
import type { FormComposable } from "~/types/composables";
import { loginResolver } from "~/constants/auth/resolvers";
import { AuthErrorContext } from "~/enums/AuthErrorContext";

export const useLoginForm = (): FormComposable<ILoginBody> => {
  const authStore = useAuthStore();

  const initialValues = ref<ILoginBody>({
    identifier: "",
    password: "",
    remember: false,
  });
  const resolver = ref(loginResolver);

  const responseError = ref<string | undefined>(undefined);
  const loading = ref(false);

  const submit = (form: FormSubmitEvent<ILoginBody>) => {
    responseError.value = undefined;
    if (form.valid) {
      loading.value = true;
      return useLoginRequest()
        .execute(form.values, {
          onResponse: () => {
            loading.value = false;
          },
          onResponseError: (error) => {
            if (error.response.status === 403) {
              const email =
                error.response._data.data?.email ?? error.response._data.email;
              const localePath = useLocalePath();
              navigateTo(localePath(`/auth/verify-email?email=${email}`));
            } else {
              responseError.value = handleAuthError(
                error,
                AuthErrorContext.LOGIN,
              );
            }
          },
        })
        .then((response: ITokenResponse) => {
          authStore.setTokens(response, form.values.remember);
          useLoadProfile().execute();

          useAuthRedirect().redirect();
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
