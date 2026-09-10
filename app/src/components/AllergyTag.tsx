/** Tag d'allergie (ton warn) — cliquable pour retirer si `onPress` est fourni. */
import { Pressable, Text } from "react-native";

interface Props {
  label: string;
  onPress?: () => void;
}

export function AllergyTag({ label, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      onPress={onPress}
      disabled={!onPress}
      className="rounded-full bg-warnSoft px-4 py-2"
      style={{ minHeight: 36 }}
    >
      <Text className="text-warn text-sm font-bold">{label}</Text>
    </Pressable>
  );
}
