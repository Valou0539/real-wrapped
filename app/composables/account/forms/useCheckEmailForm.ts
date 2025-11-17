import type { FormSubmitEvent } from "@primevue/forms";
import { checkEmailCodeResolver } from "~/constants/account/resolvers";
import type { FormComposable } from "~/types/composables";
import { AccountErrorContext } from "~/enums/AccountErrorContext";

export const useCheckEmailForm = (
  email: string,
): FormComposable<Omit<IConfirmEmailChangeBody, "email">> => {
  const toast = useToast();

  const initialValues = ref({ code: "" });
  const resolver = ref(checkEmailCodeResolver);

  const responseError = ref<string | undefined>(undefined);
  const loading = ref(false);

  const submit = async (
    form: FormSubmitEvent<Omit<IConfirmEmailChangeBody, "email">>,
  ) => {
    responseError.value = undefined;
    if (!form.valid) return;

    loading.value = true;
    return useConfirmEmailChangeRequest().execute(
      {
        email: email,
        code: form.values.code,
      },
      {
        onResponse: ({ response }) => {
          loading.value = false;

          if (response.ok) {
            const profileStore = useProfileStore();
            profileStore.profile!.email = email;
            profileStore.profile!.email_being_changed = undefined;
            toast.add({
              severity: "success",
              summary: $t("account.profile.checkEmail.success"),
              detail: $t("account.profile.checkEmail.successDetail"),
              life: 3000,
            });
          }
        },
        onResponseError: (error) => {
          responseError.value = handleAccountError(
            error,
            AccountErrorContext.CHECK_EMAIL,
          );
        },
      },
    );
  };

  const reset = () => {
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
