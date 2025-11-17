export default defineEventHandler(async (event): Promise<void> => {
  const { apiUrl } = useRuntimeConfig();
  const body = await readBody<IRegisterBody>(event);

  return $fetch(`${apiUrl}/auth/create`, {
    method: "POST",
    body,
  });
});
