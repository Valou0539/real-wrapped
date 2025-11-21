export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;

  const { isWrapped } = useWrappedStore();
  const localePath = useLocalePath();

  if (to.path !== localePath("/") && !isWrapped) {
    return navigateTo(localePath("/"));
  }
});
