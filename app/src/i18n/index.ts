/**
 * Initialisation i18next + gestion de la direction (RTL / LTR).
 *
 * La langue initiale est déduite des réglages de l'appareil. Une préférence
 * explicite de l'utilisateur (usePreferencesStore) est appliquée après
 * hydratation via `changerLangue`.
 *
 * Limite React Native : basculer entre une langue RTL et une langue LTR
 * nécessite un redémarrage complet de l'app. `appliquerDirection` ne fait que
 * poser l'indicateur natif ; l'appelant doit prévenir l'utilisateur.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import { I18nManager } from "react-native";

import ar from "./locales/ar.json";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

export const LANGUES_SUPPORTEES = ["ar", "en", "fr"] as const;
export type Langue = (typeof LANGUES_SUPPORTEES)[number];

export const LANGUE_PAR_DEFAUT: Langue = "ar";

/** Langues affichées de droite à gauche. */
const LANGUES_RTL: Langue[] = ["ar"];

export function estRTL(langue: Langue): boolean {
  return LANGUES_RTL.includes(langue);
}

function estLangueSupportee(code: string | null | undefined): code is Langue {
  return !!code && (LANGUES_SUPPORTEES as readonly string[]).includes(code);
}

/** Détermine la langue initiale à partir des réglages système. */
function detecterLangue(): Langue {
  for (const locale of getLocales()) {
    if (estLangueSupportee(locale.languageCode)) {
      return locale.languageCode;
    }
  }
  return LANGUE_PAR_DEFAUT;
}

/**
 * Applique la direction au niveau natif. Renvoie true si un redémarrage de
 * l'app est nécessaire pour que le changement soit visible.
 */
export function appliquerDirection(langue: Langue): boolean {
  const rtl = estRTL(langue);
  I18nManager.allowRTL(rtl);
  if (I18nManager.isRTL !== rtl) {
    I18nManager.forceRTL(rtl);
    return true;
  }
  return false;
}

const langueInitiale = detecterLangue();
appliquerDirection(langueInitiale);

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: langueInitiale,
  fallbackLng: LANGUE_PAR_DEFAUT,
  interpolation: { escapeValue: false },
  compatibilityJSON: "v4",
});

/**
 * Change la langue de l'app. Renvoie true si un redémarrage est nécessaire
 * (bascule RTL <-> LTR).
 */
export function changerLangue(langue: Langue): boolean {
  i18n.changeLanguage(langue);
  return appliquerDirection(langue);
}

export default i18n;
