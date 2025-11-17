import type { NitroFetchOptions, NitroFetchRequest } from "nitropack";

export const useUpdateNameRequest = () => {
  const updateName = (
    body: IUpdateNameBody,
    options?: NitroFetchOptions<NitroFetchRequest>,
  ): Promise<void> => {
    return useAuthFetch().execute<void>("/api/profile/update-name", {
      ...options,
      method: "PATCH",
      body: body,
    });
  };

  return { execute: updateName };
};
