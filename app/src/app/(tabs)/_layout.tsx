/** Barre d'onglets : Accueil / Historique / Profil. Libellés traduits. */
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

import { COULEUR_ACCENT, COULEUR_TEXTE_DISCRET } from "@/theme/colors";

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COULEUR_ACCENT,
        tabBarInactiveTintColor: COULEUR_TEXTE_DISCRET,
        tabBarLabelStyle: { fontSize: 13 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("onglets.accueil"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t("onglets.historique"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pulse" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("onglets.profil"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
