export default defineEventHandler(async (event): Promise<void> => {
  const { apiUrl } = useRuntimeConfig();
  const body = await readBody<IResendVerificationEmailBody>(event);

  return $fetch(`${apiUrl}/auth/resend-verification-email`, {
    method: "POST",
    body,
  });
});
