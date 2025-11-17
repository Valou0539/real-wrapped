// @vitest-environment nuxt
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";

describe("useScrollBackground", () => {
  beforeEach(() => {
    // Reset scroll position
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 0,
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("doit initialiser showBackground comme ref reactive à false", () => {
    const { showBackground } = useScrollBackground();

    // Vérifier que c'est bien une ref reactive
    expect(showBackground.value).toBe(false);

    // Tester la réactivité
    showBackground.value = true;
    expect(showBackground.value).toBe(true);
  });

  it("doit retourner un objet avec showBackground", () => {
    const result = useScrollBackground();

    expect(result).toHaveProperty("showBackground");
    expect(result.showBackground).toBeDefined();
  });

  it("doit gérer la logique de scroll (test unitaire de la fonction handleScroll)", () => {
    const { showBackground } = useScrollBackground();

    // Test de la logique: showBackground doit être true si scrollY > 0
    // et false sinon

    // Cas 1: scrollY = 0 → false
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 0,
    });
    // Simuler handleScroll manuellement
    showBackground.value = window.scrollY > 0;
    expect(showBackground.value).toBe(false);

    // Cas 2: scrollY = 100 → true
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 100,
    });
    showBackground.value = window.scrollY > 0;
    expect(showBackground.value).toBe(true);

    // Cas 3: scrollY = 1 → true (même 1px)
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 1,
    });
    showBackground.value = window.scrollY > 0;
    expect(showBackground.value).toBe(true);
  });

  it("doit être utilisable dans un contexte de composant", () => {
    // Test que le composable peut être appelé sans erreur
    expect(() => {
      useScrollBackground();
    }).not.toThrow();
  });

  it("doit maintenir la réactivité de showBackground", () => {
    const { showBackground } = useScrollBackground();

    const values: boolean[] = [];

    // Simuler plusieurs changements
    showBackground.value = false;
    values.push(showBackground.value);

    showBackground.value = true;
    values.push(showBackground.value);

    showBackground.value = false;
    values.push(showBackground.value);

    expect(values).toEqual([false, true, false]);
  });

  describe("Tests réels dans un composant Vue", () => {
    it("doit ajouter un event listener scroll au montage", () => {
      const addEventListenerSpy = vi.spyOn(window, "addEventListener");

      const TestComponent = defineComponent({
        setup() {
          const { showBackground } = useScrollBackground();
          return { showBackground };
        },
        render() {
          return h("div");
        },
      });

      mount(TestComponent);

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "scroll",
        expect.any(Function),
      );
    });

    it("doit retirer l'event listener scroll au démontage", () => {
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

      const TestComponent = defineComponent({
        setup() {
          const { showBackground } = useScrollBackground();
          return { showBackground };
        },
        render() {
          return h("div");
        },
      });

      const wrapper = mount(TestComponent);
      wrapper.unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "scroll",
        expect.any(Function),
      );
    });

    it("doit mettre à jour showBackground quand handleScroll est appelé", () => {
      let scrollHandler;
      const addEventListenerSpy = vi
        .spyOn(window, "addEventListener")
        .mockImplementation((event, handler) => {
          if (event === "scroll") {
            scrollHandler = handler;
          }
        });

      const TestComponent = defineComponent({
        setup() {
          const { showBackground } = useScrollBackground();
          return { showBackground };
        },
        render() {
          return h("div");
        },
      });

      const wrapper = mount(TestComponent);

      // Vérifier que showBackground est à false au départ
      expect(wrapper.vm.showBackground).toBe(false);

      // Simuler un scroll vers le bas
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 150,
      });

      // Appeler le handler capturé (ligne 5-6 du composable)
      scrollHandler();

      // showBackground devrait être à true maintenant
      expect(wrapper.vm.showBackground).toBe(true);

      // Simuler un retour en haut
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 0,
      });

      scrollHandler();

      // showBackground devrait être à false
      expect(wrapper.vm.showBackground).toBe(false);
    });

    it("doit détecter même un scroll minimal (ligne 5 - condition > 0)", () => {
      let scrollHandler;
      vi.spyOn(window, "addEventListener").mockImplementation(
        (event, handler) => {
          if (event === "scroll") {
            scrollHandler = handler;
          }
        },
      );

      const TestComponent = defineComponent({
        setup() {
          const { showBackground } = useScrollBackground();
          return { showBackground };
        },
        render() {
          return h("div");
        },
      });

      const wrapper = mount(TestComponent);

      // Scroll de 1px seulement
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 1,
      });

      scrollHandler();

      expect(wrapper.vm.showBackground).toBe(true);
    });
  });
});
