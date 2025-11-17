export default defineEventHandler(async (event): Promise<string> => {
  const authorization = getHeader(event, "Authorization");
  if (!authorization) {
    throw createError({
      statusCode: 401,
    });
  }

  const responses = ["Hello", "Bonjour", "Hola", "Ciao", "Guten Tag"];
  const randomIndex = Math.floor(Math.random() * responses.length);

  // Wait for 3 seconds
  await new Promise((resolve) => setTimeout(resolve, 3000));

  return responses[randomIndex] as string;
});
