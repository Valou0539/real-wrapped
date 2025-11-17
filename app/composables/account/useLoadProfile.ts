export const useLoadProfile = () => {
  const profileStore = useProfileStore();

  const loadProfile = async (): Promise<void> => {
    profileStore.profile = await useLoadProfileRequest().execute();
  };

  return { execute: loadProfile };
};
