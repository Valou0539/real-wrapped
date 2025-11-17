export const useScrollBackground = () => {
  const showBackground = ref(false);

  const handleScroll = () => {
    showBackground.value = window.scrollY > 0;
  };

  onMounted(() => {
    window.addEventListener("scroll", handleScroll);
  });

  onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
  });

  return { showBackground };
};
