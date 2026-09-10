/** Champ mot de passe avec bouton afficher/masquer. */
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COULEURS } from "@/theme/colors";

interface Props {
  valeur: string;
  onChangeText: (texte: string) => void;
  placeholder?: string;
}

export function PasswordInput({ valeur, onChangeText, placeholder }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View className="flex-row items-center rounded-2xl bg-surface border border-border px-4">
      <TextInput
        value={valeur}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COULEURS.textSoft}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        className="flex-1 text-text text-base py-3.5"
        style={{ minHeight: 44 }}
      />
      <Pressable
        accessibilityRole="button"
        onPress={() => setVisible((v) => !v)}
        style={{ width: 44, height: 44 }}
        className="items-center justify-center"
      >
        <Ionicons
          name={visible ? "eye-off-outline" : "eye-outline"}
          size={20}
          color={COULEURS.textSoft}
        />
      </Pressable>
    </View>
  );
}
