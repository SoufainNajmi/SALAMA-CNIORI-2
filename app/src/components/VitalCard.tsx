/**
 * Carte vitale compacte (grille de l'accueil) : badge icône, valeur en grand,
 * libellé en dessous. Fond clair, contrairement à VitalTile (fond coloré).
 */
import type { ComponentProps } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COULEURS } from "@/theme/colors";

interface Props {
  icone: ComponentProps<typeof Ionicons>["name"];
  libelle: string;
  valeur: string;
  unite?: string;
}

export function VitalCard({ icone, libelle, valeur, unite }: Props) {
  return (
    <View
      className="rounded-2xl bg-surface border border-border p-4"
      style={{ flexBasis: "47%", flexGrow: 1 }}
    >
      <View
        className="items-center justify-center rounded-full bg-primarySoft"
        style={{ width: 36, height: 36 }}
      >
        <Ionicons name={icone} size={18} color={COULEURS.primary} />
      </View>

      <View className="flex-row items-end mt-3">
        <Text className="text-text text-2xl font-extrabold" numberOfLines={1}>
          {valeur}
        </Text>
        {unite ? (
          <Text className="text-textSoft text-sm ms-1 mb-0.5">{unite}</Text>
        ) : null}
      </View>
      <Text className="text-textSoft text-sm mt-0.5" numberOfLines={1}>
        {libelle}
      </Text>
    </View>
  );
}
