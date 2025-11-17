import { describe, it, expect } from "vitest";
import { handleAccountError } from "~/utils/handleAccountError";
import { AccountErrorContext } from "~/enums/AccountErrorContext";
import type { FetchContext } from "ofetch";

describe("handleAccountError", () => {
  it("doit retourner l'erreur générique de update-name pour un status 422", () => {
    const error = {
      response: { status: 422 },
    } as FetchContext;

    const result = handleAccountError(error, AccountErrorContext.UPDATE_NAME);

    expect(result).toBe("account.profile.updateName.errors.generic");
  });

  it("doit retourner l'erreur de update-name pour un status 403", () => {
    const error = {
      response: { status: 403 },
    } as FetchContext;

    const result = handleAccountError(error, AccountErrorContext.UPDATE_NAME);

    expect(result).toBe("account.profile.updateName.errors.already_taken");
  });

  it("doit retourner l'erreur de update-password pour un status 400", () => {
    const error = {
      response: { status: 400 },
    } as FetchContext;

    const result = handleAccountError(
      error,
      AccountErrorContext.UPDATE_PASSWORD,
    );

    expect(result).toBe("account.security.form.errors.invalid_current_password");
  });

  it("doit retourner l'erreur de update-email pour un status 403", () => {
    const error = {
      response: { status: 403 },
    } as FetchContext;

    const result = handleAccountError(error, AccountErrorContext.UPDATE_EMAIL);

    expect(result).toBe("account.profile.updateEmail.errors.already_used");
  });

  it("doit retourner l'erreur par défaut pour un status inconnu au contexte update-name", () => {
    const error = {
      response: { status: 500 },
    } as FetchContext;

    const result = handleAccountError(error, AccountErrorContext.UPDATE_NAME);

    expect(result).toBe("account.profile.updateName.errors.generic");
  });

  it("doit retourner l'erreur par défaut si la réponse est undefined", () => {
    const error = {
      response: undefined,
    } as FetchContext;

    const result = handleAccountError(error, AccountErrorContext.UPDATE_NAME);

    expect(result).toBe("account.profile.updateName.errors.generic");
  });

  it("doit gérer le contexte CHECK_EMAIL avec status 401", () => {
    const error = {
      response: { status: 401 },
    } as FetchContext;

    const result = handleAccountError(error, AccountErrorContext.CHECK_EMAIL);

    expect(result).toBe("account.profile.checkEmail.errors.invalid_code");
  });

  it("doit gérer le contexte DELETE_ACCOUNT avec status 401", () => {
    const error = {
      response: { status: 401 },
    } as FetchContext;

    const result = handleAccountError(
      error,
      AccountErrorContext.DELETE_ACCOUNT,
    );

    expect(result).toBe("account.security.deleteAccount.errors.invalid_password");
  });
});
