/** Émission du jeton Bearer (JWT) renvoyé par login/register. */
import jwt from "jsonwebtoken";

import { config } from "../config";
import type { Role } from "../types";

export function emettreJeton(userId: string, role: Role): { token: string; expiresAt: string } {
  const dureeSec = config.jwtExpiresInDays * 24 * 60 * 60;
  const token = jwt.sign({ role }, config.jwtSecret, { subject: userId, expiresIn: dureeSec });
  const expiresAt = new Date(Date.now() + dureeSec * 1000).toISOString();
  return { token, expiresAt };
}
