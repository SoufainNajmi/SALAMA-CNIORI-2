/**
 * Écran d'appairage du bracelet (BLE).
 * Volontairement vide pour l'instant : la couche Bluetooth n'est pas
 * implémentée dans cette version.
 */
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { ScreenContainer } from "@/components/ScreenContainer";

export default function AppairageScreen() {
  const { t } = useTranslation();

  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-neutral-400">
          {t("appairage.bientot")}
        </Text>
      </View>
    </ScreenContainer>
  );
}
