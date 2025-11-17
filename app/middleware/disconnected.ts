export default defineNuxtRouteMiddleware(async () => {
  if (useAuthStore().authenticated) {
    return abortNavigation();
  }
});
