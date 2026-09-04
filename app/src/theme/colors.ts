/**
 * Couleurs d'état de santé — garder synchronisé avec tailwind.config.js.
 * Utilisées là où une valeur de couleur JS est nécessaire (barre d'onglets,
 * RefreshControl, StatusBar…), pas pour styliser les composants (classes).
 */
import type { WearerState } from "@/types/api";

export const COULEUR_ETAT: Record<WearerState, string> = {
  ok: "#15803d",
  warning: "#c2410c",
  alert: "#b91c1c",
};

export const COULEUR_ACCENT = "#15803d";
export const COULEUR_TEXTE_DISCRET = "#6b7280";
