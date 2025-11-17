import { describe, it, expect } from "vitest";
import { handleAuthError } from "~/utils/handleAuthError";
import { AuthErrorContext } from "~/enums/AuthErrorContext";
import type { FetchContext } from "ofetch";

describe("handleAuthError", () => {
  it("doit retourner l'erreur générique de login pour un status 401", () => {
    const error = {
      response: { status: 401 },
    } as FetchContext;

    const result = handleAuthError(error, AuthErrorContext.LOGIN);

    expect(result).toBe("authentication.errors.generic_login");
  });

  it("doit retourner l'erreur serveur de login pour un status 500", () => {
    const error = {
      response: { status: 500 },
    } as FetchContext;

    const result = handleAuthError(error, AuthErrorContext.LOGIN);

    expect(result).toBe("authentication.errors.server");
  });

  it("doit retourner l'erreur générique de sign-up pour un status 409", () => {
    const error = {
      response: { status: 409 },
    } as FetchContext;

    const result = handleAuthError(error, AuthErrorContext.SIGN_UP);

    expect(result).toBe("authentication.errors.generic_sign_up");
  });

  it("doit retourner l'erreur par défaut si la réponse est undefined", () => {
    const error = {
      response: undefined,
    } as FetchContext;

    const result = handleAuthError(error, AuthErrorContext.LOGIN);

    expect(result).toBe("authentication.errors.generic_login");
  });

  it("doit gérer le contexte FORGOT_PASSWORD avec status 401", () => {
    const error = {
      response: { status: 401 },
    } as FetchContext;

    const result = handleAuthError(error, AuthErrorContext.FORGOT_PASSWORD);

    expect(result).toBe("authentication.errors.user_not_found");
  });

  it("doit gérer le contexte FORGOT_PASSWORD avec status 429", () => {
    const error = {
      response: { status: 429 },
    } as FetchContext;

    const result = handleAuthError(error, AuthErrorContext.FORGOT_PASSWORD);

    expect(result).toBe("authentication.errors.too_many_attempts");
  });

  it("doit gérer le contexte VERIFY_EMAIL avec status 404", () => {
    const error = {
      response: { status: 404 },
    } as FetchContext;

    const result = handleAuthError(error, AuthErrorContext.VERIFY_EMAIL);

    expect(result).toBe("authentication.errors.verification_code_not_found");
  });

  it("doit gérer le contexte CREATE_PASSWORD avec status 403", () => {
    const error = {
      response: { status: 403 },
    } as FetchContext;

    const result = handleAuthError(error, AuthErrorContext.CREATE_PASSWORD);

    expect(result).toBe("authentication.errors.verification_code_expired");
  });
});
