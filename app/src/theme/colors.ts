/**
 * Design tokens couleur — garder synchronisé avec tailwind.config.js.
 * Utilisés là où une valeur de couleur JS est nécessaire (barre d'onglets,
 * RefreshControl, StatusBar…), pas pour styliser les composants (classes).
 *
 * Le rouge (`critical`) est réservé à l'état SOS actif : ne jamais l'utiliser
 * comme couleur d'accent ou de branding ailleurs dans l'app.
 */
import type { WearerState } from "@/types/api";

export const COULEURS = {
  primary: "#1e3a5f",
  primaryLight: "#3b6ea5",
  primarySoft: "#e8eef5",
  bg: "#f7f9fb",
  surface: "#ffffff",
  text: "#1a2332",
  textSoft: "#64748b",
  border: "#e2e8f0",
  ok: "#0d9488",
  okSoft: "#e6f5f3",
  warn: "#d97706",
  warnSoft: "#fef3e2",
  critical: "#dc2626",
  criticalSoft: "#fdeaea",
} as const;

/** État de santé -> couleur pleine (fond des cartes/badges d'état). */
export const COULEUR_ETAT: Record<WearerState, string> = {
  ok: COULEURS.ok,
  warning: COULEURS.warn,
  alert: COULEURS.critical,
};

export const COULEUR_ACCENT = COULEURS.primary;
export const COULEUR_TEXTE_DISCRET = COULEURS.textSoft;
