<template>
  <button
    :aria-controls="id"
    aria-haspopup="true"
    @click="toggle"
    :class="{ 'rounded-full': rounded }"
  >
    <slot />
    <Menu :id="id" ref="menu" :model="items" :popup="true">
      <template
        #item="{
          item,
          props,
        }: {
          item: CustomMenuItem;
          props: MenuRouterBindProps;
        }"
      >
        <component
          :is="item.to ? NuxtLink : 'a'"
          v-bind="props.action"
          v-ripple
          :type="item.command ? 'button' : 'link'"
          :to="item.to"
          :href="item.url"
        >
          <component
            :is="item.iconComponent"
            class="size-4"
            :style="item.iconStyle"
          />
          <span v-if="item.icon" :class="item.icon" />
          <span>{{ $t(getLabel(item)) }}</span>
        </component>
      </template>
    </Menu>
  </button>
</template>

<script lang="ts" setup>
import type { MenuItem } from "primevue/menuitem";
import type { MenuRouterBindProps } from "primevue/menu";
import { NuxtLink, type Menu } from "#components";
import type { CSSProperties } from "vue";

type CustomMenuItem = MenuItem & {
  to?: string;
  iconComponent?: Component;
  iconStyle?: CSSProperties;
};

defineProps<{
  id: string;
  items: CustomMenuItem[];
  rounded?: boolean;
}>();

const menu = useTemplateRef<InstanceType<typeof Menu>>("menu");

const toggle = (event: Event) => {
  menu.value?.toggle(event);
};

const getLabel = (item: MenuItem) => {
  if (!item.label) return "";

  return typeof item.label === "string" ? item.label : item.label();
};
</script>
