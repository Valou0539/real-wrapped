// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

// Mocks avec vi.hoisted
const { mockAuthStoreRedirect, mockNavigateTo } = vi.hoisted(() => ({
  mockAuthStoreRedirect: vi.fn(),
  mockNavigateTo: vi.fn(),
}));

mockNuxtImport("useAuthStore", () => {
  return () => ({
    get redirect() {
      return mockAuthStoreRedirect();
    },
    set redirect(value) {
      mockAuthStoreRedirect(value);
    },
  });
});

mockNuxtImport("navigateTo", () => mockNavigateTo);

mockNuxtImport("useLocalePath", () => {
  return () => (path: string) => path;
});

describe("useAuthRedirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("doit rediriger vers le chemin stocké dans authStore", () => {
    mockAuthStoreRedirect.mockReturnValue("/account/profile");

    const { redirect } = useAuthRedirect();
    redirect();

    expect(mockNavigateTo).toHaveBeenCalledWith("/account/profile");
  });

  it("doit rediriger vers / si aucun chemin stocké", () => {
    mockAuthStoreRedirect.mockReturnValue(undefined);

    const { redirect } = useAuthRedirect();
    redirect();

    expect(mockNavigateTo).toHaveBeenCalledWith("/");
  });

  it("doit rediriger vers / si le chemin est /auth/login", () => {
    mockAuthStoreRedirect.mockReturnValue("/auth/login");

    const { redirect } = useAuthRedirect();
    redirect();

    expect(mockNavigateTo).toHaveBeenCalledWith("/");
  });

  it("doit rediriger vers / si le chemin est /auth/sign-up", () => {
    mockAuthStoreRedirect.mockReturnValue("/auth/sign-up");

    const { redirect } = useAuthRedirect();
    redirect();

    expect(mockNavigateTo).toHaveBeenCalledWith("/");
  });

  it("doit rediriger vers / si le chemin est /auth/verify-email", () => {
    mockAuthStoreRedirect.mockReturnValue("/auth/verify-email");

    const { redirect } = useAuthRedirect();
    redirect();

    expect(mockNavigateTo).toHaveBeenCalledWith("/");
  });
});
