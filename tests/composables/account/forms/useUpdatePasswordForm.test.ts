// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

// Mock du composable de requête
const mockUpdatePasswordRequest = vi.fn();
mockNuxtImport("useUpdatePasswordRequest", () => {
  return () => ({
    execute: mockUpdatePasswordRequest,
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

describe("useUpdatePasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("doit initialiser avec les bonnes valeurs par défaut", () => {
    const { initialValues, resolver, responseError, loading } =
      useUpdatePasswordForm();

    expect(initialValues.value).toEqual({
      current_password: "",
      password: "",
      password_confirmation: "",
    });
    expect(resolver.value).toBeDefined();
    expect(responseError.value).toBeUndefined();
    expect(loading.value).toBe(false);
  });

  it("doit soumettre le formulaire avec succès et réinitialiser le formulaire", async () => {
    const mockFormReset = vi.fn();

    mockUpdatePasswordRequest.mockImplementation((body, config) => {
      config.onResponse({ response: { ok: true } });
      return Promise.resolve();
    });

    const { submit, loading } = useUpdatePasswordForm();
    const formData = {
      current_password: "OldPassword123!",
      password: "NewPassword123!",
      password_confirmation: "NewPassword123!",
    };

    await submit({
      valid: true,
      values: formData,
      reset: mockFormReset,
    });

    expect(mockUpdatePasswordRequest).toHaveBeenCalledWith(
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
    expect(mockFormReset).toHaveBeenCalled();
  });

  it("doit gérer les erreurs de mise à jour du mot de passe", async () => {
    const error = {
      response: {
        status: 400,
      },
    };

    mockUpdatePasswordRequest.mockImplementation((body, config) => {
      config.onResponse({ response: { ok: false } });
      config.onResponseError(error);
      return Promise.reject(error);
    });

    const { submit, responseError, loading } = useUpdatePasswordForm();
    const formData = {
      current_password: "WrongPassword!",
      password: "NewPassword123!",
      password_confirmation: "NewPassword123!",
    };

    try {
      await submit({ valid: true, values: formData });
    } catch (e) {}

    expect(loading.value).toBe(false);
    expect(responseError.value).toBe("Error: 400");
    expect(mockToastAdd).not.toHaveBeenCalled();
  });

  it("ne doit pas soumettre si le formulaire est invalide", async () => {
    const { submit } = useUpdatePasswordForm();

    await submit({
      valid: false,
      values: {
        current_password: "",
        password: "",
        password_confirmation: "",
      },
    });

    expect(mockUpdatePasswordRequest).not.toHaveBeenCalled();
  });

  it("doit réinitialiser l'erreur avant la soumission", async () => {
    const mockFormReset = vi.fn();

    mockUpdatePasswordRequest.mockImplementation((body, config) => {
      config.onResponse({ response: { ok: true } });
      return Promise.resolve();
    });

    const { submit, responseError } = useUpdatePasswordForm();

    // Définir une erreur existante
    responseError.value = "Erreur précédente";

    const formData = {
      current_password: "OldPassword123!",
      password: "NewPassword123!",
      password_confirmation: "NewPassword123!",
    };

    await submit({
      valid: true,
      values: formData,
      reset: mockFormReset,
    });

    // L'erreur devrait être effacée avant la nouvelle soumission
    expect(responseError.value).toBeUndefined();
  });
});
