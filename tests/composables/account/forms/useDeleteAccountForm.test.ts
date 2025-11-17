// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

// Mock du composable de requête
const mockDeleteAccountRequest = vi.fn();
mockNuxtImport("useDeleteAccountRequest", () => {
  return () => ({
    execute: mockDeleteAccountRequest,
  });
});

// Mock du composable de logout
const mockExecuteLocal = vi.fn();
mockNuxtImport("useLogout", () => {
  return () => ({
    executeLocal: mockExecuteLocal,
  });
});

// Mock du toast
const mockToastAdd = vi.fn();
mockNuxtImport("useToast", () => {
  return () => ({
    add: mockToastAdd,
  });
});

// Mock du gestionnaire d'erreur
mockNuxtImport("handleAccountError", () => {
  return (error, context) => {
    return `Error: ${error.response.status}`;
  };
});

// Mock de $t global
vi.stubGlobal("$t", (key: string) => key);

describe("useDeleteAccountForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("doit initialiser avec les bonnes valeurs par défaut", () => {
    const { initialValues, resolver, responseError, loading, reset } =
      useDeleteAccountForm();

    expect(initialValues.value).toEqual({
      password: "",
    });
    expect(resolver.value).toBeDefined();
    expect(responseError.value).toBeUndefined();
    expect(loading.value).toBe(false);
    expect(reset).toBeDefined();
  });

  it("doit soumettre le formulaire avec succès et déconnecter l'utilisateur", async () => {
    mockDeleteAccountRequest.mockImplementation((body, config) => {
      config.onResponse({ response: { ok: true } });
      return Promise.resolve();
    });

    const { submit, loading } = useDeleteAccountForm();
    const formData = { password: "MyPassword123!" };

    await submit({ valid: true, values: formData });

    expect(mockDeleteAccountRequest).toHaveBeenCalledWith(
      formData,
      expect.objectContaining({
        onResponse: expect.any(Function),
        onResponseError: expect.any(Function),
      }),
    );
    expect(loading.value).toBe(false);
    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "success",
      }),
    );
    expect(mockExecuteLocal).toHaveBeenCalled();
  });

  it("doit gérer les erreurs de suppression de compte", async () => {
    const error = {
      response: {
        status: 401,
      },
    };

    mockDeleteAccountRequest.mockImplementation((body, config) => {
      config.onResponse({ response: { ok: false } });
      config.onResponseError(error);
      return Promise.reject(error);
    });

    const { submit, responseError, loading } = useDeleteAccountForm();
    const formData = { password: "WrongPassword!" };

    try {
      await submit({ valid: true, values: formData });
    } catch (e) {}

    expect(loading.value).toBe(false);
    expect(responseError.value).toBe("Error: 401");
    expect(mockToastAdd).not.toHaveBeenCalled();
    expect(mockExecuteLocal).not.toHaveBeenCalled();
  });

  it("ne doit pas soumettre si le formulaire est invalide", async () => {
    const { submit } = useDeleteAccountForm();

    await submit({ valid: false, values: { password: "" } });

    expect(mockDeleteAccountRequest).not.toHaveBeenCalled();
  });

  it("doit réinitialiser le formulaire avec la méthode reset", () => {
    const { initialValues, responseError, loading, reset } =
      useDeleteAccountForm();

    // Modifier les valeurs
    initialValues.value.password = "TestPassword";
    responseError.value = "Test Error";
    loading.value = true;

    // Réinitialiser
    reset!();

    expect(initialValues.value).toEqual({ password: "" });
    expect(responseError.value).toBeUndefined();
    expect(loading.value).toBe(false);
  });

  it("doit réinitialiser l'erreur avant la soumission", async () => {
    mockDeleteAccountRequest.mockImplementation((body, config) => {
      config.onResponse({ response: { ok: true } });
      return Promise.resolve();
    });

    const { submit, responseError } = useDeleteAccountForm();

    // Définir une erreur existante
    responseError.value = "Erreur précédente";

    const formData = { password: "MyPassword123!" };
    await submit({ valid: true, values: formData });

    // L'erreur devrait être effacée avant la nouvelle soumission
    expect(responseError.value).toBeUndefined();
  });
});
