// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

// Mock du composable de requête avec vi.hoisted
const { mockCreateNewPasswordRequest } = vi.hoisted(() => ({
  mockCreateNewPasswordRequest: vi.fn(),
}));

mockNuxtImport("useCreateNewPasswordRequest", () => {
  return () => ({
    execute: mockCreateNewPasswordRequest,
  });
});

// Mock du gestionnaire d'erreur
mockNuxtImport("handleAuthError", () => {
  return (error, _) => {
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

describe("useForgotPasswordPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("doit initialiser avec les bonnes valeurs par défaut", () => {
    const { initialValues, resolver, responseError, loading } =
      useForgotPasswordPasswordForm();

    expect(initialValues.value).toEqual({
      code: "",
      password: "",
      password_confirmation: "",
    });
    expect(resolver.value).toBeDefined();
    expect(responseError.value).toBeUndefined();
    expect(loading.value).toBe(false);
  });

  it("doit soumettre le formulaire avec succès et rediriger vers login", async () => {
    mockCreateNewPasswordRequest.mockImplementation((body, config) => {
      config.onResponse({ response: { ok: true } });
      return Promise.resolve();
    });

    const { submit, loading } = useForgotPasswordPasswordForm();
    const formData = {
      code: "123456",
      password: "NewPassword123!",
      password_confirmation: "NewPassword123!",
    };

    await submit({ valid: true, values: formData });

    expect(mockCreateNewPasswordRequest).toHaveBeenCalledWith(
      formData,
      expect.objectContaining({
        onResponse: expect.any(Function),
        onResponseError: expect.any(Function),
      }),
    );
    expect(loading.value).toBe(false);
    expect(mockNavigateTo).toHaveBeenCalledWith("/auth/login");
  });

  it("doit gérer les erreurs de création de nouveau mot de passe", async () => {
    const error = {
      response: {
        status: 400,
      },
    };

    mockCreateNewPasswordRequest.mockImplementation((body, config) => {
      config.onResponseError(error);
      return Promise.reject(error);
    });

    const { submit, responseError } = useForgotPasswordPasswordForm();
    const formData = {
      code: "000000",
      password: "NewPassword123!",
      password_confirmation: "NewPassword123!",
    };

    try {
      await submit({ valid: true, values: formData });
    } catch (e) {
      // Expected error
    }

    expect(responseError.value).toBe("Error: 400");
  });

  it("ne doit pas soumettre si le formulaire est invalide", async () => {
    const { submit } = useForgotPasswordPasswordForm();

    await submit({
      valid: false,
      values: { code: "", password: "", password_confirmation: "" },
    });

    expect(mockCreateNewPasswordRequest).not.toHaveBeenCalled();
  });

  it("doit réinitialiser l'erreur avant la soumission", async () => {
    mockCreateNewPasswordRequest.mockImplementation((body, config) => {
      config.onResponse({ response: { ok: true } });
      return Promise.resolve();
    });

    const { submit, responseError } = useForgotPasswordPasswordForm();

    // Définir une erreur existante
    responseError.value = "Erreur précédente";

    const formData = {
      code: "123456",
      password: "NewPassword123!",
      password_confirmation: "NewPassword123!",
    };

    await submit({ valid: true, values: formData });

    // L'erreur devrait être effacée avant la nouvelle soumission
    expect(responseError.value).toBeUndefined();
  });
});
