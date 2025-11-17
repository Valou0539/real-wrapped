import { AccountErrorContext } from "~/enums/AccountErrorContext";
import type { ErrorMapping } from "~/types/errorHandler";

export const accountErrorMappings: Record<AccountErrorContext, ErrorMapping> = {
  [AccountErrorContext.UPDATE_PASSWORD]: {
    400: "account.security.form.errors.invalid_current_password",
    422: "account.security.form.errors.invalid_current_password",
    500: "account.security.form.errors.generic",
    default: "account.security.form.errors.generic",
  },
  [AccountErrorContext.UPDATE_NAME]: {
    403: "account.profile.updateName.errors.already_taken",
    500: "account.profile.updateName.errors.generic",
    default: "account.profile.updateName.errors.generic",
  },
  [AccountErrorContext.UPDATE_EMAIL]: {
    403: "account.profile.updateEmail.errors.already_used",
    422: "account.profile.updateEmail.errors.invalid",
    429: "account.profile.updateEmail.errors.too_many_attempts",
    500: "account.profile.updateEmail.errors.generic",
    default: "account.profile.updateEmail.errors.generic",
  },
  [AccountErrorContext.DELETE_ACCOUNT]: {
    401: "account.security.deleteAccount.errors.invalid_password",
    403: "account.security.deleteAccount.errors.invalid_password",
    500: "account.security.deleteAccount.errors.generic",
    default: "account.security.deleteAccount.errors.generic",
  },
  [AccountErrorContext.CHECK_EMAIL]: {
    401: "account.profile.checkEmail.errors.invalid_code",
    403: "account.profile.checkEmail.errors.expired_code",
    404: "account.profile.checkEmail.errors.not_found",
    422: "account.profile.checkEmail.errors.invalid_input",
    500: "account.profile.checkEmail.errors.generic",
    default: "account.profile.checkEmail.errors.generic",
  },
};
