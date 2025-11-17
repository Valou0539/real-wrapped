export const useAuthStore = defineStore(
  "auth",
  () => {
    const token = ref<string | undefined>(undefined);
    const sessionRefreshToken = ref<string | undefined>(undefined);
    const refreshToken = ref<string | undefined>(undefined);
    const redirect = ref<string | undefined>(undefined);

    const authenticated = computed(() => !!token.value);

    const setTokens = (tokens: ITokenResponse, remember?: boolean) => {
      token.value = tokens.access_token;
      sessionRefreshToken.value = tokens.refresh_token;
      if (remember) {
        refreshToken.value = tokens.refresh_token;
      }
    };

    const clearTokens = (redirectPath?: string) => {
      token.value = undefined;
      sessionRefreshToken.value = undefined;
      refreshToken.value = undefined;
      redirect.value = redirectPath;
    };

    return {
      token,
      sessionRefreshToken,
      refreshToken,
      redirect,
      authenticated,
      setTokens,
      clearTokens,
    };
  },
  {
    persist: [
      {
        key: "sessionRefreshToken",
        storage: piniaPluginPersistedstate.sessionStorage(),
        pick: ["sessionRefreshToken"],
      },
      {
        key: "token",
        storage: piniaPluginPersistedstate.cookies({
          sameSite: "strict",
          secure: true,
          path: "/",
        }),
        pick: ["token"],
      },
      {
        key: "refreshToken",
        storage: piniaPluginPersistedstate.cookies({
          maxAge: 60 * 60 * 24 * 7,
          sameSite: "strict",
          secure: true,
          path: "/",
        }),
        pick: ["refreshToken"],
      },
    ],
  },
);
