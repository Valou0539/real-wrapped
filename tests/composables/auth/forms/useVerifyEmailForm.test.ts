// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

// Mock du composable de requête
const mockVerifyEmailRequest = vi.fn();
mockNuxtImport("useVerifyEmailRequest", () => {
  return () => ({
    execute: mockVerifyEmailRequest,
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

describe("useVerifyEmailForm", () => {
  const testEmail = "test@example.com";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("doit initialiser avec les bonnes valeurs par défaut", () => {
    const { initialValues, resolver, responseError, loading } =
      useVerifyEmailForm(testEmail);

    expect(initialValues.value).toEqual({
      code: "",
    });
    expect(resolver.value).toBeDefined();
    expect(responseError.value).toBeUndefined();
    expect(loading.value).toBe(false);
  });

  it("doit soumettre le formulaire avec succès et rediriger vers login", async () => {
    mockVerifyEmailRequest.mockImplementation((body, config) => {
      config.onResponse({ response: { ok: true } });
      return Promise.resolve();
    });

    const { submit, loading } = useVerifyEmailForm(testEmail);
    const formData = { code: "123456" };

    await submit({ valid: true, values: formData });

    expect(mockVerifyEmailRequest).toHaveBeenCalledWith(
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
    expect(mockNavigateTo).toHaveBeenCalledWith("/auth/login");
  });

  it("doit gérer les erreurs de vérification", async () => {
    const error = {
      response: {
        status: 400,
      },
    };

    mockVerifyEmailRequest.mockImplementation((body, config) => {
      config.onResponse({ response: { ok: false } });
      config.onResponseError(error);
      return Promise.reject(error);
    });

    const { submit, responseError } = useVerifyEmailForm(testEmail);
    const formData = { code: "000000" };

    try {
      await submit({ valid: true, values: formData });
    } catch (e) {}

    expect(responseError.value).toBe("Error: 400");
  });

  it("ne doit pas soumettre si le formulaire est invalide", async () => {
    const { submit } = useVerifyEmailForm(testEmail);

    await submit({ valid: false, values: { code: "" } });

    expect(mockVerifyEmailRequest).not.toHaveBeenCalled();
  });

  it("doit inclure l'email passé en paramètre dans la requête", async () => {
    const customEmail = "custom@example.com";
    mockVerifyEmailRequest.mockImplementation((body, config) => {
      config.onResponse({ response: { ok: true } });
      return Promise.resolve();
    });

    const { submit } = useVerifyEmailForm(customEmail);
    const formData = { code: "123456" };

    await submit({ valid: true, values: formData });

    expect(mockVerifyEmailRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        email: customEmail,
        code: "123456",
      }),
      expect.any(Object),
    );
  });
});
