/**
 * État d'authentification (jeton Bearer).
 * Persisté sur l'appareil pour garder la session entre deux ouvertures.
 */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
  token: string | null;
  expiresAt: string | null;
  estConnecte: () => boolean;
  seConnecter: (token: string, expiresAt: string) => void;
  deconnecter: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      expiresAt: null,
      estConnecte: () => {
        const { token, expiresAt } = get();
        if (!token) return false;
        if (expiresAt && Date.parse(expiresAt) < Date.now()) return false;
        return true;
      },
      seConnecter: (token, expiresAt) => set({ token, expiresAt }),
      deconnecter: () => set({ token: null, expiresAt: null }),
    }),
    {
      name: "salama-auth",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
