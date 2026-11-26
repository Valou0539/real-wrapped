import type { FormSubmitEvent } from "@primevue/forms";
import type { FormComposable } from "~/types/composables";
import { uploadHistoryResolver } from "~/constants/music-history/resolvers";
import type { UploadHistoryFormValues } from "~/types/history";

export const useUploadHistoryForm =
  (): FormComposable<UploadHistoryFormValues> => {
    const initialValues = ref<Partial<UploadHistoryFormValues>>({
      files: undefined,
      year: getDefaultHistoryYear(),
    });
    const resolver = ref(uploadHistoryResolver);

    const responseError = ref<string | undefined>(undefined);
    const loading = ref(false);

    const confirm = useConfirm();
    const { t } = useI18n();

    const confirmReplaceYear = (year: number) =>
      new Promise<boolean>((resolve) => {
        confirm.require({
          message: t("music-history.upload.confirm-replace.message", { year }),
          header: t("music-history.upload.confirm-replace.header"),
          rejectProps: {
            label: t("music-history.upload.confirm-replace.reject"),
            unstyled: true,
            class: "ui-btn !h-12 px-6 text-base font-bold",
          },
          acceptProps: {
            label: t("music-history.upload.confirm-replace.accept"),
            unstyled: true,
            class: "ui-btn ui-cta !h-12 px-6 text-base font-bold",
          },
          accept: () => resolve(true),
          reject: () => resolve(false),
          onHide: () => resolve(false),
        });
      });

    const submit = async (form: FormSubmitEvent<UploadHistoryFormValues>) => {
      const musicHistoryStore = useMusicHistoryStore();
      if (loading.value || musicHistoryStore.isLoading) {
        return;
      }

      responseError.value = undefined;
      if (!form.valid) {
        return;
      }

      const year = form.values.year;
      if (!isHistoryYear(year)) {
        responseError.value = "music-history.upload.errors.year";
        return;
      }

      loading.value = true;
      musicHistoryStore.isLoading = true;

      try {
        const tracks = filterHistoryByYear(
          await fileListToTypedObjects<MusicHistoryTrack>(form.values.files),
          year,
        );
        if (tracks.length === 0) {
          responseError.value = "music-history.upload.errors.no-tracks";
          return;
        }

        if (
          musicHistoryStore.availableYears.includes(year) &&
          !(await confirmReplaceYear(year))
        ) {
          return;
        }

        const data = await useEnhanceHistoryRequest().execute(tracks);

        // A year only ever has one tracked job: supersede any previous one —
        // stuck errored entries would otherwise shadow the new job in the UI,
        // and a still-running import for the same year must not complete later
        // on top of the fresher data.
        for (const [oldJobId, oldYear] of Object.entries(
          musicHistoryStore.jobs,
        )) {
          if (oldYear !== year) continue;
          delete musicHistoryStore.jobs[oldJobId];
          useCancelJobRequest()
            .execute(oldJobId)
            .catch(() => {});
        }

        musicHistoryStore.importError = undefined;
        musicHistoryStore.jobs[data.jobId] = year;
        musicHistoryStore.isImporting = false;
        musicHistoryStore.selectYear(year);
        await navigateTo(useLocalePath()("/"));
      } catch (error) {
        console.error("Failed to start history import:", error);
        responseError.value = "music-history.upload.errors.request";
      } finally {
        loading.value = false;
        musicHistoryStore.isLoading = false;
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
