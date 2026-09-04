/** Traduction des erreurs API en message affichable pour la famille. */
import i18n from "@/i18n";
import type { ApiError } from "@/types/api";

function estApiError(e: unknown): e is ApiError {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    typeof (e as { code: unknown }).code === "string"
  );
}

/** Renvoie un message localisé ; retombe sur "erreur inconnue" si code non géré. */
export function messageErreur(e: unknown): string {
  const code = estApiError(e) ? e.code : "inconnu";
  const cle = `erreurs.${code}`;
  const traduit = i18n.t(cle);
  return traduit === cle ? i18n.t("erreurs.inconnu") : traduit;
}
