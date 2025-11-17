export default defineEventHandler(async (event): Promise<ITokenResponse> => {
  const { apiUrl } = useRuntimeConfig();
  const body = await readBody<ILoginBody>(event);

  return $fetch(`${apiUrl}/auth/login`, {
    method: "POST",
    body,
  });
});
