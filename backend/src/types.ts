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
