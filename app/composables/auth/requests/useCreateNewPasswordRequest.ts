import type { NitroFetchOptions, NitroFetchRequest } from "nitropack";

export const useCreateNewPasswordRequest = () => {
  const createNewPassword = async (
    createNewPasswordBody: ICreateNewPasswordBody,
    config?: NitroFetchOptions<NitroFetchRequest>,
  ): Promise<void> => {
    return $fetch("/api/auth/create-new-password", {
      ...config,
      method: "PATCH",
      body: createNewPasswordBody,
    });
  };

  return { execute: createNewPassword };
};
