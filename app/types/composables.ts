import type { FormSubmitEvent } from "@primevue/forms";
import type { Ref } from "vue";
import type { zodResolver } from "@primevue/forms/resolvers/zod";

/**
 * Type générique pour les composables de formulaire
 */
export interface FormComposable<T extends Record<string, any>> {
  initialValues: Ref<Partial<T>>;
  resolver: Ref<ReturnType<typeof zodResolver>>;
  responseError: Ref<string | undefined>;
  loading: Ref<boolean>;
  submit: (form: FormSubmitEvent<T>) => Promise<unknown> | undefined;
  reset?: () => void;
}
