import type { FetchContext } from "ofetch";
import { AccountErrorContext } from "~/enums/AccountErrorContext";
import { accountErrorMappings } from "~/constants/account/errors";

/**
 * Gère les erreurs de compte de manière uniforme
 * @param error - L'erreur retournée par l'API
 * @param context - Le contexte de l'erreur (update-password, update-name, etc.)
 * @returns La clé de traduction i18n correspondante à l'erreur
 */
export const handleAccountError = (
  error: FetchContext,
  context: AccountErrorContext,
): string => {
  return handleError(error, accountErrorMappings[context]);
};
