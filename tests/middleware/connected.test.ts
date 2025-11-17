// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import connectedMiddleware from "~/middleware/connected";

// Mocks avec vi.hoisted
const { mockAuthenticated, mockNavigateTo } = vi.hoisted(() => ({
  mockAuthenticated: vi.fn(),
  mockNavigateTo: vi.fn(),
}));

mockNuxtImport("useAuthStore", () => {
  return () => ({
    get authenticated() {
      return mockAuthenticated();
    },
  });
});

mockNuxtImport("navigateTo", () => mockNavigateTo);

mockNuxtImport("useLocalePath", () => {
  return () => (path: string) => path;
});

describe("connected middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("doit laisser passer si l'utilisateur est authentifié", () => {
    mockAuthenticated.mockReturnValue(true);

    const result = connectedMiddleware({ path: "/account" }, {});

    expect(result).toBeUndefined();
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });

  it("doit rediriger vers login si non authentifié", () => {
    mockAuthenticated.mockReturnValue(false);

    connectedMiddleware({ path: "/account" }, {});

    expect(mockNavigateTo).toHaveBeenCalledWith("/auth/login");
  });

  it("ne doit pas rediriger si déjà sur la page login", () => {
    mockAuthenticated.mockReturnValue(false);

    const result = connectedMiddleware({ path: "/auth/login" }, {});

    expect(result).toBeUndefined();
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });
});
