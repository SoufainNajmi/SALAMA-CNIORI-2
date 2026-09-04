/**
 * Implémentation factice du contrat `ApiClient`.
 * Utilisée quand USE_MOCKS === true. Aucun accès réseau.
 */
import type {
  AckAlertRequest,
  HistoryRange,
  LoginRequest,
  PushMeasurementsRequest,
  RegisterDeviceRequest,
} from "@/types/api";
import type { ApiClient } from "../api";
import { delaiSimule } from "./latency";
import { ackAlertMock, alertsMock } from "./alerts.mock";
import { historyMock } from "./history.mock";
import { statusMock } from "./status.mock";
import { wearerMock } from "./wearer.mock";

export const mockApi: ApiClient = {
  login: (_body: LoginRequest) =>
    delaiSimule({
      token: "mock-token",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }),

  getWearer: () => delaiSimule(wearerMock),

  getStatus: () => delaiSimule(statusMock()),

  getHistory: (range: HistoryRange) => delaiSimule(historyMock(range)),

  getAlerts: () => delaiSimule(alertsMock()),

  ackAlert: (id: string, body?: AckAlertRequest) =>
    delaiSimule(ackAlertMock(id, body?.acknowledgedBy), 400),

  registerDevice: (_body: RegisterDeviceRequest) => delaiSimule(undefined, 200),

  unregisterDevice: (_token: string) => delaiSimule(undefined, 200),

  pushMeasurements: (_body: PushMeasurementsRequest) => delaiSimule(undefined, 200),
};
