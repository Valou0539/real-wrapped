<template>
  <div class="mx-auto max-w-7xl pt-28 lg:flex lg:gap-x-16 lg:px-8">
    <h1 class="sr-only">
      {{ $t("account.layout.title") }}
    </h1>

    <aside
      class="flex overflow-x-auto border-b border-gray-900/5 py-4 lg:block lg:w-64 lg:flex-none lg:border-0 lg:py-20 dark:border-white/10"
    >
      <nav class="flex-none px-4 sm:px-6 lg:px-0">
        <ul
          role="list"
          class="flex gap-x-3 gap-y-1 whitespace-nowrap lg:flex-col"
        >
          <li v-for="item in navigation" :key="item.name">
            <Button
              :as="NuxtLinkLocale"
              :to="item.to"
              fluid
              :class="[
                'group justify-start',
                { 'text-primary-600 dark:text-white': isActive(item.to) },
              ]"
              severity="secondary"
              :text="!isActive(item.to)"
            >
              <component
                :is="item.icon"
                :class="[
                  {
                    'text-primary-600 dark:text-white': isActive(item.to),
                  },
                  'size-6 shrink-0',
                ]"
                aria-hidden="true"
              />
              {{ $t(item.name) }}
            </Button>
          </li>
        </ul>
      </nav>
    </aside>

    <main class="px-4 py-16 sm:px-6 lg:flex-auto lg:px-0 lg:py-20">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { NuxtLinkLocale } from "#components";
import { FingerPrintIcon, UserCircleIcon } from "@heroicons/vue/24/outline";

const navigation = [
  {
    name: "account.layout.profile",
    to: "/account/profile",
    icon: UserCircleIcon,
  },
  {
    name: "account.layout.security",
    to: "/account/security",
    icon: FingerPrintIcon,
  },
];

const isActive = (path: string) => {
  const locale = useLocalePath();
  const route = useRoute();
  return locale(path) === route.path;
};
</script>
