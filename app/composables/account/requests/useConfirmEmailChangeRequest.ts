import type { NitroFetchOptions, NitroFetchRequest } from "nitropack";

export const useConfirmEmailChangeRequest = () => {
  const confirmEmailChange = async (
    body: IConfirmEmailChangeBody,
    options?: NitroFetchOptions<NitroFetchRequest>,
  ): Promise<void> => {
    return useAuthFetch().execute<void>("/api/profile/confirm-email-change", {
      ...options,
      method: "PATCH",
      body: body,
    });
  };

  return { execute: confirmEmailChange };
};
