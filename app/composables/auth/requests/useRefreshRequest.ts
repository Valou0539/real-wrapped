import type { NitroFetchOptions, NitroFetchRequest } from "nitropack";

export const useRefreshRequest = () => {
  const authStore = useAuthStore();

  const refresh = async (
    config?: NitroFetchOptions<NitroFetchRequest>,
  ): Promise<ITokenResponse> => {
    return $fetch<ITokenResponse>("/api/auth/refresh", {
      ...config,
      headers: {
        Authorization: `Bearer ${authStore.sessionRefreshToken}`,
      },
    });
  };

  return { execute: refresh };
};
