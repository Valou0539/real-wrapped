export default defineEventHandler(async (event) => {
  const { apiUrl } = useRuntimeConfig();
  const body = await readBody<IForgotPasswordBody>(event);

  return $fetch(`${apiUrl}/auth/forgot-password`, {
    method: "POST",
    body,
  });
});
