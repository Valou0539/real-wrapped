import type { FormSubmitEvent } from "@primevue/forms";
import type { FormComposable } from "~/types/composables";
import { uploadHistoryResolver } from "~/constants/music-history/resolvers";
import type { UploadHistoryFormValues } from "~/types/history";

export const useUploadHistoryForm = (
  onProcessStart: () => void,
): FormComposable<UploadHistoryFormValues> => {
  const initialValues = ref<Partial<UploadHistoryFormValues>>({
    files: undefined,
  });
  const resolver = ref(uploadHistoryResolver);

  const responseError = ref<string | undefined>(undefined);
  const loading = ref(false);

  const submit = async (form: FormSubmitEvent<UploadHistoryFormValues>) => {
    responseError.value = undefined;
    if (!form.valid) {
      return;
    }

    loading.value = true;

    const wrappedYear = useRuntimeConfig().public.wrappedYear;
    const tracks = (
      await fileListToTypedObjects<MusicHistoryTrack>(form.values.files)
    ).filter(
      (track) =>
        new Date(track.endTime).getFullYear() === parseInt(wrappedYear),
    );

    return useEnhanceHistoryRequest()
      .execute(tracks, {
        onResponse: () => {
          loading.value = false;
        },
      })
      .then((data) => {
        const musicHistoryStore = useMusicHistoryStore();
        musicHistoryStore.jobId = data.jobId;
        onProcessStart();
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
