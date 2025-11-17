<template>
  <SharedPopupMenu id="profile_menu" :items="items" rounded>
    <Button as="span" text rounded class="p-2" severity="contrast">
      <span class="sr-only">{{ $t("layout.topbar.toggle_profile_menu") }}</span>
      <UserCircleIcon class="size-7" />
    </Button>
  </SharedPopupMenu>
</template>

<script lang="ts" setup>
import {
  ShieldCheckIcon,
  ArrowLeftStartOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/vue/24/solid";
import type { MenuItem } from "primevue/menuitem";

const localePath = useLocalePath();

const items = computed<MenuItem[]>(() => {
  return [
    {
      label: "layout.topbar.profile",
      iconComponent: UserCircleIcon,
      to: localePath("/account/profile"),
    },
    {
      label: "layout.topbar.logout",
      iconComponent: ArrowLeftStartOnRectangleIcon,
      iconStyle: { color: "var(--color-red-500)" },
      command: async () => {
        await useLogout().execute();
        const localePath = useLocalePath();
        navigateTo(localePath("/auth/login"));
      },
    },
    {
      label: "layout.topbar.admin",
      iconComponent: ShieldCheckIcon,
      iconStyle: { color: "var(--color-primary-500)" },
      to: `${useRuntimeConfig().public.adminUrl}/login/with-token?token=${useAuthStore().token}`,
      condition: () => useProfileStore().profile?.roles.includes(Role.ADMIN),
    },
  ].filter((item) => !item.condition || item.condition());
});
</script>
