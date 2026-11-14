<template>
  <svg
    viewBox="0 0 100 100"
    aria-hidden="true"
    :class="{ 'animate-vinyl-spin': spin }"
  >
    <circle v-if="variant === 'solid'" cx="50" cy="50" r="49" :fill="disc" />
    <g
      fill="none"
      :stroke="grooves"
      :stroke-width="variant === 'ghost' ? 0.4 : 0.5"
      :opacity="grooveOpacity ?? (variant === 'ghost' ? 0.2 : 0.3)"
    >
      <circle v-for="r in grooveRadii" :key="r" cx="50" cy="50" :r="r" />
    </g>
    <circle
      v-if="spin"
      cx="50"
      cy="50"
      r="33"
      fill="none"
      :stroke="grooves"
      stroke-width="2.5"
      stroke-dasharray="18 189"
      opacity="0.6"
      stroke-linecap="round"
    />
    <circle
      cx="50"
      cy="50"
      :r="variant === 'ghost' ? 16.5 : 17"
      :fill="center"
    />
    <circle v-if="hole" cx="50" cy="50" r="2" :fill="hole" />
  </svg>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    variant?: "solid" | "ghost";
    disc?: string;
    grooves?: string;
    center?: string;
    hole?: string;
    grooveOpacity?: number;
    spin?: boolean;
  }>(),
  {
    variant: "solid",
    disc: "#121110",
    grooves: "#F3EEE3",
    center: "#D6FF3D",
    hole: "#121110",
    grooveOpacity: undefined,
    spin: true,
  },
);

const grooveRadii = computed(() =>
  props.variant === "ghost" ? [49, 44, 39, 34, 29, 24] : [43, 36, 29],
);
</script>
