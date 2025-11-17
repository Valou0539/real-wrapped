import type { NitroFetchOptions, NitroFetchRequest } from "nitropack";

export const useForgotPasswordRequest = () => {
  const forgotPassword = async (
    forgotPasswordBody: IForgotPasswordBody,
    config?: NitroFetchOptions<NitroFetchRequest>,
  ): ReturnType<typeof $fetch> => {
    return $fetch("/api/auth/forgot-password", {
      ...config,
      method: "POST",
      body: forgotPasswordBody,
    });
  };

  return { execute: forgotPassword };
};
