/**
 * Préférences utilisateur persistées (langue).
 *
 * Au démarrage, si une langue a été choisie explicitement, elle est
 * ré-appliquée après hydratation (voir `appliquerPreferencesAuBoot`).
 * Basculer entre ar (RTL) et en (LTR) nécessite un redémarrage de l'app :
 * `definirLangue` renvoie true dans ce cas pour que l'UI prévienne l'utilisateur.
 */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { changerLangue, type Langue } from "@/i18n";

interface PreferencesState {
  /** null = suivre la langue de l'appareil. */
  langue: Langue | null;
  definirLangue: (langue: Langue) => boolean;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      langue: null,
      definirLangue: (langue) => {
        set({ langue });
        return changerLangue(langue);
      },
    }),
    {
      name: "salama-preferences",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.langue) {
          changerLangue(state.langue);
        }
      },
    },
  ),
);
