import type { HistoryRange, HistoryResponse, HistorySample } from "@/types/api";

/**
 * Pas d'échantillonnage par fenêtre, aligné sur le contrat API :
 *   - "24h" : 1 point / 5 min
 *   - "7d"  : 1 point / heure
 */
const PAS_MINUTES: Record<HistoryRange, number> = {
  "24h": 5,
  "7d": 60,
};

const DUREE_MINUTES: Record<HistoryRange, number> = {
  "24h": 24 * 60,
  "7d": 7 * 24 * 60,
};

/**
 * Génère des séries plausibles.
 * Bornes réalistes fournies pour le projet : FC 60–95, SpO2 93–99.
 * Valeurs déterministes (pas de hasard) pour un rendu stable entre refreshs.
 */
function genererSamples(range: HistoryRange): HistorySample[] {
  const pas = PAS_MINUTES[range];
  const nb = Math.floor(DUREE_MINUTES[range] / pas);
  const fin = Date.now();
  const samples: HistorySample[] = [];

  for (let i = nb; i >= 0; i--) {
    const instant = fin - i * pas * 60 * 1000;
    const phase = (i / nb) * Math.PI * 6;

    const fc = 77 + Math.sin(phase) * 8 + ((i * 37) % 7) - 3;
    const spo2 = 96 + Math.sin(phase / 2) * 2 - ((i * 13) % 3);

    samples.push({
      at: new Date(instant).toISOString(),
      heartRate: Math.round(Math.min(95, Math.max(60, fc))),
      spo2: Math.round(Math.min(99, Math.max(93, spo2))),
    });
  }

  return samples;
}

export function historyMock(range: HistoryRange): HistoryResponse {
  const samples = genererSamples(range);
  return {
    range,
    from: samples[0]?.at ?? new Date().toISOString(),
    to: samples[samples.length - 1]?.at ?? new Date().toISOString(),
    samples,
  };
}
