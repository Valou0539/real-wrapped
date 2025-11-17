import type { FormSubmitEvent } from "@primevue/forms";
import type { FormComposable } from "~/types/composables";
import { deleteAccountResolver } from "~/constants/account/resolvers";
import { AccountErrorContext } from "~/enums/AccountErrorContext";

export const useDeleteAccountForm = (): FormComposable<IDeleteAccountBody> => {
  const toast = useToast();

  const initialValues = ref({ password: "" });
  const resolver = ref(deleteAccountResolver);

  const responseError = ref<string | undefined>(undefined);
  const loading = ref(false);

  const submit = async (form: FormSubmitEvent<IDeleteAccountBody>) => {
    responseError.value = undefined;
    if (!form.valid) return;

    loading.value = true;
    return useDeleteAccountRequest().execute(form.values, {
      onResponse: async ({ response }) => {
        loading.value = false;

        if (response.ok) {
          toast.add({
            severity: "success",
            summary: $t("account.security.deleteAccount.success"),
            detail: $t("account.security.deleteAccount.successDetail"),
            life: 3000,
          });
          await useLogout().executeLocal();
          const localePath = useLocalePath();
          navigateTo(localePath("/auth/login"));
        }
      },
      onResponseError: (error) => {
        responseError.value = handleAccountError(
          error,
          AccountErrorContext.DELETE_ACCOUNT,
        );
      },
    });
  };

  const reset = () => {
    initialValues.value = { password: "" };
    responseError.value = undefined;
    loading.value = false;
  };

  return {
    initialValues,
    resolver,
    responseError,
    loading,
    submit,
    reset,
  };
};
