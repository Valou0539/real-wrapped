export default defineEventHandler(async (event): Promise<void> => {
  const { apiUrl } = useRuntimeConfig();
  const authorization = getHeader(event, "Authorization");

  if (!authorization) {
    throw createError({
      statusCode: 401,
    });
  }

  const body = await readBody<IConfirmEmailChangeBody>(event);
  const email = body?.email?.trim();
  const code = body?.code?.trim();

  if (!email || !code) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email and verification code are required",
    });
  }

  await $fetch(`${apiUrl}/profile/confirm-email-change`, {
    method: "PATCH",
    headers: {
      Authorization: authorization,
    },
    body: {
      email,
      code,
    },
  });
});
