// @vitest-environment nuxt
import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";

describe("authStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("doit initialiser avec des valeurs par défaut", () => {
    const store = useAuthStore();

    expect(store.token).toBeUndefined();
    expect(store.sessionRefreshToken).toBeUndefined();
    expect(store.refreshToken).toBeUndefined();
    expect(store.redirect).toBeUndefined();
    expect(store.authenticated).toBe(false);
  });

  it("doit définir les tokens sans remember", () => {
    const store = useAuthStore();
    const tokens = {
      access_token: "access123",
      refresh_token: "refresh123",
    };

    store.setTokens(tokens);

    expect(store.token).toBe("access123");
    expect(store.sessionRefreshToken).toBe("refresh123");
    expect(store.refreshToken).toBeUndefined();
    expect(store.authenticated).toBe(true);
  });

  it("doit définir les tokens avec remember", () => {
    const store = useAuthStore();
    const tokens = {
      access_token: "access456",
      refresh_token: "refresh456",
    };

    store.setTokens(tokens, true);

    expect(store.token).toBe("access456");
    expect(store.sessionRefreshToken).toBe("refresh456");
    expect(store.refreshToken).toBe("refresh456");
    expect(store.authenticated).toBe(true);
  });

  it("doit effacer les tokens", () => {
    const store = useAuthStore();
    const tokens = {
      access_token: "access789",
      refresh_token: "refresh789",
    };

    store.setTokens(tokens, true);
    expect(store.authenticated).toBe(true);

    store.clearTokens();

    expect(store.token).toBeUndefined();
    expect(store.sessionRefreshToken).toBeUndefined();
    expect(store.refreshToken).toBeUndefined();
    expect(store.authenticated).toBe(false);
  });

  it("doit effacer les tokens avec un chemin de redirection", () => {
    const store = useAuthStore();
    const tokens = {
      access_token: "access111",
      refresh_token: "refresh111",
    };

    store.setTokens(tokens);
    store.clearTokens("/login");

    expect(store.token).toBeUndefined();
    expect(store.redirect).toBe("/login");
  });

  it("doit calculer authenticated correctement", () => {
    const store = useAuthStore();

    expect(store.authenticated).toBe(false);

    store.token = "some-token";
    expect(store.authenticated).toBe(true);

    store.token = undefined;
    expect(store.authenticated).toBe(false);
  });
});
