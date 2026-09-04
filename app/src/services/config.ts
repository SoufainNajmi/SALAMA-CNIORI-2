/**
 * Configuration de la couche données.
 *
 * `USE_MOCKS` est le SEUL point de bascule entre données factices et backend
 * réel. Aucun composant, store ou écran ne doit lire ce drapeau : tout passe
 * par `api` (src/services/api.ts), qui masque l'implémentation choisie.
 */

/**
 * true  -> l'app utilise src/services/mock (aucun réseau).
 * false -> l'app appelle le backend réel via Axios.
 *
 * Passer à `false` uniquement quand le backend est disponible ET que
 * EXPO_PUBLIC_API_URL est renseigné dans .env.
 */
export const USE_MOCKS = true;

/** URL de base du backend, injectée au build par Expo (préfixe EXPO_PUBLIC_). */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

/** Délai maximal d'une requête HTTP avant abandon (millisecondes). */
export const HTTP_TIMEOUT_MS = 15000;
