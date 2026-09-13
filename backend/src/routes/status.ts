/**
 * GET /api/status — voir app/src/types/api.ts (Status).
 * Aucun firmware ni flux de télémesure n'existe encore (voir CLAUDE.md,
 * "Points ouverts") : tant qu'aucun bracelet réel n'a synchronisé, on
 * renvoie une 404 explicite plutôt qu'un Status avec des valeurs inventées.
 */
import { Router } from "express";
import type { RowDataPacket } from "mysql2";

import { db } from "../db";
import { authentifier } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { resoudreHouseholdCible } from "../lib/household";
import type { Status } from "../types";

export const statusRouter = Router();

statusRouter.use(authentifier);

statusRouter.get("/", asyncHandler(async (req, res) => {
  const cible = await resoudreHouseholdCible(req.user!);
  if (!cible) {
    res.status(404).json({ code: "not_found", message: "Aucun household pour ce compte." });
    return;
  }

  const [braceletsLignes] = await db.query<RowDataPacket[]>(
    "SELECT id, battery_pct, last_sync_at FROM bracelets WHERE user_id = ? ORDER BY paired_at DESC LIMIT 1",
    [cible.meriidUserId],
  );
  const bracelet = braceletsLignes[0];

  // battery_pct / last_sync_at restent NULL tant que le bracelet n'a jamais
  // transmis de télémesure réelle : le contrat Status ne les autorise pas à
  // être nuls, donc on ne peut pas répondre 200 sans inventer une valeur.
  if (!bracelet || bracelet.battery_pct === null || bracelet.last_sync_at === null) {
    res.status(404).json({
      code: "no_bracelet_data",
      message: "Aucune donnée de bracelet disponible pour le moment.",
    });
    return;
  }

  const [vitauxLignes] = await db.query<RowDataPacket[]>(
    "SELECT heart_rate, spo2 FROM vitals_readings WHERE bracelet_id = ? ORDER BY recorded_at DESC LIMIT 1",
    [bracelet.id],
  );
  const derniereMesure = vitauxLignes[0] ?? null;

  // "state" est calculé par le backend (voir types/api.ts), mais aucun seuil
  // de détection (FC/SpO2/chute) n'est encore validé sur fiche technique —
  // voir CLAUDE.md, "Ne jamais inventer de valeurs matérielles". On ne
  // dérive donc "alert" que d'une alerte déjà déclenchée ailleurs, jamais
  // d'un seuil inventé ici ; "warning" n'est pour l'instant jamais renvoyé.
  const [alertesLignes] = await db.query<RowDataPacket[]>(
    "SELECT 1 FROM alerts WHERE user_id = ? AND status = 'active' LIMIT 1",
    [cible.meriidUserId],
  );
  const state: Status["state"] = alertesLignes.length > 0 ? "alert" : "ok";

  const reponse: Status = {
    heartRate: derniereMesure?.heart_rate ?? null,
    spo2: derniereMesure?.spo2 ?? null,
    battery: bracelet.battery_pct,
    lastSyncAt: new Date(bracelet.last_sync_at).toISOString(),
    state,
  };

  res.json(reponse);
}));
