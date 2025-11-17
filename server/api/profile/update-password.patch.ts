export default defineEventHandler(async (event): Promise<void> => {
  const { apiUrl } = useRuntimeConfig();
  const authorization = getHeader(event, "Authorization");

  if (!authorization) {
    throw createError({
      statusCode: 401,
    });
  }

  const body = await readBody<IUpdatePasswordBody | undefined>(event);

  if (!body?.current_password || !body.password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Password data is required",
    });
  }

  return $fetch<void>(`${apiUrl}/profile/update-password`, {
    method: "PATCH",
    headers: {
      Authorization: authorization,
    },
    body,
  });
});
