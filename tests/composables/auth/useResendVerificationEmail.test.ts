// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

// Mocks avec vi.hoisted
const { mockResendVerificationEmailRequest, mockToastAdd } = vi.hoisted(() => ({
  mockResendVerificationEmailRequest: vi.fn(),
  mockToastAdd: vi.fn(),
}));

mockNuxtImport("useResendVerificationEmailRequest", () => {
  return () => ({
    execute: mockResendVerificationEmailRequest,
  });
});

mockNuxtImport("useToast", () => {
  return () => ({
    add: mockToastAdd,
  });
});

mockNuxtImport("useI18n", () => {
  return () => ({
    t: (key: string) => key,
  });
});

// Mock de $t global
vi.stubGlobal("$t", (key: string) => key);

describe("useResendVerificationEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("doit initialiser avec loading à false", () => {
    const { loading } = useResendVerificationEmail();

    expect(loading.value).toBe(false);
  });

  it("doit envoyer un email de vérification avec succès", async () => {
    mockResendVerificationEmailRequest.mockImplementation((body, config) => {
      config.onResponse({ response: { ok: true } });
      return Promise.resolve();
    });

    const { resend } = useResendVerificationEmail();
    await resend("test@example.com");

    expect(mockResendVerificationEmailRequest).toHaveBeenCalledWith(
      { email: "test@example.com" },
      expect.any(Object),
    );
  });

  it("doit afficher un toast de succès", async () => {
    mockResendVerificationEmailRequest.mockImplementation((body, config) => {
      config.onResponse({ response: { ok: true } });
      return Promise.resolve();
    });

    const { resend } = useResendVerificationEmail();
    await resend("test@example.com");

    expect(mockToastAdd).toHaveBeenCalledWith({
      severity: "success",
      summary: "authentication.verify-email.resend_code_success.summary",
      detail: "authentication.verify-email.resend_code_success.detail",
      life: 5000,
    });
  });

  it("doit afficher un toast d'erreur en cas d'échec", async () => {
    mockResendVerificationEmailRequest.mockImplementation((body, config) => {
      config.onResponseError({ response: { status: 429 } });
      return Promise.reject(new Error("Too many requests"));
    });

    const { resend } = useResendVerificationEmail();

    try {
      await resend("test@example.com");
    } catch (e) {
      // Expected error
    }

    expect(mockToastAdd).toHaveBeenCalledWith({
      severity: "error",
      summary: "authentication.errors.resend_verification_email.summary",
      detail: "authentication.errors.resend_verification_email.detail",
      life: 5000,
    });
  });

  it("doit gérer le loading state correctement", async () => {
    mockResendVerificationEmailRequest.mockImplementation((body, config) => {
      config.onResponse({ response: { ok: true } });
      return Promise.resolve();
    });

    const { resend, loading } = useResendVerificationEmail();

    expect(loading.value).toBe(false);

    await resend("test@example.com");

    expect(loading.value).toBe(false);
  });
});
