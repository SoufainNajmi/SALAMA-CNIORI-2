/**
 * Implémentation factice du contrat `ApiClient`.
 * Utilisée quand USE_MOCKS === true. Aucun accès réseau.
 */
import type {
  AckAlertRequest,
  AddAllergyRequest,
  AddMedicationRequest,
  HistoryRange,
  LoginRequest,
  PushMeasurementsRequest,
  RegisterDeviceRequest,
  RegisterRequest,
  UpdateChronicConditionRequest,
  UpdateMedicationRequest,
} from "@/types/api";
import type { ApiClient } from "../api";
import { delaiSimule } from "./latency";
import { ackAlertMock, alertsMock } from "./alerts.mock";
import { historyMock } from "./history.mock";
import {
  codeInvitationValideMock,
  inviteCodeMock,
  regenererInviteCodeMock,
} from "./household.mock";
import {
  ajouterMedicamentMock,
  medicationsSnapshotMock,
  modifierMedicamentMock,
  retirerMedicamentMock,
} from "./medications.mock";
import { statusMock } from "./status.mock";
import {
  ajouterAllergieMock,
  modifierMaladieChroniqueMock,
  retirerAllergieMock,
  wearerSnapshotMock,
} from "./wearer.mock";

// Compte démo unique : rattaché au household de la porteuse mockée
// (فاطمة بناني), suivie depuis un rôle "famille" — voir wearer.mock.ts.
const SESSION_DEMO = {
  token: "mock-token",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
};

export const mockApi: ApiClient = {
  login: (_body: LoginRequest) =>
    delaiSimule({ ...SESSION_DEMO, role: "famille" as const }),

  register: async (body: RegisterRequest) => {
    if (body.role === "famille") {
      if (!body.inviteCode || !(await codeInvitationValideMock(body.inviteCode))) {
        throw { code: "invalid_invite_code", message: "Code d'invitation invalide." };
      }
    }
    // Mock sans base d'utilisateurs réelle : on connecte directement avec le
    // rôle choisi à l'inscription (le vrai backend le renverra depuis la BDD).
    return delaiSimule({ ...SESSION_DEMO, role: body.role }, 800);
  },

  getInviteCode: async () => delaiSimule(await inviteCodeMock()),

  regenerateInviteCode: async () => delaiSimule(await regenererInviteCodeMock(), 400),

  getWearer: () => delaiSimule(wearerSnapshotMock()),

  addAllergy: (body: AddAllergyRequest) => delaiSimule(ajouterAllergieMock(body.label), 400),

  removeAllergy: (id: string) => delaiSimule(retirerAllergieMock(id), 300),

  updateChronicCondition: (id: string, body: UpdateChronicConditionRequest) =>
    delaiSimule(modifierMaladieChroniqueMock(id, body), 400),

  getMedications: () => delaiSimule(medicationsSnapshotMock()),

  addMedication: (body: AddMedicationRequest) => delaiSimule(ajouterMedicamentMock(body), 400),

  updateMedication: (id: string, body: UpdateMedicationRequest) =>
    delaiSimule(modifierMedicamentMock(id, body), 400),

  removeMedication: (id: string) => delaiSimule(retirerMedicamentMock(id), 300),

  getStatus: () => delaiSimule(statusMock()),

  getHistory: (range: HistoryRange) => delaiSimule(historyMock(range)),

  getAlerts: () => delaiSimule(alertsMock()),

  ackAlert: (id: string, body?: AckAlertRequest) =>
    delaiSimule(ackAlertMock(id, body?.acknowledgedBy), 400),

  registerDevice: (_body: RegisterDeviceRequest) => delaiSimule(undefined, 200),

  unregisterDevice: (_token: string) => delaiSimule(undefined, 200),

  pushMeasurements: (_body: PushMeasurementsRequest) => delaiSimule(undefined, 200),
};
