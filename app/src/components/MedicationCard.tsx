/**
 * Ligne d'un traitement dans la liste (nom, condition visée, horaires).
 * Tap sur la ligne -> édition ; icône corbeille séparée -> suppression
 * (toutes deux réservées au rôle famille, voir `modifiable`).
 */
import { I18nManager, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { MedicationTimeChip } from "./MedicationTimeChip";
import { COULEURS } from "@/theme/colors";
import type { Medication } from "@/types/api";

interface Props {
  medication: Medication;
  modifiable: boolean;
  onEdit: () => void;
  onSupprimer: () => void;
}

export function MedicationCard({ medication, modifiable, onEdit, onSupprimer }: Props) {
  const { t, i18n } = useTranslation();
  const chevron = I18nManager.isRTL ? "chevron-back" : "chevron-forward";

  const fmtDate = (iso: string) => new Intl.DateTimeFormat(i18n.language).format(new Date(iso));
  let periode: string | null = null;
  if (medication.startDate && medication.endDate) {
    periode = t("medicaments.periode", {
      debut: fmtDate(medication.startDate),
      fin: fmtDate(medication.endDate),
    });
  } else if (medication.startDate) {
    periode = t("medicaments.depuisLe", { debut: fmtDate(medication.startDate) });
  } else if (medication.endDate) {
    periode = t("medicaments.jusquAu", { fin: fmtDate(medication.endDate) });
  }

  return (
    // Un simple View, pas un Pressable : la zone d'édition et le bouton de
    // suppression sont deux Pressable/<button> frères, jamais l'un dans
    // l'autre (un <button> HTML ne peut pas en contenir un autre — testé en
    // navigateur, le clic sur la corbeille ouvrait l'édition au lieu de
    // supprimer).
    <View className="flex-row items-center px-4 py-3" style={{ gap: 8, minHeight: 44 }}>
      <Pressable
        accessibilityRole={modifiable ? "button" : undefined}
        disabled={!modifiable}
        onPress={onEdit}
        className="flex-1"
        style={{ gap: 6 }}
      >
        <Text className="text-text text-base font-semibold">
          {medication.name}
          {medication.dose ? <Text className="text-textSoft text-sm font-normal"> · {medication.dose}</Text> : null}
        </Text>
        <Text className="text-textSoft text-sm">{medication.conditionLabel}</Text>
        {medication.instructions ? (
          <Text className="text-textSoft text-sm">{medication.instructions}</Text>
        ) : null}
        <View className="flex-row flex-wrap" style={{ gap: 6 }}>
          {medication.times.map((horaire) => (
            <MedicationTimeChip key={horaire.id} timeOfDay={horaire.timeOfDay} label={horaire.label} />
          ))}
        </View>
        {medication.notes ? (
          <Text className="text-textSoft text-sm">{medication.notes}</Text>
        ) : null}
        {periode ? <Text className="text-textSoft text-sm">{periode}</Text> : null}
      </Pressable>
      {modifiable ? (
        <View className="items-center" style={{ gap: 12 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("profil.supprimer")}
            onPress={onSupprimer}
            hitSlop={8}
            style={{ minWidth: 32, minHeight: 32, alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="trash-outline" size={18} color={COULEURS.critical} />
          </Pressable>
          <Ionicons name={chevron} size={18} color={COULEURS.textSoft} />
        </View>
      ) : null}
    </View>
  );
}
