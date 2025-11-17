import type { FetchContext } from "ofetch";
import { AuthErrorContext } from "~/enums/AuthErrorContext";
import { authErrorMappings } from "~/constants/auth/errors";

/**
 * Gère les erreurs d'authentification de manière uniforme
 * @param error - L'erreur retournée par l'API
 * @param context - Le contexte de l'erreur (login, sign-up, etc.)
 * @returns La clé de traduction i18n correspondante à l'erreur
 */
export const handleAuthError = (
  error: FetchContext,
  context: AuthErrorContext,
): string => {
  return handleError(error, authErrorMappings[context]);
};
