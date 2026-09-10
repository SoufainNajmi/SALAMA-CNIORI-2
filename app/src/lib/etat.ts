/** Correspondances entre l'état de santé et l'affichage. */
import type { WearerState } from "@/types/api";

/**
 * Classe de fond NativeWind par état (voir tailwind.config.js).
 * "ok" utilise l'accent primaire (bleu marine) : le rouge/orange ne sert
 * qu'à signaler une situation qui sort de la normale.
 */
export const classeFondEtat: Record<WearerState, string> = {
  ok: "bg-primary",
  warning: "bg-etat-warning",
  alert: "bg-etat-alert",
};

/** Clé de traduction du libellé d'état. */
export const cleLibelleEtat: Record<WearerState, string> = {
  ok: "etat.ok",
  warning: "etat.warning",
  alert: "etat.alert",
};
