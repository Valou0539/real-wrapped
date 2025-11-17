export default defineEventHandler(async (event): Promise<IProfile> => {
  const { apiUrl } = useRuntimeConfig();

  const authorization = getHeader(event, "Authorization");
  if (!authorization) {
    throw createError({
      statusCode: 401,
    });
  }

  return $fetch(`${apiUrl}/profile/me`, {
    headers: {
      Authorization: authorization,
    },
  });
});
