export const useLogoutRequest = () => {
  const logout = async (): Promise<void> => {
    return useAuthFetch().execute("/api/auth/logout", {
      method: "POST",
    });
  };

  return { execute: logout };
};
