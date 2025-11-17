// @vitest-environment nuxt
import { describe, it, expect, beforeEach } from "vitest";
import { nextTick, watch } from "vue";

describe("useResponsiveMenu", () => {
  beforeEach(() => {
    // Reset any state
  });

  it("doit initialiser mobileMenuOpen à false", () => {
    const { mobileMenuOpen } = useResponsiveMenu();
    
    expect(mobileMenuOpen.value).toBe(false);
  });

  it("doit permettre d'ouvrir et fermer le menu mobile", () => {
    const { mobileMenuOpen } = useResponsiveMenu();
    
    // Le menu est fermé au départ
    expect(mobileMenuOpen.value).toBe(false);
    
    // On peut l'ouvrir
    mobileMenuOpen.value = true;
    expect(mobileMenuOpen.value).toBe(true);
    
    // On peut le fermer
    mobileMenuOpen.value = false;
    expect(mobileMenuOpen.value).toBe(false);
  });

  it("doit fermer automatiquement le menu lors d'un changement de route", async () => {
    const { mobileMenuOpen } = useResponsiveMenu();
    
    // Ouvrir le menu
    mobileMenuOpen.value = true;
    expect(mobileMenuOpen.value).toBe(true);
    
    // Simuler un changement de route via le router
    const router = useRouter();
    await router.push("/account");
    await nextTick();
    
    // Le menu devrait se fermer automatiquement
    expect(mobileMenuOpen.value).toBe(false);
  });

  it("doit fermer le menu même si on navigue vers la même route avec des query params différents", async () => {
    const { mobileMenuOpen } = useResponsiveMenu();
    
    // Ouvrir le menu
    mobileMenuOpen.value = true;
    expect(mobileMenuOpen.value).toBe(true);
    
    // Changer uniquement les query params
    const router = useRouter();
    await router.push({ query: { tab: "profile" } });
    await nextTick();
    
    // Le menu devrait se fermer car fullPath a changé
    expect(mobileMenuOpen.value).toBe(false);
  });

  it("doit maintenir l'état réactif du menu", async () => {
    const { mobileMenuOpen } = useResponsiveMenu();
    
    let callbackExecuted = false;
    
    // Watcher pour vérifier la réactivité
    watch(mobileMenuOpen, () => {
      callbackExecuted = true;
    });
    
    mobileMenuOpen.value = true;
    await nextTick();
    
    expect(callbackExecuted).toBe(true);
  });
});
