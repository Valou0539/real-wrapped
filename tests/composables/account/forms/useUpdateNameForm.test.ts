// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

// Mock du composable de requête
const mockUpdateNameRequest = vi.fn();
mockNuxtImport("useUpdateNameRequest", () => {
  return () => ({
    execute: mockUpdateNameRequest,
  });
});

// Mock du store profile
const mockProfileStore = {
  profile: { name: "Old Name", email: "test@example.com" },
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

describe("useUpdateNameForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProfileStore.profile = { name: "Old Name", email: "test@example.com" };
  });

  it("doit initialiser avec les bonnes valeurs par défaut", () => {
    const { initialValues, resolver, responseError, loading, reset } =
      useUpdateNameForm();

    expect(initialValues.value).toEqual({
      name: "",
    });
    expect(resolver.value).toBeDefined();
    expect(responseError.value).toBeUndefined();
    expect(loading.value).toBe(false);
    expect(reset).toBeDefined();
  });

  it("doit soumettre le formulaire avec succès et mettre à jour le profil", async () => {
    mockUpdateNameRequest.mockImplementation((body, config) => {
      config.onResponse({ response: { ok: true } });
      return Promise.resolve();
    });

    const { submit, loading } = useUpdateNameForm();
    const formData = { name: "New Name" };

    await submit({ valid: true, values: formData });

    expect(mockUpdateNameRequest).toHaveBeenCalledWith(
      formData,
      expect.objectContaining({
        onResponse: expect.any(Function),
        onResponseError: expect.any(Function),
      }),
    );
    expect(loading.value).toBe(false);
    expect(mockProfileStore.profile.name).toBe("New Name");
    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "success",
      }),
    );
  });

  it("doit gérer les erreurs de mise à jour du nom", async () => {
    const error = {
      response: {
        status: 422,
      },
    };

    mockUpdateNameRequest.mockImplementation((body, config) => {
      config.onResponseError(error);
      return Promise.reject(error);
    });

    const { submit, responseError, loading } = useUpdateNameForm();
    const formData = { name: "New Name" };

    try {
      await submit({ valid: true, values: formData });
    } catch (e) {
      // Expected error
    }

    expect(loading.value).toBe(false);
    expect(responseError.value).toBe("Error: 422");
    expect(mockToastAdd).not.toHaveBeenCalled();
  });

  it("ne doit pas soumettre si le formulaire est invalide", async () => {
    const { submit } = useUpdateNameForm();

    await submit({ valid: false, values: { name: "" } });

    expect(mockUpdateNameRequest).not.toHaveBeenCalled();
  });

  it("doit réinitialiser le formulaire avec la méthode reset", () => {
    const { initialValues, responseError, loading, reset } =
      useUpdateNameForm();

    // Modifier les valeurs
    initialValues.value.name = "Test Name";
    responseError.value = "Test Error";
    loading.value = true;

    // Réinitialiser
    reset!();

    expect(initialValues.value).toEqual({ name: "" });
    expect(responseError.value).toBeUndefined();
    expect(loading.value).toBe(false);
  });
});
