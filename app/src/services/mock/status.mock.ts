import type { Status } from "@/types/api";

/**
 * État courant factice du bracelet.
 *
 * Pour tester les autres états à la démo, modifier ici :
 *   - state: "ok"      + heartRate ~78, spo2 ~97  -> carte verte
 *   - state: "warning" + spo2 ~94                 -> carte orange (défaut)
 *   - state: "alert"                              -> carte rouge
 */
export function statusMock(): Status {
  const ilYaHuitMinutes = new Date(Date.now() - 8 * 60 * 1000).toISOString();
  return {
    heartRate: 88,
    spo2: 94,
    battery: 41,
    lastSyncAt: ilYaHuitMinutes,
    state: "warning",
  };
}
