/** Conteneur d'écran : zone sûre (haut) + marges horizontales cohérentes. */
import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  children: ReactNode;
  /** Retire le padding horizontal (utile pour un contenu plein largeur). */
  sansMarges?: boolean;
}

export function ScreenContainer({ children, sansMarges = false }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-neutral-50"
      style={{ paddingTop: insets.top }}
    >
      <View className={sansMarges ? "flex-1" : "flex-1 px-5"}>{children}</View>
    </View>
  );
}
