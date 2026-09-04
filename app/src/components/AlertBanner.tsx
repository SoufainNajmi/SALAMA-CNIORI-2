/**
 * Bandeau affiché en haut de l'accueil quand une alerte n'est pas acquittée.
 * Tap -> écran d'alerte plein écran.
 */
import { I18nManager, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import type { Alert } from "@/types/api";
import { tempsRelatif } from "@/lib/datetime";

interface Props {
  alerte: Alert;
}

export function AlertBanner({ alerte }: Props) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/alert/${alerte.id}`)}
      className="flex-row items-center rounded-2xl bg-etat-alert px-4 py-4 mb-4"
      style={{ gap: 12 }}
    >
      <Text className="text-2xl">⚠️</Text>
      <View className="flex-1">
        <Text className="text-white font-bold text-lg">
          {t(`alertes.type.${alerte.type}`)}
        </Text>
        <Text className="text-white/90 text-sm">
          {t("alertes.taperPourVoir")} · {tempsRelatif(alerte.occurredAt)}
        </Text>
      </View>
      <Text className="text-white text-2xl">
        {I18nManager.isRTL ? "‹" : "›"}
      </Text>
    </Pressable>
  );
}
