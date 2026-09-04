/**
 * Grande carte d'état de santé, colorée selon `status.state`
 * (vert / orange / rouge). Élément central de l'écran d'accueil.
 */
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import type { Status } from "@/types/api";
import { classeFondEtat, cleLibelleEtat } from "@/lib/etat";
import { tempsRelatif } from "@/lib/datetime";
import { fmtNombre } from "@/lib/format";
import { VitalTile } from "./VitalTile";

interface Props {
  status: Status;
}

export function StatusCard({ status }: Props) {
  const { t } = useTranslation();

  return (
    <View className={`rounded-3xl p-6 ${classeFondEtat[status.state]}`}>
      <Text className="text-white text-3xl font-extrabold">
        {t(cleLibelleEtat[status.state])}
      </Text>
      <Text className="text-white/90 text-base mt-1">
        {t("accueil.derniereSync", { temps: tempsRelatif(status.lastSyncAt) })}
      </Text>

      <View className="flex-row mt-6" style={{ gap: 12 }}>
        <VitalTile
          libelle={t("vitaux.fc")}
          valeur={fmtNombre(status.heartRate)}
          unite={t("unites.bpm")}
        />
        <VitalTile
          libelle={t("vitaux.spo2")}
          valeur={fmtNombre(status.spo2)}
          unite="%"
        />
      </View>

      <View className="mt-3">
        <VitalTile
          libelle={t("vitaux.batterie")}
          valeur={fmtNombre(status.battery)}
          unite="%"
        />
      </View>
    </View>
  );
}
