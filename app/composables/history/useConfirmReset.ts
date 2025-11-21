export const useConfirmReset = () => {
  const confirm = useConfirm();
  const { t } = useI18n();

  const reset = (callback?: () => void) => {
    confirm.require({
      message: t("music-history.reset.confirm.message"),
      header: t("music-history.reset.confirm.header"),
      icon: "pi pi-exclamation-triangle",
      rejectProps: {
        label: t("music-history.reset.confirm.reject"),
        severity: "secondary",
      },
      acceptProps: {
        label: t("music-history.reset.confirm.accept"),
        severity: "danger",
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
