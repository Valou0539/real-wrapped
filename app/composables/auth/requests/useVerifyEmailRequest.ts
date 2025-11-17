import type { NitroFetchOptions, NitroFetchRequest } from "nitropack";

export const useVerifyEmailRequest = () => {
  const verifyEmail = async (
    verifyEmailBody: IVerifyEmailBody,
    config?: NitroFetchOptions<NitroFetchRequest>,
  ): Promise<void> => {
    return $fetch("/api/auth/verify-email", {
      ...config,
      method: "PATCH",
      body: verifyEmailBody,
    });
  };

  return { execute: verifyEmail };
};
