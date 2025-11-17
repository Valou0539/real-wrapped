import type { FormSubmitEvent } from "@primevue/forms";
import { updatePasswordResolver } from "~/constants/account/resolvers";
import type { FormComposable } from "~/types/composables";
import { AccountErrorContext } from "~/enums/AccountErrorContext";

export const useUpdatePasswordForm =
  (): FormComposable<IUpdatePasswordBody> => {
    const toast = useToast();

    const initialValues = ref<IUpdatePasswordBody>({
      current_password: "",
      password: "",
      password_confirmation: "",
    });
    const resolver = ref(updatePasswordResolver);

    const responseError = ref<string | undefined>(undefined);
    const loading = ref(false);

    const submit = (form: FormSubmitEvent<IUpdatePasswordBody>) => {
      responseError.value = undefined;
      if (!form.valid) return;

      loading.value = true;

      return useUpdatePasswordRequest().execute(form.values, {
        onResponse: ({ response }) => {
          loading.value = false;

          if (response.ok) {
            toast.add({
              severity: "success",
              summary: $t("account.security.form.success"),
              detail: $t("account.security.form.successDetail"),
              life: 3000,
            });
            form.reset();
          }
        },
        onResponseError: (error) => {
          responseError.value = handleAccountError(
            error,
            AccountErrorContext.UPDATE_PASSWORD,
          );
        },
      });
    };

    return {
      initialValues,
      resolver,
      responseError,
      loading,
      submit,
    };
  };
