import type { CSSProperties } from "vue";

/**
 * msDuration: The duration of the animation in milliseconds.
 * transform: The transform to apply to the element.
 */
interface AnimationOptions {
  msDuration?: number;
  transform?: string | null;
}

export const useAnimationOnLoad = () => {
  const mounted = ref(false);

  /**
   * Returns a CSS style object for an element that will be animated on load.
   * @param options The options for the animation.
   * @returns The CSS style object.
   */
  const style = (
    msDelay: number,
    options?: AnimationOptions,
  ): CSSProperties => {
    const { msDuration = 500, transform = "translateY(-20px)" } = options || {};

    return {
      opacity: mounted.value ? undefined : 0,
      transform: mounted.value || !transform ? undefined : transform,
      transitionProperty: "opacity, transform",
      transitionDuration: `${msDuration}ms`,
      transitionDelay: `${msDelay}ms`,
      pointerEvents: mounted.value ? "auto" : "none",
    };
  };

  onMounted(() => {
    setTimeout(() => (mounted.value = true), 1);
  });

  onUnmounted(() => {
    mounted.value = false;
  });

  return {
    style,
  };
};
