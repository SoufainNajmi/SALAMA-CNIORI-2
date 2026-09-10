import type { Allergy, ChronicCondition, WearerProfile } from "@/types/api";

/** Profil factice du porteur du bracelet + contacts d'urgence, mutable en mémoire. */
export const wearerMock: WearerProfile = {
  id: "wearer-1",
  fullName: "فاطمة بناني",
  birthDate: "1949-03-12",
  sex: "female",
  city: "الدار البيضاء",
  photoUrl: null,
  bloodType: "O+",
  heightCm: 158,
  weightKg: 62,
  allergies: [{ id: "allergy-1", label: "البنسلين" }],
  chronicConditions: [
    {
      id: "condition-1",
      label: "ارتفاع ضغط الدم",
      notes: "دواء يومي صباحًا.",
    },
  ],
  emergencyContacts: [
    {
      id: "contact-1",
      fullName: "أحمد بناني",
      relationship: "الابن",
      phone: "+212600000001",
      priority: 1,
    },
    {
      id: "contact-2",
      fullName: "خديجة بناني",
      relationship: "الابنة",
      phone: "+212600000002",
      priority: 2,
    },
    {
      id: "contact-3",
      fullName: "الدكتور العلوي",
      relationship: "الطبيب المعالج",
      phone: "+212600000003",
      priority: 3,
    },
  ],
};

/**
 * Snapshot indépendant de wearerMock (tableaux clonés) : sans ça, un appelant
 * qui reçoit l'objet mutable brut voit ses propres modifications entrer en
 * collision avec celles faites par ajouterAllergieMock/etc. (le tableau
 * `allergies` étant la même référence des deux côtés) — comportement que
 * n'aurait pas une vraie réponse HTTP, donc trompeur pour un mock.
 */
export function wearerSnapshotMock(): WearerProfile {
  return {
    ...wearerMock,
    allergies: [...wearerMock.allergies],
    chronicConditions: [...wearerMock.chronicConditions],
    emergencyContacts: [...wearerMock.emergencyContacts],
  };
}

export function ajouterAllergieMock(label: string): Allergy {
  // Date.now() seul peut collisionner sur deux appels rapprochés (double-tap) ;
  // le suffixe aléatoire garantit un id unique même dans ce cas.
  const allergie: Allergy = {
    id: `allergy-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label,
  };
  wearerMock.allergies.push(allergie);
  return allergie;
}

export function retirerAllergieMock(id: string): void {
  wearerMock.allergies = wearerMock.allergies.filter((a) => a.id !== id);
}

export function modifierMaladieChroniqueMock(
  id: string,
  body: { label?: string; notes?: string | null },
): ChronicCondition {
  const cible = wearerMock.chronicConditions.find((c) => c.id === id);
  if (!cible) {
    throw { code: "not_found", message: `Maladie chronique ${id} introuvable` };
  }
  if (body.label !== undefined) cible.label = body.label;
  if (body.notes !== undefined) cible.notes = body.notes;
  return { ...cible };
}
