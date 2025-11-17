export const useAuthRedirect = () => {
  const authStore = useAuthStore();

  const redirect = () => {
    const disconnectedPaths = [
      "/auth/login",
      "/auth/sign-up",
      "/auth/verify-email",
      "/auth/forgot-password",
    ];

    const redirectToIndex =
      disconnectedPaths.some((path) => authStore.redirect?.endsWith(path)) ||
      !authStore.redirect;

    const localePath = useLocalePath();
    navigateTo(redirectToIndex ? localePath("/") : authStore.redirect);
  };

  return { redirect };
};
