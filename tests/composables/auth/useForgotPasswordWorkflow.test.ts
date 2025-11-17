// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

// Mocks avec vi.hoisted
const {
  mockEmailFormSubmit,
  mockEmailFormResponseError,
  mockPasswordFormResponseError,
} = vi.hoisted(() => ({
  mockEmailFormSubmit: vi.fn(),
  mockEmailFormResponseError: { value: undefined },
  mockPasswordFormResponseError: { value: undefined },
}));

mockNuxtImport("useForgotPasswordEmailForm", () => {
  return () => ({
    submit: mockEmailFormSubmit,
    responseError: mockEmailFormResponseError,
    initialValues: { value: { email: "" } },
    resolver: { value: null },
    loading: { value: false },
  });
});

mockNuxtImport("useForgotPasswordPasswordForm", () => {
  return () => ({
    submit: vi.fn(),
    responseError: mockPasswordFormResponseError,
    initialValues: {
      value: { code: "", password: "", password_confirmation: "" },
    },
    resolver: { value: null },
    loading: { value: false },
  });
});

describe("useForgotPasswordWorkflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEmailFormResponseError.value = undefined;
    mockPasswordFormResponseError.value = undefined;
  });

  it("doit initialiser avec l'étape email", () => {
    const { step } = useForgotPasswordWorkflow();

    expect(step.value).toBe("email");
  });

  it("doit passer à l'étape password après soumission réussie de l'email", async () => {
    mockEmailFormSubmit.mockResolvedValue(true);

    const { step, onEmailSubmit } = useForgotPasswordWorkflow();

    await onEmailSubmit({ valid: true, values: { email: "test@example.com" } });

    expect(step.value).toBe("password");
  });

  it("doit rester sur l'étape email si la soumission échoue", async () => {
    mockEmailFormSubmit.mockResolvedValue(false);

    const { step, onEmailSubmit } = useForgotPasswordWorkflow();

    await onEmailSubmit({ valid: true, values: { email: "test@example.com" } });

    expect(step.value).toBe("email");
  });

  it("doit stocker l'email soumis", async () => {
    mockEmailFormSubmit.mockResolvedValue(true);

    const { email, onEmailSubmit } = useForgotPasswordWorkflow();

    await onEmailSubmit({ valid: true, values: { email: "test@example.com" } });

    expect(email.value).toBe("test@example.com");
  });

  it("doit retourner l'erreur de emailForm quand step est email", () => {
    mockEmailFormResponseError.value = "Email error";

    const { responseError } = useForgotPasswordWorkflow();

    expect(responseError.value).toBe("Email error");
  });

  it("doit retourner l'erreur de passwordForm quand step est password", async () => {
    mockEmailFormSubmit.mockResolvedValue(true);
    mockPasswordFormResponseError.value = "Password error";

    const { step, onEmailSubmit, responseError } = useForgotPasswordWorkflow();

    await onEmailSubmit({ valid: true, values: { email: "test@example.com" } });

    expect(step.value).toBe("password");
    expect(responseError.value).toBe("Password error");
  });
});
