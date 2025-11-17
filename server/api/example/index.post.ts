export default defineEventHandler(async (event): Promise<void> => {
  const { apiUrl } = useRuntimeConfig();

  const body = await readBody(event);

  const authorization = getHeader(event, "Authorization");
  if (!authorization) {
    throw createError({
      statusCode: 401,
    });
  }

  return $fetch(`${apiUrl}/example`, {
    method: "POST",
    body,
    headers: {
      Authorization: authorization,
    },
  });
});
