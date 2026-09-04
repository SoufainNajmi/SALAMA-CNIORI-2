/**
 * Écran d'alerte plein écran (rouge).
 * Ouvert depuis le bandeau d'accueil ou depuis une notification push.
 * Action principale : accuser réception de l'alerte.
 */
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { tempsRelatif } from "@/lib/datetime";
import { useAlertsStore } from "@/store/useAlertsStore";

export default function AlerteScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const alerte = useAlertsStore((s) => s.alertes.find((a) => a.id === id));
  const accuser = useAlertsStore((s) => s.accuser);
  const rafraichir = useAlertsStore((s) => s.rafraichir);

  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    // Alerte inconnue (app ouverte directement depuis une notification) :
    // on recharge la liste.
    if (!alerte) void rafraichir();
  }, [alerte, rafraichir]);

  const fermer = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  if (!alerte) {
    return (
      <View className="flex-1 bg-etat-alert items-center justify-center">
        <Text className="text-white text-xl">{t("commun.chargement")}</Text>
      </View>
    );
  }

  const onAccuser = async () => {
    setEnvoi(true);
    try {
      await accuser(alerte.id);
      fermer();
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <View
      className="flex-1 bg-etat-alert px-6"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }}
    >
      <View className="flex-1 justify-center" style={{ gap: 16 }}>
        <Text className="text-6xl">⚠️</Text>
        <Text className="text-white text-4xl font-extrabold">
          {t(`alertes.type.${alerte.type}`)}
        </Text>
        <Text className="text-white/90 text-xl">
          {tempsRelatif(alerte.occurredAt)}
        </Text>
        {alerte.details.message ? (
          <Text className="text-white/90 text-lg">{alerte.details.message}</Text>
        ) : null}
      </View>

      <View style={{ gap: 12 }}>
        {alerte.acknowledged ? (
          <Text className="text-white text-center text-lg">
            {t("alertes.dejaAcquittee", { nom: alerte.acknowledgedBy ?? "" })}
          </Text>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={onAccuser}
            disabled={envoi}
            className="bg-white rounded-2xl py-5 items-center active:opacity-80"
          >
            <Text className="text-etat-alert text-xl font-bold">
              {t("alertes.accuser")}
            </Text>
          </Pressable>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={fermer}
          className="py-3 items-center"
        >
          <Text className="text-white/90 text-lg">{t("commun.fermer")}</Text>
        </Pressable>
      </View>
    </View>
  );
}
