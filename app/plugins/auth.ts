export default defineNuxtPlugin(() => {
  const authStore = useAuthStore();

  if (authStore.refreshToken) {
    authStore.sessionRefreshToken = authStore.refreshToken;
    useLoadProfile().execute();
  } else if (!authStore.token) {
    useLogout().executeLocal();
  }
});
