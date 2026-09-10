/**
 * Implémentation HTTP réelle du contrat `ApiClient`.
 * Utilisée quand USE_MOCKS === false.
 */
import type {
  AckAlertRequest,
  AckAlertResponse,
  AddAllergyRequest,
  AlertsResponse,
  Allergy,
  ChronicCondition,
  HistoryRange,
  HistoryResponse,
  InviteCodeResponse,
  LoginRequest,
  LoginResponse,
  PushMeasurementsRequest,
  RegisterDeviceRequest,
  RegisterRequest,
  RegisterResponse,
  Status,
  UpdateChronicConditionRequest,
  WearerProfile,
} from "@/types/api";
import type { ApiClient } from "../api";
import { httpClient } from "../http";

export const httpApi: ApiClient = {
  login: (body: LoginRequest) =>
    httpClient.post<LoginResponse>("/api/auth/login", body).then((r) => r.data),

  register: (body: RegisterRequest) =>
    httpClient.post<RegisterResponse>("/api/auth/register", body).then((r) => r.data),

  getInviteCode: () =>
    httpClient.get<InviteCodeResponse>("/api/household/invite-code").then((r) => r.data),

  regenerateInviteCode: () =>
    httpClient
      .post<InviteCodeResponse>("/api/household/invite-code/regenerate")
      .then((r) => r.data),

  getWearer: () =>
    httpClient.get<WearerProfile>("/api/wearer").then((r) => r.data),

  addAllergy: (body: AddAllergyRequest) =>
    httpClient.post<Allergy>("/api/wearer/allergies", body).then((r) => r.data),

  removeAllergy: (id: string) =>
    httpClient.delete(`/api/wearer/allergies/${encodeURIComponent(id)}`).then(() => undefined),

  updateChronicCondition: (id: string, body: UpdateChronicConditionRequest) =>
    httpClient
      .patch<ChronicCondition>(`/api/wearer/chronic-conditions/${encodeURIComponent(id)}`, body)
      .then((r) => r.data),

  getStatus: () => httpClient.get<Status>("/api/status").then((r) => r.data),

  getHistory: (range: HistoryRange) =>
    httpClient
      .get<HistoryResponse>("/api/history", { params: { range } })
      .then((r) => r.data),

  getAlerts: () =>
    httpClient.get<AlertsResponse>("/api/alerts").then((r) => r.data),

  ackAlert: (id: string, body?: AckAlertRequest) =>
    httpClient
      .post<AckAlertResponse>(`/api/alerts/${id}/ack`, body ?? {})
      .then((r) => r.data),

  registerDevice: (body: RegisterDeviceRequest) =>
    httpClient.post("/api/devices", body).then(() => undefined),

  unregisterDevice: (token: string) =>
    httpClient.delete(`/api/devices/${encodeURIComponent(token)}`).then(() => undefined),

  pushMeasurements: (body: PushMeasurementsRequest) =>
    httpClient.post("/api/measurements", body).then(() => undefined),
};
