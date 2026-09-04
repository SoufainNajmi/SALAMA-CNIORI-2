/**
 * Façade unique de la couche données.
 *
 * Les stores et les écrans importent UNIQUEMENT `api` depuis ce fichier.
 * Selon `USE_MOCKS`, les appels sont servis par les mocks ou par le backend
 * réel — le reste de l'app l'ignore complètement.
 */
import type {
  AckAlertRequest,
  AckAlertResponse,
  AlertsResponse,
  HistoryRange,
  HistoryResponse,
  LoginRequest,
  LoginResponse,
  PushMeasurementsRequest,
  RegisterDeviceRequest,
  Status,
  WearerProfile,
} from "@/types/api";
import { USE_MOCKS } from "./config";
import { httpApi } from "./endpoints";
import { mockApi } from "./mock";

/** Contrat commun aux deux implémentations (mock et HTTP). */
export interface ApiClient {
  login(body: LoginRequest): Promise<LoginResponse>;
  getWearer(): Promise<WearerProfile>;
  getStatus(): Promise<Status>;
  getHistory(range: HistoryRange): Promise<HistoryResponse>;
  getAlerts(): Promise<AlertsResponse>;
  ackAlert(id: string, body?: AckAlertRequest): Promise<AckAlertResponse>;
  registerDevice(body: RegisterDeviceRequest): Promise<void>;
  unregisterDevice(token: string): Promise<void>;
  pushMeasurements(body: PushMeasurementsRequest): Promise<void>;
}

export const api: ApiClient = USE_MOCKS ? mockApi : httpApi;
