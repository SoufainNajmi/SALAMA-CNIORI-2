/**
 * GET /api/wearer — voir app/src/types/api.ts (WearerProfile).
 * Accessible aux deux rôles (meriid en lecture, famille en lecture/écriture
 * côté autres endpoints) : renvoie toujours les données du meriid du
 * household, jamais celles du compte connecté lui-même s'il est "famille".
 */
import { Router } from "express";
import type { RowDataPacket } from "mysql2";

import { db } from "../db";
import { authentifier } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { resoudreHouseholdCible } from "../lib/household";
import type { Allergy, ChronicCondition, EmergencyContact, WearerProfile } from "../types";

export const wearerRouter = Router();

wearerRouter.use(authentifier);

wearerRouter.get("/", asyncHandler(async (req, res) => {
  const cible = await resoudreHouseholdCible(req.user!);
  if (!cible) {
    res.status(404).json({ code: "not_found", message: "Aucun household pour ce compte." });
    return;
  }
  const { householdId, meriidUserId } = cible;

  const [utilisateurs] = await db.query<RowDataPacket[]>(
    "SELECT full_name FROM users WHERE id = ? LIMIT 1",
    [meriidUserId],
  );
  if (utilisateurs.length === 0) {
    res.status(404).json({ code: "not_found", message: "Porteur introuvable." });
    return;
  }

  const [profils] = await db.query<RowDataPacket[]>(
    "SELECT birth_date, sex, city, blood_type, height_cm, weight_kg FROM medical_profiles WHERE user_id = ? LIMIT 1",
    [meriidUserId],
  );
  const profil = profils[0] ?? null;

  const [allergiesLignes] = await db.query<RowDataPacket[]>(
    "SELECT id, label FROM allergies WHERE user_id = ?",
    [meriidUserId],
  );
  const allergies: Allergy[] = allergiesLignes.map((l) => ({ id: l.id, label: l.label }));

  const [maladiesLignes] = await db.query<RowDataPacket[]>(
    "SELECT id, label, notes FROM chronic_conditions WHERE user_id = ?",
    [meriidUserId],
  );
  const chronicConditions: ChronicCondition[] = maladiesLignes.map((l) => ({
    id: l.id,
    label: l.label,
    notes: l.notes ?? null,
  }));

  const [contactsLignes] = await db.query<RowDataPacket[]>(
    "SELECT id, name, phone, priority FROM emergency_contacts WHERE household_id = ? ORDER BY priority ASC",
    [householdId],
  );
  const emergencyContacts: EmergencyContact[] = contactsLignes.map((l) => ({
    id: l.id,
    fullName: l.name,
    // Le lien de parenté n'est pas encore un champ distinct en base
    // (uniquement `name`/`phone`/`priority`) : voir salama_schema.sql.
    relationship: "",
    phone: l.phone,
    priority: l.priority,
  }));

  const reponse: WearerProfile = {
    id: meriidUserId,
    fullName: utilisateurs[0].full_name,
    birthDate: profil?.birth_date ? formatDateSeule(profil.birth_date) : null,
    sex: profil?.sex ?? null,
    city: profil?.city ?? null,
    photoUrl: null,
    bloodType: profil?.blood_type ?? null,
    heightCm: profil?.height_cm ?? null,
    weightKg: profil?.weight_kg ?? null,
    allergies,
    chronicConditions,
    emergencyContacts,
  };

  res.json(reponse);
}));

/**
 * mysql2 renvoie un objet Date pour une colonne DATE, construit à partir des
 * composantes locales (année/mois/jour) sans notion de fuseau. `toISOString()`
 * les reconvertirait en UTC et décalerait la date d'un jour dès que le
 * fuseau du serveur a un offset non nul (constaté avec Africa/Casablanca,
 * UTC+1 — voir même fonction dans medications.ts) : on relit donc les
 * composantes locales telles quelles plutôt que de repasser par UTC.
 */
function formatDateSeule(valeur: Date): string {
  const annee = valeur.getFullYear();
  const mois = String(valeur.getMonth() + 1).padStart(2, "0");
  const jour = String(valeur.getDate()).padStart(2, "0");
  return `${annee}-${mois}-${jour}`;
}
