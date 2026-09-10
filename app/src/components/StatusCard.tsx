/**
 * Carte d'état de santé principale de l'accueil : pill de statut, dernière
 * synchro (texte), puis le vital le plus important (FC) en grand.
 * Élément central de l'écran d'accueil.
 */
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import type { Status } from "@/types/api";
import { cleLibelleEtat } from "@/lib/etat";
import { tempsRelatif } from "@/lib/datetime";
import { fmtNombre } from "@/lib/format";
import { StatusPill } from "./StatusPill";

interface Props {
  status: Status;
}

export function StatusCard({ status }: Props) {
  const { t } = useTranslation();

  // Le rouge (critical) est réservé à l'écran d'alerte plein écran : ici,
  // un état "alert" retombe visuellement sur le ton "warn".
  const ton = status.state === "ok" ? "ok" : "warn";
  const fondClasse = ton === "ok" ? "bg-primary" : "bg-warn";

  return (
    <View className={`rounded-3xl p-6 ${fondClasse}`}>
      <StatusPill ton={ton}>{t(cleLibelleEtat[status.state])}</StatusPill>

      <Text className="text-white/70 text-sm mt-4">
        {t("accueil.derniereSync", { temps: tempsRelatif(status.lastSyncAt) })}
      </Text>

      <View className="mt-3">
        <Text className="text-white/80 text-base">{t("vitaux.fc")}</Text>
        <View className="flex-row items-end">
          <Text className="text-white text-6xl font-extrabold">
            {fmtNombre(status.heartRate)}
          </Text>
          <Text className="text-white/80 text-xl ms-2 mb-2">
            {t("unites.bpm")}
          </Text>
        </View>
      </View>
    </View>
  );
}
