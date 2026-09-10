/**
 * GET /api/household/invite-code, POST /api/household/invite-code/regenerate
 * Réservé au rôle "meriid" — voir app/src/types/api.ts.
 */
import { Router } from "express";
import type { RowDataPacket } from "mysql2";

import { db } from "../db";
import { authentifier } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { genererCodeInvitation } from "../lib/inviteCode";

export const householdRouter = Router();

const MAX_TENTATIVES_CODE = 5;

householdRouter.use(authentifier);

function verifierRoleMeriid(req: import("express").Request, res: import("express").Response): boolean {
  if (req.user?.role !== "meriid") {
    res.status(403).json({ code: "unauthorized", message: "Réservé au rôle meriid." });
    return false;
  }
  return true;
}

householdRouter.get("/invite-code", asyncHandler(async (req, res) => {
  if (!verifierRoleMeriid(req, res)) return;

  const [lignes] = await db.query<RowDataPacket[]>(
    "SELECT invite_code FROM households WHERE meriid_user_id = ? LIMIT 1",
    [req.user!.id],
  );
  if (lignes.length === 0) {
    res.status(404).json({ code: "not_found", message: "Aucun household pour ce compte." });
    return;
  }
  res.json({ inviteCode: lignes[0].invite_code });
}));

householdRouter.post("/invite-code/regenerate", asyncHandler(async (req, res) => {
  if (!verifierRoleMeriid(req, res)) return;

  let nouveauCode = "";
  let misAJour = false;
  for (let tentative = 0; tentative < MAX_TENTATIVES_CODE && !misAJour; tentative++) {
    nouveauCode = genererCodeInvitation();
    try {
      const [resultat] = await db.query<import("mysql2").ResultSetHeader>(
        "UPDATE households SET invite_code = ? WHERE meriid_user_id = ?",
        [nouveauCode, req.user!.id],
      );
      if (resultat.affectedRows === 0) {
        res.status(404).json({ code: "not_found", message: "Aucun household pour ce compte." });
        return;
      }
      misAJour = true;
    } catch (e) {
      const estCollision = (e as { code?: string }).code === "ER_DUP_ENTRY";
      if (!estCollision || tentative === MAX_TENTATIVES_CODE - 1) throw e;
    }
  }

  res.json({ inviteCode: nouveauCode });
}));
