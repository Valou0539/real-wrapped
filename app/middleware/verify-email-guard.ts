export default defineNuxtRouteMiddleware((to) => {
  const email = to.query.email as string;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!email || !emailRegex.test(email)) {
    return abortNavigation();
  }
});
