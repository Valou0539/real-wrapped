import type { NitroFetchOptions, NitroFetchRequest } from "nitropack";

export const useLoginRequest = () => {
  const login = async (
    loginBody: ILoginBody,
    config?: NitroFetchOptions<NitroFetchRequest>,
  ): Promise<ITokenResponse> => {
    return $fetch<ITokenResponse>("/api/auth/login", {
      ...config,
      method: "POST",
      body: loginBody,
    });
  };

  return { execute: login };
};
