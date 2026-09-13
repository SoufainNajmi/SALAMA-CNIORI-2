/**
 * Résout le household (et le meriid qui y est suivi) pour l'utilisateur
 * authentifié — meriid ou famille voient tous deux les données du même
 * porteur. Utilisé par /api/wearer et /api/status.
 */
import type { RowDataPacket } from "mysql2";

import { db } from "../db";
import type { Utilisateur } from "../middleware/auth";

export interface HouseholdCible {
  householdId: string;
  meriidUserId: string;
}

export async function resoudreHouseholdCible(user: Utilisateur): Promise<HouseholdCible | null> {
  if (user.role === "meriid") {
    const [lignes] = await db.query<RowDataPacket[]>(
      "SELECT id FROM households WHERE meriid_user_id = ? LIMIT 1",
      [user.id],
    );
    if (lignes.length === 0) return null;
    return { householdId: lignes[0].id, meriidUserId: user.id };
  }

  const [lignes] = await db.query<RowDataPacket[]>(
    `SELECT h.id AS household_id, h.meriid_user_id
       FROM household_members hm
       JOIN households h ON h.id = hm.household_id
      WHERE hm.user_id = ?
      LIMIT 1`,
    [user.id],
  );
  if (lignes.length === 0) return null;
  return { householdId: lignes[0].household_id, meriidUserId: lignes[0].meriid_user_id };
}
