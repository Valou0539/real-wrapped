export const useProfileStore = defineStore(
  "profile",
  () => {
    const profile = ref<IProfile | undefined>(undefined);

    return {
      profile,
    };
  },
  {
    persist: [
      {
        storage: piniaPluginPersistedstate.cookies({
          sameSite: "strict",
          secure: true,
          path: "/",
        }),
        pick: ["profile"],
      },
    ],
  },
);
