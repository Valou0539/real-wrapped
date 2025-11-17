// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import verifyEmailGuardMiddleware from "~/middleware/verify-email-guard";

// Mock avec vi.hoisted
const { mockAbortNavigation } = vi.hoisted(() => ({
  mockAbortNavigation: vi.fn(),
}));

mockNuxtImport("abortNavigation", () => mockAbortNavigation);

describe("verify-email-guard middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAbortNavigation.mockReturnValue("aborted");
  });

  it("doit laisser passer avec un email valide", () => {
    const result = verifyEmailGuardMiddleware(
      {
        query: { email: "test@example.com" },
      },
      {},
    );

    expect(result).toBeUndefined();
    expect(mockAbortNavigation).not.toHaveBeenCalled();
  });

  it("doit annuler la navigation sans email", () => {
    const result = verifyEmailGuardMiddleware(
      {
        query: {},
      },
      {},
    );

    expect(result).toBe("aborted");
    expect(mockAbortNavigation).toHaveBeenCalled();
  });

  it("doit annuler la navigation avec un email invalide", () => {
    const result = verifyEmailGuardMiddleware(
      {
        query: { email: "invalid-email" },
      },
      {},
    );

    expect(result).toBe("aborted");
    expect(mockAbortNavigation).toHaveBeenCalled();
  });

  it("doit valider plusieurs formats d'email valides", () => {
    const validEmails = [
      "test@example.com",
      "user+tag@domain.co.uk",
      "first.last@company.org",
      "email123@test.io",
    ];

    validEmails.forEach((email) => {
      vi.clearAllMocks();
      const result = verifyEmailGuardMiddleware(
        {
          query: { email },
        },
        {},
      );

      expect(result).toBeUndefined();
      expect(mockAbortNavigation).not.toHaveBeenCalled();
    });
  });

  it("doit rejeter plusieurs formats d'email invalides", () => {
    const invalidEmails = [
      "notanemail",
      "@example.com",
      "user@",
      "user@domain",
      "user @domain.com",
    ];

    invalidEmails.forEach((email) => {
      vi.clearAllMocks();
      const result = verifyEmailGuardMiddleware(
        {
          query: { email },
        },
        {},
      );

      expect(result).toBe("aborted");
      expect(mockAbortNavigation).toHaveBeenCalled();
    });
  });
});
