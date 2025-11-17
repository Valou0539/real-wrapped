// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

// Mock du composable de requête
const mockForgotPasswordRequest = vi.fn();
mockNuxtImport("useForgotPasswordRequest", () => {
  return () => ({
    execute: mockForgotPasswordRequest,
  });
});

// Mock du gestionnaire d'erreur
mockNuxtImport("handleAuthError", () => {
  return (error, context) => {
    return `Error: ${error.response.status}`;
  };
});

describe("useForgotPasswordEmailForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("doit initialiser avec les bonnes valeurs par défaut", () => {
    const { initialValues, resolver, responseError, loading } =
      useForgotPasswordEmailForm();

    expect(initialValues.value).toEqual({
      email: "",
    });
    expect(resolver.value).toBeDefined();
    expect(responseError.value).toBeUndefined();
    expect(loading.value).toBe(false);
  });

  it("doit soumettre le formulaire avec succès", async () => {
    mockForgotPasswordRequest.mockImplementation((body, config) => {
      config.onResponse();
      return Promise.resolve();
    });

    const { submit, loading } = useForgotPasswordEmailForm();
    const formData = { email: "test@example.com" };

    await submit({ valid: true, values: formData });

    expect(mockForgotPasswordRequest).toHaveBeenCalledWith(
      formData,
      expect.objectContaining({
        onResponse: expect.any(Function),
        onResponseError: expect.any(Function),
      }),
    );
    expect(loading.value).toBe(false);
  });

  it("doit gérer les erreurs de demande de réinitialisation", async () => {
    const error = {
      response: {
        status: 404,
      },
    };

    mockForgotPasswordRequest.mockImplementation((body, config) => {
      config.onResponseError(error);
      return Promise.reject(error);
    });

    const { submit, responseError } = useForgotPasswordEmailForm();
    const formData = { email: "notfound@example.com" };

    try {
      await submit({ valid: true, values: formData });
    } catch (e) {
      // Expected error
    }

    expect(responseError.value).toBe("Error: 404");
  });

  it("ne doit pas soumettre si le formulaire est invalide", async () => {
    const { submit } = useForgotPasswordEmailForm();

    await submit({ valid: false, values: { email: "" } });

    expect(mockForgotPasswordRequest).not.toHaveBeenCalled();
  });

  it("doit réinitialiser l'erreur avant la soumission", async () => {
    mockForgotPasswordRequest.mockImplementation((body, config) => {
      config.onResponse();
      return Promise.resolve();
    });

    const { submit, responseError } = useForgotPasswordEmailForm();

    // Définir une erreur existante
    responseError.value = "Erreur précédente";

    const formData = { email: "test@example.com" };
    await submit({ valid: true, values: formData });

    // L'erreur devrait être effacée avant la nouvelle soumission
    expect(responseError.value).toBeUndefined();
  });
});
