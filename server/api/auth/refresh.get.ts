export default defineEventHandler(async (event): Promise<ITokenResponse> => {
  const { apiUrl } = useRuntimeConfig();

  const authorization = getHeader(event, "Authorization");
  if (!authorization) {
    throw createError({
      statusCode: 401,
    });
  }

  return $fetch(`${apiUrl}/auth/refresh`, {
    headers: {
      Authorization: authorization,
    },
  });
});
