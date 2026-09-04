import type { Alert } from "@/types/api";

const JOUR = 24 * 60 * 60 * 1000;
const HEURE = 60 * 60 * 1000;

/**
 * Liste d'alertes factices, mutable en mémoire (l'accusé de réception via
 * ackAlertMock modifie ce tableau). Triée par occurredAt décroissant, comme
 * le prévoit le contrat.
 *
 * Contenu : une chute il y a 2 jours (déjà acquittée) + une alerte SpO2
 * récente NON acquittée -> le bandeau d'alerte s'affiche sur l'accueil.
 */
let alertes: Alert[] = [
  {
    id: "alert-2",
    type: "vitals",
    occurredAt: new Date(Date.now() - 3 * HEURE).toISOString(),
    acknowledged: false,
    acknowledgedBy: null,
    acknowledgedAt: null,
    details: {
      metric: "spo2",
      measuredValue: 91,
      message: "Saturation en oxygène basse détectée (91%).",
    },
  },
  {
    id: "alert-1",
    type: "fall",
    occurredAt: new Date(Date.now() - 2 * JOUR).toISOString(),
    acknowledged: true,
    acknowledgedBy: "أحمد بناني",
    acknowledgedAt: new Date(Date.now() - 2 * JOUR + 4 * 60 * 1000).toISOString(),
    details: {
      message: "Chute détectée dans le salon.",
    },
  },
];

export function alertsMock(): Alert[] {
  return alertes.map((a) => ({ ...a }));
}

export function ackAlertMock(id: string, acknowledgedBy?: string): Alert {
  const cible = alertes.find((a) => a.id === id);
  if (!cible) {
    throw { code: "not_found", message: `Alerte ${id} introuvable` };
  }
  if (!cible.acknowledged) {
    cible.acknowledged = true;
    cible.acknowledgedBy = acknowledgedBy ?? "famille";
    cible.acknowledgedAt = new Date().toISOString();
  }
  return { ...cible };
}
