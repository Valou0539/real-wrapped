import type { FetchContext } from "ofetch";
import type { ErrorMapping } from "~/types/errorHandler";


/**
 * Fonction générique pour gérer les erreurs d'API
 * @param error - L'erreur retournée par l'API
 * @param mapping - Le mapping des status codes vers les messages i18n
 * @returns La clé de traduction i18n correspondante à l'erreur
 */
export const handleError = (
  error: FetchContext,
  mapping: ErrorMapping,
): string => {
  const statusCode = error.response?.status;
  if (!statusCode) {
    return mapping.default;
  }

  return mapping[statusCode] ?? mapping.default;
};
