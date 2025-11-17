import type { NitroFetchOptions, NitroFetchRequest } from "nitropack";

export const useRequestEmailChangeRequest = () => {
  const requestEmailChange = async (
    body: IRequestEmailChangeBody,
    options?: NitroFetchOptions<NitroFetchRequest>,
  ): Promise<IProfile> => {
    return useAuthFetch().execute<IProfile>(
      "/api/profile/request-email-change",
      {
        ...options,
        method: "POST",
        body: body,
      },
    );
  };

  return { execute: requestEmailChange };
};
