// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import disconnectedMiddleware from "~/middleware/disconnected";

// Mocks avec vi.hoisted
const { mockAuthenticated, mockAbortNavigation } = vi.hoisted(() => ({
  mockAuthenticated: vi.fn(),
  mockAbortNavigation: vi.fn(),
}));

mockNuxtImport("useAuthStore", () => {
  return () => ({
    get authenticated() {
      return mockAuthenticated();
    },
  });
});

mockNuxtImport("abortNavigation", () => mockAbortNavigation);

describe("disconnected middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAbortNavigation.mockReturnValue("aborted");
  });

  it("doit laisser passer si l'utilisateur n'est pas authentifié", async () => {
    mockAuthenticated.mockReturnValue(false);

    const result = await disconnectedMiddleware({}, {});

    expect(result).toBeUndefined();
    expect(mockAbortNavigation).not.toHaveBeenCalled();
  });

  it("doit annuler la navigation si l'utilisateur est authentifié", async () => {
    mockAuthenticated.mockReturnValue(true);

    const result = await disconnectedMiddleware({}, {});

    expect(result).toBe("aborted");
    expect(mockAbortNavigation).toHaveBeenCalled();
  });
});
