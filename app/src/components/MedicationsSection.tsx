/**
 * Liste des traitements du porteur (§ profil médical) : condition visée,
 * médicament, horaires de prise. Lecture seule pour le rôle meriid ; ajout /
 * édition / suppression pour le rôle famille — même règle que les allergies
 * et maladies chroniques (voir MedicalProfileSection).
 */
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { MedicationCard } from "./MedicationCard";
import { MedicationFormModal, type ValeursMedicament } from "./MedicationFormModal";
import { COULEURS } from "@/theme/colors";
import { api } from "@/services/api";
import { confirmerAction } from "@/lib/confirmer";
import type { Medication } from "@/types/api";

interface Props {
  modifiable: boolean;
}

export function MedicationsSection({ modifiable }: Props) {
  const { t } = useTranslation();
  const [medicaments, setMedicaments] = useState<Medication[] | null>(null);
  const [ajoutVisible, setAjoutVisible] = useState(false);
  const [medicamentEnEdition, setMedicamentEnEdition] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  // Voir MedicalProfileSection : garde synchrone contre la double soumission.
  const envoiEnCoursRef = useRef(false);

  useEffect(() => {
    void api.getMedications().then(setMedicaments);
  }, []);

  if (!medicaments) return null;

  const medicament = medicaments.find((m) => m.id === medicamentEnEdition) ?? null;

  const ajouterMedicament = async (valeurs: ValeursMedicament) => {
    if (envoiEnCoursRef.current) return;
    envoiEnCoursRef.current = true;
    setEnvoiEnCours(true);
    try {
      const cree = await api.addMedication(valeurs);
      setMedicaments((liste) => (liste ? [...liste, cree] : liste));
      setAjoutVisible(false);
    } finally {
      envoiEnCoursRef.current = false;
      setEnvoiEnCours(false);
    }
  };

  const enregistrerMedicament = async (valeurs: ValeursMedicament) => {
    if (envoiEnCoursRef.current || !medicamentEnEdition) return;
    envoiEnCoursRef.current = true;
    setEnvoiEnCours(true);
    try {
      const misAJour = await api.updateMedication(medicamentEnEdition, valeurs);
      setMedicaments((liste) =>
        liste ? liste.map((m) => (m.id === misAJour.id ? misAJour : m)) : liste,
      );
      setMedicamentEnEdition(null);
    } finally {
      envoiEnCoursRef.current = false;
      setEnvoiEnCours(false);
    }
  };

  const confirmerSuppression = (id: string, name: string) => {
    confirmerAction({
      titre: t("medicaments.supprimerTitre"),
      message: t("medicaments.supprimerMessage", { name }),
      labelAnnuler: t("commun.annuler"),
      labelConfirmer: t("profil.supprimer"),
      onConfirmer: async () => {
        await api.removeMedication(id);
        setMedicaments((liste) => (liste ? liste.filter((m) => m.id !== id) : liste));
      },
    });
  };

  return (
    <View style={{ gap: 8 }}>
      <View className="flex-row items-center justify-between">
        <Text className="text-text text-base font-bold">{t("medicaments.titre")}</Text>
        {modifiable ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setAjoutVisible(true)}
            className="rounded-full border border-border px-4 py-2"
            style={{ minHeight: 36 }}
          >
            <Text className="text-primary text-sm font-bold">{t("medicaments.ajouter")}</Text>
          </Pressable>
        ) : null}
      </View>

      {medicaments.length === 0 ? (
        <Text className="text-textSoft text-sm">{t("medicaments.aucunTraitement")}</Text>
      ) : (
        <View className="rounded-2xl bg-surface border border-border">
          {medicaments.map((m, index) => (
            <View
              key={m.id}
              style={{ borderTopWidth: index === 0 ? 0 : 1, borderTopColor: COULEURS.border }}
            >
              <MedicationCard
                medication={m}
                modifiable={modifiable}
                onEdit={() => setMedicamentEnEdition(m.id)}
                onSupprimer={() => confirmerSuppression(m.id, m.name)}
              />
            </View>
          ))}
        </View>
      )}

      <MedicationFormModal
        visible={ajoutVisible}
        titre={t("medicaments.ajouterTitre")}
        libelleValider={t("profil.ajouter")}
        enTraitement={envoiEnCours}
        onAnnuler={() => setAjoutVisible(false)}
        onValider={ajouterMedicament}
      />

      <MedicationFormModal
        visible={medicament !== null}
        titre={t("medicaments.modifierTitre")}
        libelleValider={t("profil.enregistrer")}
        valeurInitiale={
          medicament
            ? {
                conditionLabel: medicament.conditionLabel,
                name: medicament.name,
                dose: medicament.dose,
                instructions: medicament.instructions,
                notes: medicament.notes,
                startDate: medicament.startDate,
                endDate: medicament.endDate,
                times: medicament.times.map((h) => ({ timeOfDay: h.timeOfDay, label: h.label })),
              }
            : undefined
        }
        enTraitement={envoiEnCours}
        onAnnuler={() => setMedicamentEnEdition(null)}
        onValider={enregistrerMedicament}
      />
    </View>
  );
}
