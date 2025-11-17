export default defineEventHandler(async (event): Promise<void> => {
  const { apiUrl } = useRuntimeConfig();
  const authorization = getHeader(event, "Authorization");

  if (!authorization) {
    throw createError({
      statusCode: 401,
    });
  }

  const body = await readBody<IRequestEmailChangeBody>(event);
  const newEmail = body?.new_email?.trim();

  if (!newEmail) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email is required",
    });
  }

  await $fetch(`${apiUrl}/profile/request-email-change`, {
    method: "POST",
    headers: {
      Authorization: authorization,
    },
    body: {
      new_email: newEmail,
    },
  });
});
