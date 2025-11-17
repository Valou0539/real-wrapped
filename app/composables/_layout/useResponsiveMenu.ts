export const useResponsiveMenu = () => {
  const mobileMenuOpen = ref(false);
  const route = useRoute();

  watch(
    () => route.fullPath,
    () => (mobileMenuOpen.value = false),
  );

  return { mobileMenuOpen };
};
