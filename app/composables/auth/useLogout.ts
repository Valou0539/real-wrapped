export const useLogout = () => {
  const authStore = useAuthStore();

  const logout = async (): Promise<void> => {
    await useLogoutRequest()
      .execute()
      .finally(() => deleteData());
  };

  const localLogout = (): void => {
    deleteData();
  };

  const deleteData = (): void => {
    useProfileStore().profile = undefined;
    authStore.clearTokens(useRoute().path);
  };

  return {
    execute: logout,
    executeLocal: localLogout,
  };
};
