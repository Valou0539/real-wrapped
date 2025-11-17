import type { NitroFetchOptions, NitroFetchRequest } from "nitropack";

export const useDeleteAccountRequest = () => {
  const deleteAccount = async (
    body: IDeleteAccountBody,
    options?: NitroFetchOptions<NitroFetchRequest>,
  ): Promise<void> => {
    return useAuthFetch().execute<void>("/api/profile/delete-account", {
      ...options,
      method: "DELETE",
      body,
    });
  };

  return { execute: deleteAccount };
};
