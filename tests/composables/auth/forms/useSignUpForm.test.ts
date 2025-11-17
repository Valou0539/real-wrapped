// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

// Mock du composable de requête
const mockRegisterRequest = vi.fn();
mockNuxtImport("useRegisterRequest", () => {
  return () => ({
    execute: mockRegisterRequest,
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

describe("useSignUpForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("doit initialiser avec les bonnes valeurs par défaut", () => {
    const { initialValues, resolver, responseError, loading } = useSignUpForm();

    expect(initialValues.value).toEqual({
      name: "",
      email: "",
      password: "",
      consent: false,
    });
    expect(resolver.value).toBeDefined();
    expect(responseError.value).toBeUndefined();
    expect(loading.value).toBe(false);
  });

  it("doit soumettre le formulaire avec succès et rediriger vers la vérification d'email", async () => {
    mockRegisterRequest.mockImplementation((body, config) => {
      config.onResponse({ response: { ok: true } });
      return Promise.resolve();
    });

    const { submit, loading } = useSignUpForm();
    const formData = {
      name: "Test User",
      email: "test@example.com",
      password: "Password123!",
      consent: true,
    };

    await submit({ valid: true, values: formData });

    expect(mockRegisterRequest).toHaveBeenCalledWith(
      formData,
      expect.objectContaining({
        onResponse: expect.any(Function),
        onResponseError: expect.any(Function),
      }),
    );
    expect(loading.value).toBe(false);
    expect(mockNavigateTo).toHaveBeenCalledWith(
      "/auth/verify-email?email=test@example.com",
    );
  });

  it("doit gérer les erreurs d'inscription", async () => {
    const error = {
      response: {
        status: 422,
      },
    };

    mockRegisterRequest.mockImplementation((body, config) => {
      config.onResponse({ response: { ok: false } });
      config.onResponseError(error);
      return Promise.reject(error);
    });

    const { submit, responseError } = useSignUpForm();
    const formData = {
      name: "Test User",
      email: "test@example.com",
      password: "Password123!",
      consent: true,
    };

    try {
      await submit({ valid: true, values: formData });
    } catch (e) {}

    expect(responseError.value).toBe("Error: 422");
  });

  it("ne doit pas soumettre si le formulaire est invalide", async () => {
    const { submit } = useSignUpForm();

    await submit({ valid: false, values: {} });

    expect(mockRegisterRequest).not.toHaveBeenCalled();
  });

  it("doit réinitialiser l'erreur avant la soumission", async () => {
    mockRegisterRequest.mockImplementation((body, config) => {
      config.onResponse({ response: { ok: true } });
      return Promise.resolve();
    });

    const { submit, responseError } = useSignUpForm();

    // Définir une erreur existante
    responseError.value = "Erreur précédente";

    const formData = {
      name: "Test User",
      email: "test@example.com",
      password: "Password123!",
      consent: true,
    };

    await submit({ valid: true, values: formData });

    // L'erreur devrait être effacée avant la nouvelle soumission
    expect(responseError.value).toBeUndefined();
  });
});
