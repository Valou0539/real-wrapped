// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests pour tous les composables de requêtes auth
 * Vérifie que chaque composable appelle la bonne route API avec les bons paramètres
 */

describe("Auth Request Composables", () => {
  let mockFetch;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock global de $fetch avec support de .create()
    mockFetch = vi.fn().mockResolvedValue({});
    mockFetch.create = vi.fn().mockReturnValue(mockFetch);
    global.$fetch = mockFetch;
  });

  describe("useLoginRequest", () => {
    it("doit appeler /api/auth/login avec POST et le body", async () => {
      const { execute } = useLoginRequest();
      const loginBody = {
        identifier: "test@example.com",
        password: "password123",
        remember: false,
      };

      await execute(loginBody);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/auth/login",
        expect.objectContaining({
          method: "POST",
          body: loginBody,
        }),
      );
    });
  });

  describe("useRegisterRequest", () => {
    it("doit appeler /api/auth/create avec POST et le body", async () => {
      const { execute } = useRegisterRequest();
      const registerBody = {
        name: "John",
        email: "john@example.com",
        password: "password123",
        consent: true,
      };

      await execute(registerBody);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/auth/create",
        expect.objectContaining({
          method: "POST",
          body: registerBody,
        }),
      );
    });
  });

  describe("useVerifyEmailRequest", () => {
    it("doit appeler /api/auth/verify-email avec PATCH et le body", async () => {
      const { execute } = useVerifyEmailRequest();
      const verifyBody = { email: "test@example.com", code: "123456" };

      await execute(verifyBody);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/auth/verify-email",
        expect.objectContaining({
          method: "PATCH",
          body: verifyBody,
        }),
      );
    });
  });

  describe("useForgotPasswordRequest", () => {
    it("doit appeler /api/auth/forgot-password avec POST et le body", async () => {
      const { execute } = useForgotPasswordRequest();
      const forgotPasswordBody = { email: "test@example.com" };

      await execute(forgotPasswordBody);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/auth/forgot-password",
        expect.objectContaining({
          method: "POST",
          body: forgotPasswordBody,
        }),
      );
    });
  });

  describe("useCreateNewPasswordRequest", () => {
    it("doit appeler /api/auth/create-new-password avec PATCH et le body", async () => {
      const { execute } = useCreateNewPasswordRequest();
      const createPasswordBody = {
        email: "test@example.com",
        code: "123456",
        password: "newpass123",
        password_confirmation: "newpass123",
      };

      await execute(createPasswordBody);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/auth/create-new-password",
        expect.objectContaining({
          method: "PATCH",
          body: createPasswordBody,
        }),
      );
    });
  });

  describe("useRefreshRequest", () => {
    it("doit appeler /api/auth/refresh avec les headers d'authentification", async () => {
      const { execute } = useRefreshRequest();

      await execute();

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/auth/refresh",
        expect.objectContaining({
          headers: expect.any(Object),
        }),
      );
    });
  });

  describe("useLogoutRequest", () => {
    it("doit appeler /api/auth/logout avec POST", async () => {
      const { execute } = useLogoutRequest();

      await execute();

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/auth/logout",
        expect.objectContaining({
          method: "POST",
        }),
      );
    });
  });

  describe("useResendVerificationEmailRequest", () => {
    it("doit appeler /api/auth/resend-verification-email avec POST et le body", async () => {
      const { execute } = useResendVerificationEmailRequest();
      const resendBody = { email: "test@example.com" };

      await execute(resendBody);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/auth/resend-verification-email",
        expect.objectContaining({
          method: "POST",
          body: resendBody,
        }),
      );
    });
  });

  describe("Gestion des options de configuration", () => {
    it("doit passer les options de configuration à $fetch", async () => {
      const { execute } = useLoginRequest();
      const loginBody = {
        identifier: "test@example.com",
        password: "password123",
        remember: false,
      };
      const config = {
        onResponse: vi.fn(),
        onResponseError: vi.fn(),
      };

      await execute(loginBody, config);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/auth/login",
        expect.objectContaining({
          method: "POST",
          body: loginBody,
          onResponse: config.onResponse,
          onResponseError: config.onResponseError,
        }),
      );
    });
  });
});
