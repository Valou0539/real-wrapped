import type { NitroFetchOptions, NitroFetchRequest } from "nitropack";

export const useUpdatePasswordRequest = () => {
  const updatePassword = (
    body: IUpdatePasswordBody,
    options?: NitroFetchOptions<NitroFetchRequest>,
  ): Promise<void> => {
    return useAuthFetch().execute<void>("/api/profile/update-password", {
      ...options,
      method: "PATCH",
      body: body,
    });
  };

  return { execute: updatePassword };
};
