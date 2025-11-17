export const useAuthFetch = () => {
  const authStore = useAuthStore();

  const fetch = $fetch.create({
    onRequest({ options }) {
      if (authStore.token) {
        options.headers.set("Authorization", `Bearer ${authStore.token}`);
      }
    },
    async onResponseError({ response }) {
      if (response.status === 401 && authStore.sessionRefreshToken) {
        await useRefreshRequest()
          .execute({
            onResponseError: async () => {
              await useLogout().executeLocal();
              const localePath = useLocalePath();
              navigateTo(localePath("/auth/login"));
            },
          })
          .then((tokens: ITokenResponse) => authStore.setTokens(tokens, true));
      }
    },
    retryStatusCodes: [401],
    retry: 1,
  });

  return { execute: fetch };
};
