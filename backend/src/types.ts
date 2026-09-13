/**
 * Formes partagées avec l'app — garder synchronisé avec
 * app/src/types/api.ts (la source de vérité côté contrat). Dupliqué ici
 * faute de monorepo/partage de paquet entre app/ et backend/.
 */

export type Role = "meriid" | "famille";

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  phone: string;
  password: string;
  role: Role;
  inviteCode?: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  role: Role;
}

export interface InviteCodeResponse {
  inviteCode: string;
}

export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export interface Allergy {
  id: string;
  label: string;
}

export interface ChronicCondition {
  id: string;
  label: string;
  notes: string | null;
}

export interface EmergencyContact {
  id: string;
  fullName: string;
  relationship: string;
  phone: string;
  priority: number;
}

/**
 * Contrat frontend (app/src/types/api.ts) : sex/birthDate y sont non-null.
 * Aucun écran ne les capture pour l'instant (voir salama_schema.sql), donc
 * on les renvoie tels quels (potentiellement null) plutôt que d'inventer
 * une valeur — écart documenté dans le rapport, à réconcilier quand un
 * écran d'onboarding les renseignera vraiment.
 */
export interface WearerProfile {
  id: string;
  fullName: string;
  birthDate: string | null;
  sex: "male" | "female" | null;
  city: string | null;
  photoUrl: string | null;
  bloodType: BloodType | null;
  heightCm: number | null;
  weightKg: number | null;
  allergies: Allergy[];
  chronicConditions: ChronicCondition[];
  emergencyContacts: EmergencyContact[];
}

export type WearerState = "ok" | "warning" | "alert";

/* ==========================================================================
 *  Traitements (médicaments) — voir GET/POST/PUT/DELETE /api/medications.
 *  Lecture ouverte aux deux rôles ; écriture réservée au rôle "famille"
 *  (même règle que /api/wearer/allergies et /chronic-conditions).
 * ========================================================================== */

export type MedicationTimeLabel = "matin" | "midi" | "soir" | "autre";

export interface MedicationTime {
  id: string;
  /** "HH:MM", 24h. */
  timeOfDay: string;
  label: MedicationTimeLabel;
}

export interface Medication {
  id: string;
  /** Condition/maladie visée, texte libre — voir salama_schema.sql. */
  conditionLabel: string;
  name: string;
  dose: string | null;
  instructions: string | null;
  notes: string | null;
  /** "AAAA-MM-JJ" ou null. */
  startDate: string | null;
  /** "AAAA-MM-JJ" ou null — null = traitement permanent/en cours. */
  endDate: string | null;
  times: MedicationTime[];
}

export interface MedicationTimeInput {
  timeOfDay: string;
  label: MedicationTimeLabel;
}

export interface AddMedicationRequest {
  conditionLabel: string;
  name: string;
  dose?: string | null;
  instructions?: string | null;
  notes?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  times: MedicationTimeInput[];
}

export interface UpdateMedicationRequest {
  conditionLabel: string;
  name: string;
  dose?: string | null;
  instructions?: string | null;
  notes?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  times: MedicationTimeInput[];
}

export interface Status {
  heartRate: number | null;
  spo2: number | null;
  battery: number;
  lastSyncAt: string;
  state: WearerState;
}
