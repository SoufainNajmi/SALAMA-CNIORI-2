/**
 * État d'authentification (jeton Bearer + rôle).
 * Persisté sur l'appareil pour garder la session entre deux ouvertures.
 */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Role } from "@/types/api";

interface AuthState {
  token: string | null;
  expiresAt: string | null;
  role: Role | null;
  estConnecte: () => boolean;
  seConnecter: (token: string, expiresAt: string, role: Role) => void;
  deconnecter: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      expiresAt: null,
      role: null,
      estConnecte: () => {
        const { token, expiresAt } = get();
        if (!token) return false;
        if (expiresAt && Date.parse(expiresAt) < Date.now()) return false;
        return true;
      },
      seConnecter: (token, expiresAt, role) => set({ token, expiresAt, role }),
      deconnecter: () => set({ token: null, expiresAt: null, role: null }),
    }),
    {
      name: "salama-auth",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
