// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

// Mock du composable de requête
const mockRequestEmailChangeRequest = vi.fn();
mockNuxtImport("useRequestEmailChangeRequest", () => {
  return () => ({
    execute: mockRequestEmailChangeRequest,
  });
});

// Mock du store profile
const mockProfileStore = {
  profile: { name: "User", email: "old@example.com" },
};
mockNuxtImport("useProfileStore", () => {
  return () => mockProfileStore;
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

describe("useUpdateEmailForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProfileStore.profile = { name: "User", email: "old@example.com" };
  });

  it("doit initialiser avec les bonnes valeurs par défaut", () => {
    const { initialValues, resolver, responseError, loading, reset } =
      useUpdateEmailForm();

    expect(initialValues.value).toEqual({
      new_email: "",
    });
    expect(resolver.value).toBeDefined();
    expect(responseError.value).toBeUndefined();
    expect(loading.value).toBe(false);
    expect(reset).toBeDefined();
  });

  it("doit soumettre le formulaire avec succès et mettre à jour le profil", async () => {
    const mockProfile = {
      name: "User",
      email: "old@example.com",
      email_being_changed: "new@example.com",
    };

    mockRequestEmailChangeRequest.mockImplementation((body, config) => {
      config.onResponse({ response: { ok: true } });
      return Promise.resolve(mockProfile);
    });

    const { submit, loading } = useUpdateEmailForm();
    const formData = { new_email: "new@example.com" };

    await submit({ valid: true, values: formData });

    expect(mockRequestEmailChangeRequest).toHaveBeenCalledWith(
      formData,
      expect.objectContaining({
        onResponse: expect.any(Function),
        onResponseError: expect.any(Function),
      }),
    );
    expect(loading.value).toBe(false);
    expect(mockProfileStore.profile).toEqual(mockProfile);
    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "success",
      }),
    );
  });

  it("doit gérer les erreurs de changement d'email", async () => {
    const error = {
      response: {
        status: 409,
      },
    };

    mockRequestEmailChangeRequest.mockImplementation((body, config) => {
      config.onResponseError(error);
      return Promise.reject(error);
    });

    const { submit, responseError } = useUpdateEmailForm();
    const formData = { new_email: "new@example.com" };

    try {
      await submit({ valid: true, values: formData });
    } catch (e) {
      // Expected error
    }

    expect(responseError.value).toBe("Error: 409");
    expect(mockToastAdd).not.toHaveBeenCalled();
  });

  it("ne doit pas soumettre si le formulaire est invalide", async () => {
    const { submit } = useUpdateEmailForm();

    await submit({ valid: false, values: { new_email: "" } });

    expect(mockRequestEmailChangeRequest).not.toHaveBeenCalled();
  });

  it("doit réinitialiser le formulaire avec la méthode reset", () => {
    const { initialValues, responseError, loading, reset } =
      useUpdateEmailForm();

    // Modifier les valeurs
    initialValues.value.new_email = "test@example.com";
    responseError.value = "Test Error";
    loading.value = true;

    // Réinitialiser
    reset!();

    expect(initialValues.value).toEqual({ new_email: "" });
    expect(responseError.value).toBeUndefined();
    expect(loading.value).toBe(false);
  });
});
