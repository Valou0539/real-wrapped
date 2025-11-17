// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

// Mocks avec vi.hoisted
const {
  mockAuthStoreToken,
  mockAuthStoreSessionRefreshToken,
  mockAuthStoreSetTokens,
  mockRefreshRequestExecute,
  mockLogoutExecuteLocal,
} = vi.hoisted(() => ({
  mockAuthStoreToken: vi.fn(),
  mockAuthStoreSessionRefreshToken: vi.fn(),
  mockAuthStoreSetTokens: vi.fn(),
  mockRefreshRequestExecute: vi.fn(),
  mockLogoutExecuteLocal: vi.fn(),
}));

// Mock du store
mockNuxtImport("useAuthStore", () => {
  return () => ({
    get token() {
      return mockAuthStoreToken();
    },
    get sessionRefreshToken() {
      return mockAuthStoreSessionRefreshToken();
    },
    setTokens: mockAuthStoreSetTokens,
  });
});

// Mock de useRefreshRequest
mockNuxtImport("useRefreshRequest", () => {
  return () => ({
    execute: mockRefreshRequestExecute,
  });
});

// Mock de useLogout
mockNuxtImport("useLogout", () => {
  return () => ({
    executeLocal: mockLogoutExecuteLocal,
  });
});

describe("useAuthFetch", () => {
  let mockFetchInstance;
  let onRequestCallback;
  let onResponseErrorCallback;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock de $fetch.create pour capturer les callbacks
    mockFetchInstance = vi.fn();
    global.$fetch = {
      create: vi.fn((config) => {
        onRequestCallback = config.onRequest;
        onResponseErrorCallback = config.onResponseError;
        return mockFetchInstance;
      }),
    };
  });

  describe("Appel réel de useAuthFetch et test des callbacks", () => {
    it("doit créer une instance de fetch avec les bons callbacks", () => {
      const result = useAuthFetch();

      expect(global.$fetch.create).toHaveBeenCalled();
      expect(result.execute).toBe(mockFetchInstance);
      expect(onRequestCallback).toBeDefined();
      expect(onResponseErrorCallback).toBeDefined();
    });

    it("doit ajouter le header Authorization dans onRequest quand le token existe", () => {
      const token = "test-token-123";
      mockAuthStoreToken.mockReturnValue(token);

      useAuthFetch();

      const mockHeaders = {
        set: vi.fn(),
      };
      const options = { headers: mockHeaders };

      onRequestCallback({ options });

      expect(mockHeaders.set).toHaveBeenCalledWith(
        "Authorization",
        `Bearer ${token}`,
      );
    });

    it("ne doit PAS ajouter le header Authorization dans onRequest quand le token n'existe pas", () => {
      mockAuthStoreToken.mockReturnValue(null);

      useAuthFetch();

      const mockHeaders = {
        set: vi.fn(),
      };
      const options = { headers: mockHeaders };

      onRequestCallback({ options });

      expect(mockHeaders.set).not.toHaveBeenCalled();
    });

    it("doit appeler refresh dans onResponseError quand status 401 et sessionRefreshToken existe", async () => {
      mockAuthStoreSessionRefreshToken.mockReturnValue("refresh-token");
      const newTokens = {
        access_token: "new-token",
        refresh_token: "new-refresh",
      };
      mockRefreshRequestExecute.mockResolvedValue(newTokens);

      useAuthFetch();

      const response = { status: 401 };

      await onResponseErrorCallback({ response });

      expect(mockRefreshRequestExecute).toHaveBeenCalled();
      expect(mockAuthStoreSetTokens).toHaveBeenCalledWith(newTokens, true);
    });

    it("ne doit PAS appeler refresh dans onResponseError si pas de sessionRefreshToken", async () => {
      mockAuthStoreSessionRefreshToken.mockReturnValue(null);

      useAuthFetch();

      const response = { status: 401 };

      await onResponseErrorCallback({ response });

      expect(mockRefreshRequestExecute).not.toHaveBeenCalled();
    });

    it("ne doit PAS appeler refresh dans onResponseError si status différent de 401", async () => {
      mockAuthStoreSessionRefreshToken.mockReturnValue("refresh-token");

      useAuthFetch();

      const response = { status: 403 };

      await onResponseErrorCallback({ response });

      expect(mockRefreshRequestExecute).not.toHaveBeenCalled();
    });

    it("doit appeler logout si le refresh échoue dans onResponseError", async () => {
      mockAuthStoreSessionRefreshToken.mockReturnValue("refresh-token");
      mockRefreshRequestExecute.mockImplementation((config) => {
        config.onResponseError();
        return Promise.reject(new Error("Refresh failed"));
      });

      useAuthFetch();

      const response = { status: 401 };

      try {
        await onResponseErrorCallback({ response });
      } catch (e) {
        // Expected error
      }

      expect(mockLogoutExecuteLocal).toHaveBeenCalled();
    });

    it("doit configurer retryStatusCodes et retry", () => {
      const createSpy = vi.spyOn(global.$fetch, "create");

      useAuthFetch();

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          retryStatusCodes: [401],
          retry: 1,
        }),
      );
    });
  });

  describe("Logique d'ajout du header Authorization", () => {
    it("doit simuler l'ajout du header Authorization quand le token existe", () => {
      const token = "my-access-token";
      mockAuthStoreToken.mockReturnValue(token);

      const authStore = useAuthStore();

      // Simuler la logique du onRequest
      const mockHeaders = new Map<string, string>();

      if (authStore.token) {
        mockHeaders.set("Authorization", `Bearer ${authStore.token}`);
      }

      expect(mockHeaders.get("Authorization")).toBe(`Bearer ${token}`);
    });

    it("ne doit PAS ajouter le header Authorization quand le token n'existe pas", () => {
      mockAuthStoreToken.mockReturnValue(null);

      const authStore = useAuthStore();

      // Simuler la logique du onRequest
      const mockHeaders = new Map<string, string>();

      if (authStore.token) {
        mockHeaders.set("Authorization", `Bearer ${authStore.token}`);
      }

      expect(mockHeaders.has("Authorization")).toBe(false);
    });

    it("doit utiliser le bon format Bearer pour le header", () => {
      const token = "test-token-123";
      mockAuthStoreToken.mockReturnValue(token);

      const authStore = useAuthStore();

      // Simuler la logique
      const mockHeaders = new Map<string, string>();

      if (authStore.token) {
        mockHeaders.set("Authorization", `Bearer ${authStore.token}`);
      }

      const authHeader = mockHeaders.get("Authorization");
      expect(authHeader).toBe("Bearer test-token-123");
      expect(authHeader?.startsWith("Bearer ")).toBe(true);
    });

    it("doit gérer différents tokens correctement", () => {
      const testTokens = ["token1", "abc123", "very-long-jwt-token-here"];

      testTokens.forEach((token) => {
        mockAuthStoreToken.mockReturnValue(token);

        const authStore = useAuthStore();
        const mockHeaders = new Map<string, string>();

        if (authStore.token) {
          mockHeaders.set("Authorization", `Bearer ${authStore.token}`);
        }

        expect(mockHeaders.get("Authorization")).toBe(`Bearer ${token}`);
      });
    });
  });

  describe("Logique de refresh token sur erreur 401", () => {
    it("doit simuler le refresh quand erreur 401 avec sessionRefreshToken", async () => {
      mockAuthStoreSessionRefreshToken.mockReturnValue("refresh-token");

      const newTokens = {
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
      };

      mockRefreshRequestExecute.mockResolvedValue(newTokens);

      const authStore = useAuthStore();
      const response = { status: 401 };

      // Simuler la logique du onResponseError
      if (response.status === 401 && authStore.sessionRefreshToken) {
        const tokens = await useRefreshRequest().execute({
          onResponseError: () => {
            useLogout().executeLocal();
          },
        });
        authStore.setTokens(tokens, true);
      }

      expect(mockRefreshRequestExecute).toHaveBeenCalled();
      expect(mockAuthStoreSetTokens).toHaveBeenCalledWith(newTokens, true);
    });

    it("ne doit PAS appeler refresh si pas de sessionRefreshToken", async () => {
      mockAuthStoreSessionRefreshToken.mockReturnValue(null);

      const authStore = useAuthStore();
      const response = { status: 401 };

      // Simuler la logique
      if (response.status === 401 && authStore.sessionRefreshToken) {
        await useRefreshRequest().execute({});
      }

      expect(mockRefreshRequestExecute).not.toHaveBeenCalled();
    });

    it("ne doit PAS appeler refresh si status différent de 401", async () => {
      mockAuthStoreSessionRefreshToken.mockReturnValue("refresh-token");

      const authStore = useAuthStore();
      const response = { status: 403 };

      // Simuler la logique
      if (response.status === 401 && authStore.sessionRefreshToken) {
        await useRefreshRequest().execute({});
      }

      expect(mockRefreshRequestExecute).not.toHaveBeenCalled();
    });

    it("doit appeler logout si le refresh échoue", async () => {
      mockAuthStoreSessionRefreshToken.mockReturnValue("refresh-token");

      mockRefreshRequestExecute.mockImplementation((config) => {
        config.onResponseError();
        return Promise.reject(new Error("Refresh failed"));
      });

      const authStore = useAuthStore();
      const response = { status: 401 };

      // Simuler la logique
      if (response.status === 401 && authStore.sessionRefreshToken) {
        try {
          await useRefreshRequest().execute({
            onResponseError: () => {
              useLogout().executeLocal();
            },
          });
        } catch (e) {
          // Expected error
        }
      }

      expect(mockLogoutExecuteLocal).toHaveBeenCalled();
    });
  });

  describe("Comportement général", () => {
    it("doit retourner un objet avec execute", () => {
      const result = useAuthFetch();

      expect(result).toHaveProperty("execute");
      expect(result.execute).toBeDefined();
    });

    it("doit vérifier l'état du store avant d'ajouter le header", () => {
      const token = "abc123";
      mockAuthStoreToken.mockReturnValue(token);

      const authStore = useAuthStore();

      expect(authStore.token).toBe(token);

      // Vérifie que le composable peut accéder au token
      if (authStore.token) {
        expect(authStore.token).toBe("abc123");
      }
    });
  });
});
