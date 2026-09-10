/**
 * Vérifie le jeton Bearer et attache { id, role } à req.user.
 * Jeton absent/invalide/expiré -> 401 { code: "unauthorized" } (voir contrat API).
 */
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { config } from "../config";
import type { Role } from "../types";

export interface Utilisateur {
  id: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: Utilisateur;
    }
  }
}

export function authentifier(req: Request, res: Response, next: NextFunction) {
  const entete = req.headers.authorization;
  const token = entete?.startsWith("Bearer ") ? entete.slice("Bearer ".length) : null;

  if (!token) {
    res.status(401).json({ code: "unauthorized", message: "Jeton manquant." });
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as { sub: string; role: Role };
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    res.status(401).json({ code: "unauthorized", message: "Jeton invalide ou expiré." });
  }
}
