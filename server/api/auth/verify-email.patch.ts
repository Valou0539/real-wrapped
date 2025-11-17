export default defineEventHandler(async (event): Promise<void> => {
  const { apiUrl } = useRuntimeConfig();
  const body = await readBody<IVerifyEmailBody>(event);

  return $fetch(`${apiUrl}/auth/verify-email`, {
    method: "PATCH",
    body,
  });
});
