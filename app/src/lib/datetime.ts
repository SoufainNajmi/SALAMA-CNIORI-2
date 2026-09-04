/** Formatage de dates en libellés relatifs courts et localisés. */
import i18n from "@/i18n";

const MINUTE = 60;
const HEURE = 60 * MINUTE;
const JOUR = 24 * HEURE;

/**
 * Transforme un horodatage ISO en libellé relatif ("منذ 5 دقيقة" / "5 min ago").
 * Toujours au passé (les mesures viennent du passé).
 */
export function tempsRelatif(iso: string): string {
  const cibleMs = Date.parse(iso);
  if (Number.isNaN(cibleMs)) return "";

  const diffSec = Math.max(0, Math.round((Date.now() - cibleMs) / 1000));

  if (diffSec < MINUTE) return i18n.t("temps.maintenant");
  if (diffSec < HEURE) {
    return i18n.t("temps.minutes", { count: Math.floor(diffSec / MINUTE) });
  }
  if (diffSec < JOUR) {
    return i18n.t("temps.heures", { count: Math.floor(diffSec / HEURE) });
  }
  return i18n.t("temps.jours", { count: Math.floor(diffSec / JOUR) });
}
