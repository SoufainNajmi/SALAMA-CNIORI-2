/**
 * Pastille de statut affichée sur un fond coloré (carte de statut, écran
 * d'alerte). Toujours blanche : la couleur du fond porte déjà le sens
 * (ok/attention/urgence) — le point reprend le ton pour un repère en plus.
 */
import type { ReactNode } from "react";
import { Text, View } from "react-native";

type Ton = "ok" | "warn" | "crit";

const COULEUR_POINT: Record<Ton, string> = {
  ok: "bg-ok",
  warn: "bg-warn",
  crit: "bg-critical",
};

interface Props {
  ton: Ton;
  children: ReactNode;
}

export function StatusPill({ ton, children }: Props) {
  return (
    <View
      className="flex-row items-center self-start rounded-full bg-white/20 px-3 py-1.5"
      style={{ gap: 6 }}
    >
      <View className={`w-2 h-2 rounded-full ${COULEUR_POINT[ton]}`} />
      <Text className="text-white text-sm font-bold">{children}</Text>
    </View>
  );
}
