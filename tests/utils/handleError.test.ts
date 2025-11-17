import { describe, it, expect } from "vitest";
import { handleError } from "~/utils/handleError";
import type { FetchContext } from "ofetch";
import type { ErrorMapping } from "~/types/errorHandler";

describe("handleError", () => {
  const mockMapping: ErrorMapping = {
    400: "errors.badRequest",
    401: "errors.unauthorized",
    404: "errors.notFound",
    500: "errors.serverError",
    default: "errors.unknown",
  };

  it("doit retourner le message correspondant au status code", () => {
    const error = {
      response: { status: 400 },
    } as FetchContext;

    const result = handleError(error, mockMapping);

    expect(result).toBe("errors.badRequest");
  });

  it("doit retourner le message par défaut si le status code n'est pas dans le mapping", () => {
    const error = {
      response: { status: 403 },
    } as FetchContext;

    const result = handleError(error, mockMapping);

    expect(result).toBe("errors.unknown");
  });

  it("doit retourner le message par défaut si la réponse est undefined", () => {
    const error = {
      response: undefined,
    } as FetchContext;

    const result = handleError(error, mockMapping);

    expect(result).toBe("errors.unknown");
  });

  it("doit retourner le message par défaut si le status code est undefined", () => {
    const error = {
      response: { status: undefined },
    } as unknown as FetchContext;

    const result = handleError(error, mockMapping);

    expect(result).toBe("errors.unknown");
  });

  it("doit gérer correctement plusieurs status codes", () => {
    expect(
      handleError({ response: { status: 401 } } as FetchContext, mockMapping),
    ).toBe("errors.unauthorized");

    expect(
      handleError({ response: { status: 404 } } as FetchContext, mockMapping),
    ).toBe("errors.notFound");

    expect(
      handleError({ response: { status: 500 } } as FetchContext, mockMapping),
    ).toBe("errors.serverError");
  });
});
