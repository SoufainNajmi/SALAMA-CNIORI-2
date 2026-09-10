/** Sélecteur de rôle (segmented control 2 options) — écran de connexion. */
import { Pressable, Text, View } from "react-native";

import type { Role } from "@/types/api";

interface Props {
  valeur: Role;
  onChange: (role: Role) => void;
  libelleMeriid: string;
  libelleFamille: string;
}

export function RoleSelector({ valeur, onChange, libelleMeriid, libelleFamille }: Props) {
  const options: { role: Role; libelle: string }[] = [
    { role: "meriid", libelle: libelleMeriid },
    { role: "famille", libelle: libelleFamille },
  ];

  return (
    <View className="flex-row rounded-2xl bg-primarySoft p-1" style={{ gap: 4 }}>
      {options.map(({ role, libelle }) => {
        const actif = role === valeur;
        return (
          <Pressable
            key={role}
            accessibilityRole="button"
            accessibilityState={{ selected: actif }}
            onPress={() => onChange(role)}
            className={`flex-1 items-center justify-center rounded-xl py-3 ${actif ? "bg-primary" : ""}`}
            style={{ minHeight: 44 }}
          >
            <Text
              className={`text-sm font-bold text-center ${actif ? "text-white" : "text-primary"}`}
            >
              {libelle}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
