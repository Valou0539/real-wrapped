// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

// Mock du composable de requête
const mockConfirmEmailChangeRequest = vi.fn();
mockNuxtImport("useConfirmEmailChangeRequest", () => {
  return () => ({
    execute: mockConfirmEmailChangeRequest,
  });
});

// Mock du store profile
const mockProfileStore = {
  profile: {
    name: "User",
    email: "old@example.com",
    email_being_changed: "new@example.com",
  },
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

describe("useCheckEmailForm", () => {
  const testEmail = "new@example.com";

  beforeEach(() => {
    vi.clearAllMocks();
    mockProfileStore.profile = {
      name: "User",
      email: "old@example.com",
      email_being_changed: "new@example.com",
    };
  });

  it("doit initialiser avec les bonnes valeurs par défaut", () => {
    const { initialValues, resolver, responseError, loading, reset } =
      useCheckEmailForm(testEmail);

    expect(initialValues.value).toEqual({
      code: "",
    });
    expect(resolver.value).toBeDefined();
    expect(responseError.value).toBeUndefined();
    expect(loading.value).toBe(false);
    expect(reset).toBeDefined();
  });

  it("doit soumettre le formulaire avec succès et mettre à jour le profil", async () => {
    mockConfirmEmailChangeRequest.mockImplementation((body, config) => {
      config.onResponse({ response: { ok: true } });
      return Promise.resolve();
    });

    const { submit, loading } = useCheckEmailForm(testEmail);
    const formData = { code: "123456" };

    await submit({ valid: true, values: formData });

    expect(mockConfirmEmailChangeRequest).toHaveBeenCalledWith(
      {
        email: testEmail,
        code: "123456",
      },
      expect.objectContaining({
        onResponse: expect.any(Function),
        onResponseError: expect.any(Function),
      }),
    );
    expect(loading.value).toBe(false);
    expect(mockProfileStore.profile.email).toBe(testEmail);
    expect(mockProfileStore.profile.email_being_changed).toBeUndefined();
    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "success",
      }),
    );
  });

  it("doit gérer les erreurs de confirmation de changement d'email", async () => {
    const error = {
      response: {
        status: 400,
      },
    };

    mockConfirmEmailChangeRequest.mockImplementation((body, config) => {
      config.onResponseError(error);
      return Promise.reject(error);
    });

    const { submit, responseError } = useCheckEmailForm(testEmail);
    const formData = { code: "000000" };

    try {
      await submit({ valid: true, values: formData });
    } catch (e) {
      // Expected error
    }

    expect(responseError.value).toBe("Error: 400");
    expect(mockToastAdd).not.toHaveBeenCalled();
  });

  it("ne doit pas soumettre si le formulaire est invalide", async () => {
    const { submit } = useCheckEmailForm(testEmail);

    await submit({ valid: false, values: { code: "" } });

    expect(mockConfirmEmailChangeRequest).not.toHaveBeenCalled();
  });

  it("doit inclure l'email passé en paramètre dans la requête", async () => {
    const customEmail = "custom@example.com";
    mockConfirmEmailChangeRequest.mockImplementation((body, config) => {
      config.onResponse({ response: { ok: true } });
      return Promise.resolve();
    });

    const { submit } = useCheckEmailForm(customEmail);
    const formData = { code: "123456" };

    await submit({ valid: true, values: formData });

    expect(mockConfirmEmailChangeRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        email: customEmail,
        code: "123456",
      }),
      expect.any(Object),
    );
  });

  it("doit réinitialiser le formulaire avec la méthode reset", () => {
    const { responseError, loading, reset } = useCheckEmailForm(testEmail);

    // Modifier les valeurs
    responseError.value = "Test Error";
    loading.value = true;

    // Réinitialiser
    reset!();

    expect(responseError.value).toBeUndefined();
    expect(loading.value).toBe(false);
  });
});
