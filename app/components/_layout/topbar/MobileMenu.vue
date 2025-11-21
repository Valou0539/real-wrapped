<template>
  <div class="flex lg:hidden">
    <button
      class="text-contrast -m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
      type="button"
      @click="mobileMenuOpen = true"
    >
      <span class="sr-only">
        {{
          mobileMenuOpen
            ? $t("layout.topbar.close_menu")
            : $t("layout.topbar.open_menu")
        }}
      </span>
      <Bars3Icon aria-hidden="true" class="size-6" />
    </button>
  </div>

  <Drawer
    v-model:visible="mobileMenuOpen"
    blockScroll
    position="right"
    :pt="{
      mask: {
        class: 'lg:!hidden',
      },
    }"
  >
    <template #header>
      <NuxtLinkLocale class="-m-1.5 p-1.5" to="/">
        <span class="sr-only">{{ title }}</span>
        <SharedLogo alt="" class="h-8 w-auto" />
      </NuxtLinkLocale>
    </template>
    <div class="divide-low-contrast divide-y">
      <div class="flex items-center justify-end gap-4 py-6">
        <LayoutSharedLangButton />
        <LayoutSharedColorTheme />
        <ClientOnly>
          <Button
            severity="primary"
            v-if="isWrapped"
            @click="
              reset(() => {
                mobileMenuOpen = false;
              })
            "
          >
            {{ $t("layout.topbar.new-history") }}
          </Button>
        </ClientOnly>
      </div>
      <div class="space-y-2 py-6">
        <NuxtLinkLocale
          v-for="item in navigation"
          :key="item.name"
          :to="item.to"
          v-show="!item.condition || item.condition()"
          class="text-contrast hover:bg-low-contrast -mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold"
          >{{ item.name }}
        </NuxtLinkLocale>
      </div>
    </div>
  </Drawer>
</template>

<script lang="ts" setup>
import { Bars3Icon } from "@heroicons/vue/24/outline";
import { NuxtLinkLocale } from "#components";

defineProps<{
  navigation: { name: string; to: string; condition?: () => boolean }[];
}>();

const { mobileMenuOpen } = useResponsiveMenu();
const { title } = useAppConfig();

const { reset } = useConfirmReset();

const { isWrapped } = storeToRefs(useWrappedStore());
</script>
