import type { NitroFetchOptions, NitroFetchRequest } from "nitropack";

export const useResendVerificationEmailRequest = () => {
  const resendVerificationEmail = async (
    verifyEmailBody: IResendVerificationEmailBody,
    config?: NitroFetchOptions<NitroFetchRequest>,
  ): ReturnType<typeof $fetch> => {
    return $fetch("/api/auth/resend-verification-email", {
      ...config,
      method: "POST",
      body: verifyEmailBody,
    })
  };

  return { execute: resendVerificationEmail };
};
