export default defineNuxtRouteMiddleware((to) => {
  const localePath = useLocalePath();
  if (!useAuthStore().authenticated && to.path !== localePath("/auth/login")) {
    return navigateTo(localePath("/auth/login"));
  }
});
