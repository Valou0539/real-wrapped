import { AuthErrorContext } from "~/enums/AuthErrorContext";
import type { ErrorMapping } from "~/types/errorHandler";

export const authErrorMappings: Record<AuthErrorContext, ErrorMapping> = {
  [AuthErrorContext.LOGIN]: {
    500: "authentication.errors.server",
    default: "authentication.errors.generic_login",
  },
  [AuthErrorContext.SIGN_UP]: {
    500: "authentication.errors.server",
    default: "authentication.errors.generic_sign_up",
  },
  [AuthErrorContext.FORGOT_PASSWORD]: {
    401: "authentication.errors.user_not_found",
    403: "authentication.errors.too_many_attempts",
    429: "authentication.errors.too_many_attempts",
    500: "authentication.errors.server",
    default: "authentication.errors.server",
  },
  [AuthErrorContext.VERIFY_EMAIL]: {
    403: "authentication.errors.verification_code_expired",
    404: "authentication.errors.verification_code_not_found",
    422: "authentication.errors.invalid_input",
    429: "authentication.errors.too_many_attempts",
    500: "authentication.errors.server",
    default: "authentication.errors.server",
  },
  [AuthErrorContext.CREATE_PASSWORD]: {
    403: "authentication.errors.verification_code_expired",
    404: "authentication.errors.verification_code_not_found",
    422: "authentication.errors.invalid_input",
    429: "authentication.errors.too_many_attempts",
    500: "authentication.errors.server",
    default: "authentication.errors.server",
  },
};
