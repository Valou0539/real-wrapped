export const useConfirmReset = () => {
  const confirm = useConfirm();
  const { t } = useI18n();

  const reset = (callback?: () => void) => {
    confirm.require({
      message: t("music-history.reset.confirm.message"),
      header: t("music-history.reset.confirm.header"),
      rejectProps: {
        label: t("music-history.reset.confirm.reject"),
        unstyled: true,
        class: "ui-btn !h-12 px-6 text-base font-bold",
      },
      acceptProps: {
        label: t("music-history.reset.confirm.accept"),
        unstyled: true,
        class: "ui-btn ui-cta !h-12 px-6 text-base font-bold",
      },
      accept: () => {
        useMusicHistoryStore().deleteHistory();
        useWrappedStore().resetAll();

        const localePath = useLocalePath();
        navigateTo(localePath("/"));

        callback?.();
      },
    });
  };

  return {
    reset,
  };
};
