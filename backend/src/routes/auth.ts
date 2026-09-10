/** POST /api/auth/login, POST /api/auth/register — voir app/src/types/api.ts. */
import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import { Router } from "express";
import type { RowDataPacket } from "mysql2";

import { db } from "../db";
import { asyncHandler } from "../lib/asyncHandler";
import { genererCodeInvitation } from "../lib/inviteCode";
import { emettreJeton } from "../lib/token";
import type { LoginRequest, RegisterRequest } from "../types";

export const authRouter = Router();

const SALT_ROUNDS = 10;
/** Tentatives avant d'abandonner en cas de collision (très improbable, code sur 8 car.). */
const MAX_TENTATIVES_CODE = 5;

authRouter.post("/login", asyncHandler(async (req, res) => {
  const { phone, password } = req.body as Partial<LoginRequest>;

  if (!phone || !password) {
    res.status(400).json({ code: "invalid_request", message: "Téléphone et mot de passe requis." });
    return;
  }

  const [lignes] = await db.query<RowDataPacket[]>(
    "SELECT id, password_hash, role FROM users WHERE phone = ? LIMIT 1",
    [phone],
  );
  const utilisateur = lignes[0];

  const motDePasseValide = utilisateur
    ? await bcrypt.compare(password, utilisateur.password_hash)
    : false;

  if (!utilisateur || !motDePasseValide) {
    res.status(401).json({ code: "unauthorized", message: "Identifiants incorrects." });
    return;
  }

  const { token, expiresAt } = emettreJeton(utilisateur.id, utilisateur.role);
  res.json({ token, expiresAt, role: utilisateur.role });
}));

authRouter.post("/register", asyncHandler(async (req, res) => {
  const { fullName, phone, password, role, inviteCode } = req.body as Partial<RegisterRequest>;

  if (!fullName || !phone || !password || !role) {
    res.status(400).json({ code: "invalid_request", message: "Champs obligatoires manquants." });
    return;
  }
  if (role !== "meriid" && role !== "famille") {
    res.status(400).json({ code: "invalid_request", message: "Rôle invalide." });
    return;
  }
  if (role === "famille" && !inviteCode) {
    res.status(400).json({ code: "invalid_request", message: "Code d'invitation requis." });
    return;
  }

  const [existant] = await db.query<RowDataPacket[]>(
    "SELECT id FROM users WHERE phone = ? LIMIT 1",
    [phone],
  );
  if (existant.length > 0) {
    res.status(409).json({ code: "phone_taken", message: "Ce numéro est déjà utilisé." });
    return;
  }

  let householdId: string | null = null;

  if (role === "famille") {
    const code = inviteCode!.trim().toUpperCase();
    const [households] = await db.query<RowDataPacket[]>(
      "SELECT id FROM households WHERE invite_code = ? LIMIT 1",
      [code],
    );
    if (households.length === 0) {
      res.status(400).json({ code: "invalid_invite_code", message: "Code d'invitation invalide." });
      return;
    }
    householdId = households[0].id;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const userId = randomUUID();

  const connexion = await db.getConnection();
  try {
    await connexion.beginTransaction();

    await connexion.query(
      "INSERT INTO users (id, phone, password_hash, role, full_name) VALUES (?, ?, ?, ?, ?)",
      [userId, phone, passwordHash, role, fullName],
    );

    if (role === "meriid") {
      householdId = randomUUID();
      let code = "";
      let cree = false;
      for (let tentative = 0; tentative < MAX_TENTATIVES_CODE && !cree; tentative++) {
        code = genererCodeInvitation();
        try {
          await connexion.query(
            "INSERT INTO households (id, meriid_user_id, invite_code) VALUES (?, ?, ?)",
            [householdId, userId, code],
          );
          cree = true;
        } catch (e) {
          // Collision sur invite_code (UNIQUE) : on retente avec un nouveau code.
          const estCollision = (e as { code?: string }).code === "ER_DUP_ENTRY";
          if (!estCollision || tentative === MAX_TENTATIVES_CODE - 1) throw e;
        }
      }
    } else {
      await connexion.query(
        "INSERT INTO household_members (household_id, user_id) VALUES (?, ?)",
        [householdId, userId],
      );
    }

    await connexion.commit();
  } catch (e) {
    await connexion.rollback();
    throw e;
  } finally {
    connexion.release();
  }

  const { token, expiresAt } = emettreJeton(userId, role);
  res.status(201).json({ token, expiresAt, role });
}));
