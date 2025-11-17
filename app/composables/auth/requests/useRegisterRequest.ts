import type { NitroFetchOptions, NitroFetchRequest } from "nitropack";

export const useRegisterRequest = () => {
  const register = async (
    registerBody: IRegisterBody,
    config?: NitroFetchOptions<NitroFetchRequest>,
  ): Promise<void> => {
    return $fetch<void>("/api/auth/create", {
      ...config,
      method: "POST",
      body: registerBody,
    });
  };

  return { execute: register };
};
