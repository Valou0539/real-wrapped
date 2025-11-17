import type { FormSubmitEvent } from "@primevue/forms";
import type { FormComposable } from "~/types/composables";
import { updateNameResolver } from "~/constants/account/resolvers";
import { AccountErrorContext } from "~/enums/AccountErrorContext";

export const useUpdateNameForm = (): FormComposable<IUpdateNameBody> => {
  const toast = useToast();

  const initialValues = ref({ name: "" });
  const resolver = ref(updateNameResolver);

  const responseError = ref<string | undefined>(undefined);
  const loading = ref(false);

  const submit = async (form: FormSubmitEvent<IUpdateNameBody>) => {
    responseError.value = undefined;
    if (!form.valid) return;

    loading.value = true;
    return useUpdateNameRequest().execute(form.values, {
      onResponse: ({ response }) => {
        loading.value = false;

        if (response.ok) {
          useProfileStore().profile!.name = form.values.name;
          toast.add({
            severity: "success",
            summary: $t("account.profile.updateName.success"),
            detail: $t("account.profile.updateName.successDetail"),
            life: 3000,
          });
        }
      },
      onResponseError: (error) => {
        loading.value = false;
        responseError.value = handleAccountError(
          error,
          AccountErrorContext.UPDATE_NAME,
        );
      },
    });
  };

  const reset = () => {
    initialValues.value = { name: "" };
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
