// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import authPlugin from "~/plugins/auth";

// Mocks avec vi.hoisted
const {
  mockAuthStoreToken,
  mockAuthStoreRefreshToken,
  mockSetSessionRefreshToken,
  mockLoadProfileExecute,
  mockLogoutExecuteLocal,
} = vi.hoisted(() => ({
  mockAuthStoreToken: vi.fn(),
  mockAuthStoreRefreshToken: vi.fn(),
  mockSetSessionRefreshToken: vi.fn(),
  mockLoadProfileExecute: vi.fn(),
  mockLogoutExecuteLocal: vi.fn(),
}));

mockNuxtImport("useAuthStore", () => {
  return () => ({
    get token() {
      return mockAuthStoreToken();
    },
    get refreshToken() {
      return mockAuthStoreRefreshToken();
    },
    set sessionRefreshToken(value) {
      mockSetSessionRefreshToken(value);
    },
  });
});

mockNuxtImport("useLoadProfile", () => {
  return () => ({
    execute: mockLoadProfileExecute,
  });
});

mockNuxtImport("useLogout", () => {
  return () => ({
    executeLocal: mockLogoutExecuteLocal,
  });
});

describe("auth.client plugin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("doit charger le profil si refreshToken existe", () => {
    mockAuthStoreRefreshToken.mockReturnValue("refresh-token-123");
    mockAuthStoreToken.mockReturnValue("token-123");

    authPlugin({});

    expect(mockSetSessionRefreshToken).toHaveBeenCalledWith(
      "refresh-token-123",
    );
    expect(mockLoadProfileExecute).toHaveBeenCalled();
    expect(mockLogoutExecuteLocal).not.toHaveBeenCalled();
  });

  it("doit déconnecter si pas de token", () => {
    mockAuthStoreRefreshToken.mockReturnValue(null);
    mockAuthStoreToken.mockReturnValue(null);

    authPlugin({});

    expect(mockLogoutExecuteLocal).toHaveBeenCalled();
    expect(mockLoadProfileExecute).not.toHaveBeenCalled();
  });

  it("ne doit rien faire si token existe mais pas de refreshToken", () => {
    mockAuthStoreRefreshToken.mockReturnValue(null);
    mockAuthStoreToken.mockReturnValue("token-123");

    authPlugin({});

    expect(mockLogoutExecuteLocal).not.toHaveBeenCalled();
    expect(mockLoadProfileExecute).not.toHaveBeenCalled();
  });
});
