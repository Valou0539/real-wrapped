export default defineEventHandler(async (event): Promise<void> => {
  const { apiUrl } = useRuntimeConfig();
  const authorization = getHeader(event, "Authorization");

  if (!authorization) {
    throw createError({
      statusCode: 401,
    });
  }

  const body = await readBody<IDeleteAccountBody | undefined>(event);

  if (!body?.password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Password is required",
    });
  }

  return $fetch<void>(`${apiUrl}/profile/delete-account`, {
    method: "DELETE",
    headers: {
      Authorization: authorization,
    },
    body,
  });
});
