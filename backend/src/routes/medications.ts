/**
 * GET/POST/PUT/DELETE /api/medications — voir types.ts (Medication).
 * Lecture ouverte aux deux rôles ; écriture réservée au rôle "famille"
 * (même règle que /api/wearer/allergies et /chronic-conditions).
 */
import { randomUUID } from "node:crypto";
import { Router } from "express";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";

import { db } from "../db";
import { authentifier } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { resoudreHouseholdCible } from "../lib/household";
import type {
  AddMedicationRequest,
  Medication,
  MedicationTime,
  MedicationTimeInput,
  MedicationTimeLabel,
  UpdateMedicationRequest,
} from "../types";

export const medicationsRouter = Router();

medicationsRouter.use(authentifier);

const LABELS_VALIDES: MedicationTimeLabel[] = ["matin", "midi", "soir", "autre"];
const REGEX_HEURE = /^([01]\d|2[0-3]):([0-5]\d)$/;
const REGEX_DATE = /^\d{4}-\d{2}-\d{2}$/;

function verifierRoleFamille(req: import("express").Request, res: import("express").Response): boolean {
  if (req.user?.role !== "famille") {
    res.status(403).json({ code: "unauthorized", message: "Réservé au rôle famille." });
    return false;
  }
  return true;
}

/** Valide le corps d'une requête d'ajout/modification ; renvoie le message d'erreur ou null. */
function validerCorps(body: Partial<AddMedicationRequest>): string | null {
  if (!body.conditionLabel?.trim()) return "La condition/maladie est obligatoire.";
  if (!body.name?.trim()) return "Le nom du médicament est obligatoire.";
  if (!Array.isArray(body.times) || body.times.length === 0) {
    return "Au moins un horaire est requis.";
  }
  for (const horaire of body.times) {
    if (!horaire.timeOfDay || !REGEX_HEURE.test(horaire.timeOfDay)) {
      return "Horaire invalide (format attendu HH:MM).";
    }
    if (!LABELS_VALIDES.includes(horaire.label)) {
      return "Moment de la journée invalide.";
    }
  }
  // dose/instructions/notes : texte libre optionnel, aucune contrainte de format.
  if (body.startDate != null && !REGEX_DATE.test(body.startDate)) {
    return "Date de début invalide (format attendu AAAA-MM-JJ).";
  }
  if (body.endDate != null && !REGEX_DATE.test(body.endDate)) {
    return "Date de fin invalide (format attendu AAAA-MM-JJ).";
  }
  if (body.startDate && body.endDate && body.endDate < body.startDate) {
    return "La date de fin doit être postérieure ou égale à la date de début.";
  }
  return null;
}

function mapLigneMedicament(ligne: RowDataPacket, horaires: MedicationTime[]): Medication {
  return {
    id: ligne.id,
    conditionLabel: ligne.condition_label,
    name: ligne.name,
    dose: ligne.dose ?? null,
    instructions: ligne.instructions ?? null,
    notes: ligne.notes ?? null,
    startDate: ligne.start_date ? formatDateSeule(ligne.start_date) : null,
    endDate: ligne.end_date ? formatDateSeule(ligne.end_date) : null,
    times: horaires,
  };
}

/**
 * mysql2 renvoie un objet Date pour une colonne DATE, construit à partir des
 * composantes locales (année/mois/jour) sans notion de fuseau. `toISOString()`
 * les reconvertirait en UTC et décalerait la date d'un jour dès que le
 * fuseau du serveur a un offset non nul (constaté avec Africa/Casablanca,
 * UTC+1 — voir même fonction dans wearer.ts) : on relit donc les composantes
 * locales telles quelles plutôt que de repasser par UTC.
 */
function formatDateSeule(valeur: Date): string {
  const annee = valeur.getFullYear();
  const mois = String(valeur.getMonth() + 1).padStart(2, "0");
  const jour = String(valeur.getDate()).padStart(2, "0");
  return `${annee}-${mois}-${jour}`;
}

const COLONNES_MEDICATION =
  "id, condition_label, name, dose, instructions, notes, start_date, end_date";

async function chargerMedicaments(userId: string): Promise<Medication[]> {
  const [medicamentsLignes] = await db.query<RowDataPacket[]>(
    `SELECT ${COLONNES_MEDICATION} FROM medications WHERE user_id = ? ORDER BY created_at ASC`,
    [userId],
  );
  if (medicamentsLignes.length === 0) return [];

  const ids = medicamentsLignes.map((l) => l.id);
  const [horairesLignes] = await db.query<RowDataPacket[]>(
    `SELECT id, medication_id, time_of_day, label FROM medication_schedule
      WHERE medication_id IN (?) ORDER BY time_of_day ASC`,
    [ids],
  );

  const horairesParMedicament = new Map<string, MedicationTime[]>();
  for (const ligne of horairesLignes) {
    const liste = horairesParMedicament.get(ligne.medication_id) ?? [];
    liste.push({
      id: ligne.id,
      timeOfDay: String(ligne.time_of_day).slice(0, 5),
      label: ligne.label,
    });
    horairesParMedicament.set(ligne.medication_id, liste);
  }

  return medicamentsLignes.map((l) => mapLigneMedicament(l, horairesParMedicament.get(l.id) ?? []));
}

