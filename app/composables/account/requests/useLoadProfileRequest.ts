export const useLoadProfileRequest = () => {
  const loadProfile = async (): Promise<IProfile> => {
    return useAuthFetch().execute<IProfile>("/api/profile/me");
  };

  return { execute: loadProfile };
};
