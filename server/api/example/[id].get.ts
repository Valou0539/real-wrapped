export default defineEventHandler(async (event): Promise<any> => {
  const { apiUrl } = useRuntimeConfig();

  const authorization = getHeader(event, "Authorization");
  if (!authorization) {
    throw createError({
      statusCode: 401,
    });
  }

  return $fetch(`${apiUrl}/example/${event.context.params?.id}`, {
    method: "GET",
    headers: {
      Authorization: authorization,
    },
  });
});
