import type { AddMedicationRequest, Medication, UpdateMedicationRequest } from "@/types/api";

/** Traitements factices du porteur, mutables en mémoire (comme wearerMock). */
let medicationsMock: Medication[] = [
  {
    id: "medication-1",
    conditionLabel: "ارتفاع ضغط الدم",
    name: "أملوديبين",
    dose: "5mg",
    instructions: null,
    notes: null,
    startDate: null,
    endDate: null,
    times: [
      { id: "medication-1-time-1", timeOfDay: "08:00", label: "matin" },
      { id: "medication-1-time-2", timeOfDay: "20:00", label: "soir" },
    ],
  },
];

function nouvelId(prefixe: string): string {
  return `${prefixe}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function medicationsSnapshotMock(): Medication[] {
  return medicationsMock.map((m) => ({ ...m, times: [...m.times] }));
}

export function ajouterMedicamentMock(body: AddMedicationRequest): Medication {
  const medicament: Medication = {
    id: nouvelId("medication"),
    conditionLabel: body.conditionLabel,
    name: body.name,
    dose: body.dose ?? null,
    instructions: body.instructions ?? null,
    notes: body.notes ?? null,
    startDate: body.startDate ?? null,
    endDate: body.endDate ?? null,
    times: body.times.map((h) => ({ id: nouvelId("medication-time"), ...h })),
  };
  medicationsMock.push(medicament);
  return { ...medicament, times: [...medicament.times] };
}

export function modifierMedicamentMock(id: string, body: UpdateMedicationRequest): Medication {
  const cible = medicationsMock.find((m) => m.id === id);
  if (!cible) {
    throw { code: "not_found", message: `Traitement ${id} introuvable` };
  }
  cible.conditionLabel = body.conditionLabel;
  cible.name = body.name;
  cible.dose = body.dose ?? null;
  cible.instructions = body.instructions ?? null;
  cible.notes = body.notes ?? null;
  cible.startDate = body.startDate ?? null;
  cible.endDate = body.endDate ?? null;
  cible.times = body.times.map((h) => ({ id: nouvelId("medication-time"), ...h }));
  return { ...cible, times: [...cible.times] };
}

export function retirerMedicamentMock(id: string): void {
  medicationsMock = medicationsMock.filter((m) => m.id !== id);
}
