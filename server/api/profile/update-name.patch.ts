export default defineEventHandler(async (event): Promise<IProfile> => {
  const { apiUrl } = useRuntimeConfig();
  const authorization = getHeader(event, "Authorization");

  if (!authorization) {
    throw createError({
      statusCode: 401,
    });
  }

  const body = await readBody<IUpdateNameBody>(event);

  if (!body?.name?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: "Name is required",
    });
  }

  return $fetch<IProfile>(`${apiUrl}/profile/update-name`, {
    method: "PATCH",
    headers: {
      Authorization: authorization,
    },
    body: {
      name: body.name.trim(),
    },
  });
});
