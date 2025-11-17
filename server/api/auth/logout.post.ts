export default defineEventHandler(async (event): Promise<void> => {
  const { apiUrl } = useRuntimeConfig();

  const authorization = getHeader(event, "Authorization");
  if (!authorization) {
    throw createError({
      statusCode: 401,
    });
  }

  return $fetch(`${apiUrl}/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: authorization,
    },
  });
});
