/** Puce d'horaire de prise ("08:00 · Matin") — lecture seule, ton neutre. */
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import type { MedicationTimeLabel } from "@/types/api";

interface Props {
  timeOfDay: string;
  label: MedicationTimeLabel;
}

export function MedicationTimeChip({ timeOfDay, label }: Props) {
  const { t } = useTranslation();
  return (
    <View className="rounded-full bg-primarySoft px-3 py-1">
      <Text className="text-primary text-xs font-bold">
        {timeOfDay} · {t(`medicaments.horaireLabel.${label}`)}
      </Text>
    </View>
  );
}
