/** Écran Historique — placeholder (graphiques FC / SpO2 à venir). */
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { ScreenContainer } from "@/components/ScreenContainer";

export default function HistoriqueScreen() {
  const { t } = useTranslation();

  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-neutral-400">
          {t("historique.bientot")}
        </Text>
      </View>
    </ScreenContainer>
  );
}
