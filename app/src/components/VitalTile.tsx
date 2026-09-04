/** Bloc d'une mesure vitale, affiché dans la carte d'état. */
import { Text, View } from "react-native";

interface Props {
  libelle: string;
  valeur: string;
  unite?: string;
}

export function VitalTile({ libelle, valeur, unite }: Props) {
  return (
    <View className="flex-1 rounded-2xl bg-white/15 px-4 py-3">
      <Text className="text-white/80 text-base" numberOfLines={1}>
        {libelle}
      </Text>
      <View className="flex-row items-end">
        <Text className="text-white text-4xl font-extrabold">{valeur}</Text>
        {unite ? (
          <Text className="text-white/80 text-lg mb-1 ms-1">{unite}</Text>
        ) : null}
      </View>
    </View>
  );
}
