/** État global : dernier statut connu du bracelet. */
import { create } from "zustand";

import type { Status } from "@/types/api";
import { api } from "@/services/api";
import { messageErreur } from "@/lib/erreurs";

interface StatusState {
  status: Status | null;
  chargement: boolean;
  erreur: string | null;
  rafraichir: () => Promise<void>;
}

export const useStatusStore = create<StatusState>((set) => ({
  status: null,
  chargement: false,
  erreur: null,
  rafraichir: async () => {
    set({ chargement: true, erreur: null });
    try {
      const status = await api.getStatus();
      set({ status, chargement: false });
    } catch (e) {
      set({ erreur: messageErreur(e), chargement: false });
    }
  },
}));
