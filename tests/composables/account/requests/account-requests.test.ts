// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests pour tous les composables de requêtes account
 * Vérifie que chaque composable appelle la bonne route API avec les bons paramètres
 */

describe("Account Request Composables", () => {
  let mockFetch;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock global de $fetch avec support de .create()
    mockFetch = vi.fn().mockResolvedValue({});
    mockFetch.create = vi.fn().mockReturnValue(mockFetch);
    global.$fetch = mockFetch;
  });

  describe("useLoadProfileRequest", () => {
    it("doit appeler /api/profile/me avec GET", async () => {
      const { execute } = useLoadProfileRequest();

      await execute();

      expect(mockFetch).toHaveBeenCalledWith("/api/profile/me");
    });
  });

  describe("useUpdateNameRequest", () => {
    it("doit appeler /api/profile/update-name avec PATCH et le body", async () => {
      const { execute } = useUpdateNameRequest();
      const updateNameBody = { name: "John Doe" };

      await execute(updateNameBody);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/profile/update-name",
        expect.objectContaining({
          method: "PATCH",
          body: updateNameBody,
        }),
      );
    });
  });

  describe("useRequestEmailChangeRequest", () => {
    it("doit appeler /api/profile/request-email-change avec POST et le body", async () => {
      const { execute } = useRequestEmailChangeRequest();
      const requestEmailBody = { email: "newemail@example.com" };

      await execute(requestEmailBody);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/profile/request-email-change",
        expect.objectContaining({
          method: "POST",
          body: requestEmailBody,
        }),
      );
    });
  });

  describe("useConfirmEmailChangeRequest", () => {
    it("doit appeler /api/profile/confirm-email-change avec PATCH et le body", async () => {
      const { execute } = useConfirmEmailChangeRequest();
      const confirmEmailBody = {
        email: "newemail@example.com",
        code: "123456",
      };

      await execute(confirmEmailBody);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/profile/confirm-email-change",
        expect.objectContaining({
          method: "PATCH",
          body: confirmEmailBody,
        }),
      );
    });
  });

  describe("useUpdatePasswordRequest", () => {
    it("doit appeler /api/profile/update-password avec PATCH et le body", async () => {
      const { execute } = useUpdatePasswordRequest();
      const updatePasswordBody = {
        current_password: "oldpass123",
        password: "newpass123",
        password_confirmation: "newpass123",
      };

      await execute(updatePasswordBody);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/profile/update-password",
        expect.objectContaining({
          method: "PATCH",
          body: updatePasswordBody,
        }),
      );
    });
  });

  describe("useDeleteAccountRequest", () => {
    it("doit appeler /api/profile/delete-account avec DELETE et le body", async () => {
      const { execute } = useDeleteAccountRequest();
      const deleteAccountBody = { password: "mypassword123" };

      await execute(deleteAccountBody);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/profile/delete-account",
        expect.objectContaining({
          method: "DELETE",
          body: deleteAccountBody,
        }),
      );
    });
  });

  describe("Gestion des options de configuration", () => {
    it("doit passer les options de configuration à $fetch", async () => {
      const { execute } = useUpdateNameRequest();
      const updateNameBody = { name: "John Doe" };
      const config = {
        onResponse: vi.fn(),
        onResponseError: vi.fn(),
      };

      await execute(updateNameBody, config);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/profile/update-name",
        expect.objectContaining({
          method: "PATCH",
          body: updateNameBody,
          onResponse: config.onResponse,
          onResponseError: config.onResponseError,
        }),
      );
    });
  });
});
