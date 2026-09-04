import type { WearerProfile } from "@/types/api";

/** Profil factice du porteur du bracelet + contacts d'urgence. */
export const wearerMock: WearerProfile = {
  id: "wearer-1",
  fullName: "فاطمة بناني",
  birthDate: "1949-03-12",
  sex: "female",
  photoUrl: null,
  medicalNotes:
    "ارتفاع ضغط الدم — دواء يومي صباحًا.\nحساسية من البنسلين.",
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
