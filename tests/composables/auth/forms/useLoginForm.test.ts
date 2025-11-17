// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

// Mock des composables avec vi.hoisted
const { mockLoginRequest, mockSetTokens, mockLoadProfile, mockAuthRedirect } =
  vi.hoisted(() => ({
    mockLoginRequest: vi.fn(),
    mockSetTokens: vi.fn(),
    mockLoadProfile: vi.fn(),
    mockAuthRedirect: vi.fn(),
  }));

mockNuxtImport("useLoginRequest", () => {
  return () => ({
    execute: mockLoginRequest,
  });
});

mockNuxtImport("useAuthStore", () => {
  return () => ({
    setTokens: mockSetTokens,
  });
});

mockNuxtImport("useLoadProfile", () => {
  return () => ({
    execute: mockLoadProfile,
  });
});

mockNuxtImport("useAuthRedirect", () => {
  return () => ({
    redirect: mockAuthRedirect,
  });
});

// Mock du gestionnaire d'erreur
mockNuxtImport("handleAuthError", () => {
  return (error, context) => {
    return `Error: ${error.response.status}`;
  };
});

// Mock de navigateTo avec vi.hoisted
const { mockNavigateTo } = vi.hoisted(() => ({
  mockNavigateTo: vi.fn(),
}));

mockNuxtImport("navigateTo", () => mockNavigateTo);

// Mock de useLocalePath
mockNuxtImport("useLocalePath", () => {
  return () => (path: string) => path;
});

describe("useLoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadProfile.mockReturnValue(Promise.resolve());
  });

  it("doit initialiser avec les bonnes valeurs par défaut", () => {
    const { initialValues, resolver, responseError, loading } = useLoginForm();

    expect(initialValues.value).toEqual({
      identifier: "",
      password: "",
      remember: false,
    });
    expect(resolver.value).toBeDefined();
    expect(responseError.value).toBeUndefined();
    expect(loading.value).toBe(false);
  });

  it("doit soumettre le formulaire avec succès", async () => {
    const mockResponse = {
      access_token: "test-token",
      refresh_token: "test-refresh",
    };

    mockLoginRequest.mockImplementation((body, config) => {
      config.onResponse();
      return Promise.resolve(mockResponse);
    });

    const { submit } = useLoginForm();
    const formData = {
      identifier: "test@example.com",
      password: "password123",
      remember: true,
    };

    await submit({ valid: true, values: formData });

    expect(mockLoginRequest).toHaveBeenCalledWith(
      formData,
      expect.objectContaining({
        onResponse: expect.any(Function),
        onResponseError: expect.any(Function),
      }),
    );
    expect(mockSetTokens).toHaveBeenCalledWith(mockResponse, true);
    expect(mockLoadProfile).toHaveBeenCalled();
    expect(mockAuthRedirect).toHaveBeenCalled();
  });

  it("doit gérer les erreurs de validation (email non vérifié)", async () => {
    const error = {
      response: {
        status: 403,
        _data: { data: { email: "test@example.com" } },
      },
    };

    mockLoginRequest.mockImplementation((body, config) => {
      config.onResponseError(error);
      return Promise.reject(error);
    });

    const { submit } = useLoginForm();
    const formData = {
      identifier: "test@example.com",
      password: "password123",
      remember: false,
    };

    try {
      await submit({ valid: true, values: formData });
    } catch (e) {
      // Expected error
    }

    expect(mockNavigateTo).toHaveBeenCalledWith(
      "/auth/verify-email?email=test@example.com",
    );
  });

  it("doit gérer les erreurs génériques de connexion", async () => {
    const error = {
      response: {
        status: 401,
      },
    };

    mockLoginRequest.mockImplementation((body, config) => {
      config.onResponse();
      config.onResponseError(error);
      return Promise.reject(error);
    });

    const { submit, responseError, loading } = useLoginForm();
    const formData = {
      identifier: "test@example.com",
      password: "wrongpassword",
      remember: false,
    };

    try {
      await submit({ valid: true, values: formData });
    } catch (e) {
      // Expected error
    }

    expect(loading.value).toBe(false);
    expect(responseError.value).toBe("Error: 401");
  });

  it("ne doit pas soumettre si le formulaire est invalide", async () => {
    const { submit } = useLoginForm();

    await submit({ valid: false, values: {} });

    expect(mockLoginRequest).not.toHaveBeenCalled();
  });
});
