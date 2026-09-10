/**
 * Profil médical du porteur : en-tête, groupe sanguin / taille & poids,
 * allergies, maladies chroniques.
 * Lecture seule pour le rôle meriid ; édition (allergies + maladies) pour le
 * rôle famille — voir §3 du cahier des charges.
 */
import { useEffect, useRef, useState } from "react";
import { I18nManager, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { AllergyTag } from "./AllergyTag";
import { FormModal } from "./FormModal";
import { COULEURS } from "@/theme/colors";
import { api } from "@/services/api";
import { confirmerAction } from "@/lib/confirmer";
import { calculerAge, initiales } from "@/lib/format";
import type { WearerProfile } from "@/types/api";

interface Props {
  modifiable: boolean;
}

export function MedicalProfileSection({ modifiable }: Props) {
  const { t } = useTranslation();
  const [porteur, setPorteur] = useState<WearerProfile | null>(null);
  const [ajoutAllergieVisible, setAjoutAllergieVisible] = useState(false);
  const [maladieEnEdition, setMaladieEnEdition] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  // Garde synchrone (ref, pas state) : deux appels de `onPress` déclenchés
  // dans le même tick (observé en test, cause probable : double événement
  // "press" du Pressable web sur un clic synthétique) liraient tous les
  // deux `envoiEnCours` avant que le premier setState ne soit rendu — un
  // state seul ne suffit donc pas à empêcher la double soumission.
  const envoiEnCoursRef = useRef(false);

  useEffect(() => {
    void api.getWearer().then(setPorteur);
  }, []);

  if (!porteur) return null;

  const ajouterAllergie = async (valeurs: Record<string, string>) => {
    if (envoiEnCoursRef.current) return;
    const label = valeurs.label?.trim();
    if (!label) {
      setAjoutAllergieVisible(false);
      return;
    }
    envoiEnCoursRef.current = true;
    setEnvoiEnCours(true);
    try {
      const allergie = await api.addAllergy({ label });
      setPorteur((p) => (p ? { ...p, allergies: [...p.allergies, allergie] } : p));
      setAjoutAllergieVisible(false);
    } finally {
      envoiEnCoursRef.current = false;
      setEnvoiEnCours(false);
    }
  };

  const confirmerSuppressionAllergie = (id: string, label: string) => {
    confirmerAction({
      titre: t("profil.supprimerAllergieTitre"),
      message: t("profil.supprimerAllergieMessage", { label }),
      labelAnnuler: t("commun.annuler"),
      labelConfirmer: t("profil.supprimer"),
      onConfirmer: async () => {
        await api.removeAllergy(id);
        setPorteur((p) =>
          p ? { ...p, allergies: p.allergies.filter((a) => a.id !== id) } : p,
        );
      },
    });
  };

  const maladie = porteur.chronicConditions.find((c) => c.id === maladieEnEdition) ?? null;

  const enregistrerMaladie = async (valeurs: Record<string, string>) => {
    if (envoiEnCoursRef.current) return;
    const id = maladieEnEdition;
    if (!id) {
      setMaladieEnEdition(null);
      return;
    }
    envoiEnCoursRef.current = true;
    setEnvoiEnCours(true);
    try {
      const misAJour = await api.updateChronicCondition(id, {
        label: valeurs.label,
        notes: valeurs.notes || null,
      });
      setPorteur((p) =>
        p
          ? {
              ...p,
              chronicConditions: p.chronicConditions.map((c) => (c.id === id ? misAJour : c)),
            }
          : p,
      );
      setMaladieEnEdition(null);
    } finally {
      envoiEnCoursRef.current = false;
      setEnvoiEnCours(false);
    }
  };

  const chevron = I18nManager.isRTL ? "chevron-back" : "chevron-forward";

  return (
    <View style={{ gap: 16 }}>
      {/* En-tête */}
      <View className="flex-row items-center" style={{ gap: 12 }}>
        <View
          className="items-center justify-center rounded-full bg-primarySoft"
          style={{ width: 56, height: 56 }}
        >
          <Text className="text-primary text-xl font-extrabold">
            {initiales(porteur.fullName)}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-text text-lg font-bold" numberOfLines={1}>
            {porteur.fullName}
          </Text>
          <Text className="text-textSoft text-sm" numberOfLines={1}>
            {t("profil.ans", { age: calculerAge(porteur.birthDate) })}
            {porteur.city ? ` · ${porteur.city}` : ""}
          </Text>
        </View>
      </View>

      {/* Groupe sanguin / taille & poids */}
      <View className="flex-row" style={{ gap: 12 }}>
        <View
          className="flex-1 rounded-2xl bg-criticalSoft p-4"
          style={{ gap: 8 }}
        >
          <Ionicons name="water" size={20} color={COULEURS.critical} />
          <Text className="text-critical text-2xl font-extrabold">
            {porteur.bloodType ?? "—"}
          </Text>
          <Text className="text-critical text-sm">{t("profil.groupeSanguin")}</Text>
        </View>

        <View className="flex-1 rounded-2xl bg-surface border border-border p-4" style={{ gap: 8 }}>
          <Ionicons name="body-outline" size={20} color={COULEURS.textSoft} />
          <Text className="text-text text-2xl font-extrabold">
            {porteur.heightCm ?? "—"}
            <Text className="text-textSoft text-base">{t("unites.cm")}</Text>
            {" / "}
            {porteur.weightKg ?? "—"}
            <Text className="text-textSoft text-base">{t("unites.kg")}</Text>
          </Text>
          <Text className="text-textSoft text-sm">{t("profil.tailleEtPoids")}</Text>
        </View>
      </View>

      {/* Allergies */}
      <View style={{ gap: 8 }}>
        <Text className="text-text text-base font-bold">{t("profil.allergiesTitre")}</Text>
        <View className="flex-row flex-wrap" style={{ gap: 8 }}>
          {porteur.allergies.length === 0 && !modifiable ? (
            <Text className="text-textSoft text-sm">{t("profil.aucuneAllergie")}</Text>
          ) : null}
          {porteur.allergies.map((allergie) => (
            <AllergyTag
              key={allergie.id}
              label={allergie.label}
              onPress={
                modifiable
                  ? () => confirmerSuppressionAllergie(allergie.id, allergie.label)
                  : undefined
              }
            />
          ))}
          {modifiable ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setAjoutAllergieVisible(true)}
              className="rounded-full border border-border px-4 py-2"
              style={{ minHeight: 36 }}
            >
              <Text className="text-primary text-sm font-bold">
                {t("profil.ajouterAllergie")}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Maladies chroniques */}
      <View style={{ gap: 8 }}>
        <Text className="text-text text-base font-bold">
          {t("profil.maladiesChroniquesTitre")}
        </Text>
        {porteur.chronicConditions.length === 0 ? (
          <Text className="text-textSoft text-sm">{t("profil.aucuneMaladie")}</Text>
        ) : (
          <View className="rounded-2xl bg-surface border border-border">
            {porteur.chronicConditions.map((condition, index) => (
              <Pressable
                key={condition.id}
                accessibilityRole={modifiable ? "button" : undefined}
                disabled={!modifiable}
                onPress={() => setMaladieEnEdition(condition.id)}
                className="flex-row items-center px-4 py-3"
                style={{
                  gap: 8,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: COULEURS.border,
                  minHeight: 44,
                }}
              >
                <View className="flex-1">
                  <Text className="text-text text-base font-semibold">{condition.label}</Text>
                  {condition.notes ? (
                    <Text className="text-textSoft text-sm mt-0.5">{condition.notes}</Text>
                  ) : null}
                </View>
                {modifiable ? (
                  <Ionicons name={chevron} size={18} color={COULEURS.textSoft} />
                ) : null}
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <FormModal
        visible={ajoutAllergieVisible}
        titre={t("profil.ajouterAllergie")}
        champs={[{ cle: "label", libelle: t("profil.nouvelleAllergiePlaceholder") }]}
        libelleValider={t("profil.ajouter")}
        enTraitement={envoiEnCours}
        onAnnuler={() => setAjoutAllergieVisible(false)}
        onValider={ajouterAllergie}
      />

      <FormModal
        visible={maladie !== null}
        titre={t("profil.modifierMaladieTitre")}
        champs={[
          { cle: "label", libelle: t("profil.champLibelle"), valeurInitiale: maladie?.label },
          {
            cle: "notes",
            libelle: t("profil.champNotes"),
            valeurInitiale: maladie?.notes ?? "",
            multiligne: true,
          },
        ]}
        libelleValider={t("profil.enregistrer")}
        enTraitement={envoiEnCours}
        onAnnuler={() => setMaladieEnEdition(null)}
        onValider={enregistrerMaladie}
      />
    </View>
  );
}
