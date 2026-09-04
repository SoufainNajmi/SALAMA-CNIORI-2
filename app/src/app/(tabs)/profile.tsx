/** Écran Profil — placeholder (profil du porteur + contacts d'urgence à venir). */
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { ScreenContainer } from "@/components/ScreenContainer";

export default function ProfilScreen() {
  const { t } = useTranslation();

  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-neutral-400">
          {t("profil.bientot")}
        </Text>
      </View>
    </ScreenContainer>
  );
}
