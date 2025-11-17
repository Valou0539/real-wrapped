// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

// Mocks avec vi.hoisted
const { mockLoadProfileRequest, mockSetProfile } = vi.hoisted(() => ({
  mockLoadProfileRequest: vi.fn(),
  mockSetProfile: vi.fn(),
}));

mockNuxtImport("useLoadProfileRequest", () => {
  return () => ({
    execute: mockLoadProfileRequest,
  });
});

mockNuxtImport("useProfileStore", () => {
  return () => ({
    set profile(value) {
      mockSetProfile(value);
    },
  });
});

describe("useLoadProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("doit charger le profil avec succès", async () => {
    const mockProfile = {
      email: "test@example.com",
      name: "Test User",
    };

    mockLoadProfileRequest.mockResolvedValue(mockProfile);

    const { execute } = useLoadProfile();
    await execute();

    expect(mockLoadProfileRequest).toHaveBeenCalled();
    expect(mockSetProfile).toHaveBeenCalledWith(mockProfile);
  });

  it("doit propager les erreurs de chargement du profil", async () => {
    const error = new Error("Failed to load profile");
    mockLoadProfileRequest.mockRejectedValue(error);

    const { execute } = useLoadProfile();

    await expect(execute()).rejects.toThrow("Failed to load profile");
    expect(mockLoadProfileRequest).toHaveBeenCalled();
  });
});
