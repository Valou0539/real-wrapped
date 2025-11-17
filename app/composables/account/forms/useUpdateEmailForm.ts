import type { FormSubmitEvent } from "@primevue/forms";
import type { FormComposable } from "~/types/composables";
import { updateEmailResolver } from "~/constants/account/resolvers";
import { AccountErrorContext } from "~/enums/AccountErrorContext";

export const useUpdateEmailForm =
  (): FormComposable<IRequestEmailChangeBody> => {
    const toast = useToast();

    const initialValues = ref({ new_email: "" });
    const resolver = ref(updateEmailResolver);

    const responseError = ref<string | undefined>(undefined);
    const loading = ref(false);

    const submit = async (form: FormSubmitEvent<IRequestEmailChangeBody>) => {
      responseError.value = undefined;
      if (!form.valid) return;

      loading.value = true;
      return useRequestEmailChangeRequest()
        .execute(form.values, {
          onResponse: ({ response }) => {
            loading.value = false;

            if (response.ok) {
              toast.add({
                severity: "success",
                summary: $t("account.profile.updateEmail.success"),
                detail: $t("account.profile.updateEmail.successDetail"),
                life: 3000,
              });
            }
          },
          onResponseError: (error) => {
            responseError.value = handleAccountError(
              error,
              AccountErrorContext.UPDATE_EMAIL,
            );
          },
        })
        .then((profile: IProfile) => {
          useProfileStore().profile = profile;
        });
    };

    const reset = () => {
      initialValues.value = { new_email: "" };
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
