export default defineEventHandler(async (event) => {
  const { apiUrl } = useRuntimeConfig();
  const body = await readBody<ICreateNewPasswordBody>(event);

  return $fetch(`${apiUrl}/auth/create-new-password`, {
    method: "PATCH",
    body,
  });
});
