/** État global : liste des alertes + accusé de réception. */
import { create } from "zustand";

import type { Alert } from "@/types/api";
import { api } from "@/services/api";
import { messageErreur } from "@/lib/erreurs";

interface AlertsState {
  alertes: Alert[];
  chargement: boolean;
  erreur: string | null;
  rafraichir: () => Promise<void>;
  accuser: (id: string, parQui?: string) => Promise<void>;
}

export const useAlertsStore = create<AlertsState>((set, get) => ({
  alertes: [],
  chargement: false,
  erreur: null,

  rafraichir: async () => {
    set({ chargement: true, erreur: null });
    try {
      const alertes = await api.getAlerts();
      set({ alertes, chargement: false });
    } catch (e) {
      set({ erreur: messageErreur(e), chargement: false });
    }
  },

  accuser: async (id, parQui) => {
    // Mise à jour optimiste : on marque acquittée localement tout de suite.
    const avant = get().alertes;
    set({
      alertes: avant.map((a) =>
        a.id === id ? { ...a, acknowledged: true } : a,
      ),
    });
    try {
      const majOfficielle = await api.ackAlert(id, { acknowledgedBy: parQui });
      set({
        alertes: get().alertes.map((a) => (a.id === id ? majOfficielle : a)),
      });
    } catch (e) {
      // Échec : on restaure l'état précédent.
      set({ alertes: avant, erreur: messageErreur(e) });
    }
  },
}));

/** Alerte non acquittée la plus récente (les alertes sont triées décroissant). */
export const selectAlerteNonAcquittee = (s: AlertsState): Alert | undefined =>
  s.alertes.find((a) => !a.acknowledged);
