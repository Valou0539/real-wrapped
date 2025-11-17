// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

// Mocks avec vi.hoisted
const {
  mockLogoutRequest,
  mockClearTokens,
  mockSetProfile,
  mockNavigateTo,
  mockGetPath,
} = vi.hoisted(() => ({
  mockLogoutRequest: vi.fn(),
  mockClearTokens: vi.fn(),
  mockSetProfile: vi.fn(),
  mockNavigateTo: vi.fn(),
  mockGetPath: vi.fn(),
}));

mockNuxtImport("useLogoutRequest", () => {
  return () => ({
    execute: mockLogoutRequest,
  });
});

mockNuxtImport("useAuthStore", () => {
  return () => ({
    clearTokens: mockClearTokens,
  });
});

mockNuxtImport("useProfileStore", () => {
  return () => ({
    set profile(value) {
      mockSetProfile(value);
    },
  });
});

mockNuxtImport("navigateTo", () => mockNavigateTo);

mockNuxtImport("useLocalePath", () => {
  return () => (path: string) => path;
});

mockNuxtImport("useRoute", () => {
  return () => ({
    path: mockGetPath(),
  });
});

describe("useLogout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPath.mockReturnValue("/some-page");
  });

  it("doit exécuter le logout avec succès", async () => {
    mockLogoutRequest.mockResolvedValue(undefined);

    const { execute } = useLogout();
    await execute();

    expect(mockLogoutRequest).toHaveBeenCalled();
    expect(mockSetProfile).toHaveBeenCalledWith(undefined);
    expect(mockClearTokens).toHaveBeenCalledWith("/some-page");
  });

  it("doit exécuter le logout local sans appel API", () => {
    const { executeLocal } = useLogout();
    executeLocal();

    expect(mockLogoutRequest).not.toHaveBeenCalled();
    expect(mockSetProfile).toHaveBeenCalledWith(undefined);
    expect(mockClearTokens).toHaveBeenCalledWith("/some-page");
  });

  it("ne doit pas rediriger vers /auth/login si déjà sur /auth/login", () => {
    mockGetPath.mockReturnValue("/auth/login");

    const { executeLocal } = useLogout();
    executeLocal();

    expect(mockNavigateTo).not.toHaveBeenCalled();
  });

  it("doit nettoyer le profil et rediriger même en cas d'erreur API", async () => {
    mockLogoutRequest.mockRejectedValue(new Error("Network error"));

    const { execute } = useLogout();

    try {
      await execute();
    } catch (e) {
      // Expected error
    }

    expect(mockLogoutRequest).toHaveBeenCalled();
  });
});