async function chargerMedicamentParId(id: string): Promise<Medication> {
  const [medicamentsLignes] = await db.query<RowDataPacket[]>(
    `SELECT ${COLONNES_MEDICATION} FROM medications WHERE id = ? LIMIT 1`,
    [id],
  );
  const [horairesLignes] = await db.query<RowDataPacket[]>(
    "SELECT id, time_of_day, label FROM medication_schedule WHERE medication_id = ? ORDER BY time_of_day ASC",
    [id],
  );
  return mapLigneMedicament(medicamentsLignes[0], horairesLignes.map((l) => ({
    id: l.id,
    timeOfDay: String(l.time_of_day).slice(0, 5),
    label: l.label,
  })));
}

async function remplacerHoraires(
  connexion: PoolConnection,
  medicationId: string,
  horaires: MedicationTimeInput[],
): Promise<void> {
  await connexion.query("DELETE FROM medication_schedule WHERE medication_id = ?", [medicationId]);
  for (const horaire of horaires) {
    await connexion.query(
      "INSERT INTO medication_schedule (id, medication_id, time_of_day, label) VALUES (?, ?, ?, ?)",
      [randomUUID(), medicationId, horaire.timeOfDay, horaire.label],
    );
  }
}

medicationsRouter.get("/", asyncHandler(async (req, res) => {
  const cible = await resoudreHouseholdCible(req.user!);
  if (!cible) {
    res.status(404).json({ code: "not_found", message: "Aucun household pour ce compte." });
    return;
  }
  res.json(await chargerMedicaments(cible.meriidUserId));
}));

medicationsRouter.post("/", asyncHandler(async (req, res) => {
  if (!verifierRoleFamille(req, res)) return;

  const cible = await resoudreHouseholdCible(req.user!);
  if (!cible) {
    res.status(404).json({ code: "not_found", message: "Aucun household pour ce compte." });
    return;
  }

  const body = req.body as Partial<AddMedicationRequest>;
  const erreur = validerCorps(body);
  if (erreur) {
    res.status(400).json({ code: "invalid_request", message: erreur });
    return;
  }

  const medicationId = randomUUID();
  const connexion = await db.getConnection();
  try {
    await connexion.beginTransaction();
    await connexion.query(
      `INSERT INTO medications
         (id, user_id, condition_label, name, dose, instructions, notes, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        medicationId,
        cible.meriidUserId,
        body.conditionLabel!.trim(),
        body.name!.trim(),
        body.dose?.trim() || null,
        body.instructions?.trim() || null,
        body.notes?.trim() || null,
        body.startDate || null,
        body.endDate || null,
      ],
    );
    await remplacerHoraires(connexion, medicationId, body.times!);
    await connexion.commit();
  } catch (e) {
    await connexion.rollback();
    throw e;
  } finally {
    connexion.release();
  }

  res.status(201).json(await chargerMedicamentParId(medicationId));
}));

medicationsRouter.put("/:id", asyncHandler(async (req, res) => {
  if (!verifierRoleFamille(req, res)) return;

  const cible = await resoudreHouseholdCible(req.user!);
  if (!cible) {
    res.status(404).json({ code: "not_found", message: "Aucun household pour ce compte." });
    return;
  }

  const body = req.body as Partial<UpdateMedicationRequest>;
  const erreur = validerCorps(body);
  if (erreur) {
    res.status(400).json({ code: "invalid_request", message: erreur });
    return;
  }

  // Portée à user_id = meriidUserId : empêche une famille d'un autre
  // household de modifier un traitement qui ne lui appartient pas.
  const [existant] = await db.query<RowDataPacket[]>(
    "SELECT id FROM medications WHERE id = ? AND user_id = ? LIMIT 1",
    [req.params.id, cible.meriidUserId],
  );
  if (existant.length === 0) {
    res.status(404).json({ code: "not_found", message: "Traitement introuvable." });
    return;
  }

  const connexion = await db.getConnection();
  try {
    await connexion.beginTransaction();
    await connexion.query(
      `UPDATE medications
          SET condition_label = ?, name = ?, dose = ?, instructions = ?, notes = ?,
              start_date = ?, end_date = ?
        WHERE id = ?`,
      [
        body.conditionLabel!.trim(),
        body.name!.trim(),
        body.dose?.trim() || null,
        body.instructions?.trim() || null,
        body.notes?.trim() || null,
        body.startDate || null,
        body.endDate || null,
        req.params.id,
      ],
    );
    await remplacerHoraires(connexion, req.params.id, body.times!);
    await connexion.commit();
  } catch (e) {
    await connexion.rollback();
    throw e;
  } finally {
    connexion.release();
  }

  res.json(await chargerMedicamentParId(req.params.id));
}));

medicationsRouter.delete("/:id", asyncHandler(async (req, res) => {
  if (!verifierRoleFamille(req, res)) return;

  const cible = await resoudreHouseholdCible(req.user!);
  if (!cible) {
    res.status(404).json({ code: "not_found", message: "Aucun household pour ce compte." });
    return;
  }

  const [resultat] = await db.query<import("mysql2").ResultSetHeader>(
    "DELETE FROM medications WHERE id = ? AND user_id = ?",
    [req.params.id, cible.meriidUserId],
  );
  if (resultat.affectedRows === 0) {
    res.status(404).json({ code: "not_found", message: "Traitement introuvable." });
    return;
  }
  res.status(204).send();
}));
