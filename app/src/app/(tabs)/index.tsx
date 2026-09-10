/**
 * Écran d'accueil.
 * - En-tête : date du jour + salutation + cloche (alerte non acquittée).
 * - Bandeau d'alerte en haut si une alerte n'est pas acquittée.
 * - Carte de statut principale (pill + dernière synchro + FC en grand).
 * - Grille des autres vitaux (SpO2, batterie, connectivité).
 * - Action rapide : appeler le contact famille prioritaire.
 * - Pull-to-refresh (recharge statut + alertes).
 */
import { useCallback, useEffect, useState } from "react";
import {
  I18nManager,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { AlertBanner } from "@/components/AlertBanner";
import { ScreenContainer } from "@/components/ScreenContainer";
import { StatusCard } from "@/components/StatusCard";
import { VitalCard } from "@/components/VitalCard";
import { COULEUR_ACCENT, COULEURS } from "@/theme/colors";
import { api } from "@/services/api";
import type { WearerProfile } from "@/types/api";
import { fmtNombre } from "@/lib/format";
import { useStatusStore } from "@/store/useStatusStore";
import { selectAlerteNonAcquittee, useAlertsStore } from "@/store/useAlertsStore";

/** Icône batterie selon le niveau, pour un repérage visuel immédiat. */
function iconeBatterie(pourcentage: number): "battery-full" | "battery-half" | "battery-dead" {
  if (pourcentage >= 60) return "battery-full";
  if (pourcentage >= 20) return "battery-half";
  return "battery-dead";
}

export default function AccueilScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const status = useStatusStore((s) => s.status);
  const chargementStatus = useStatusStore((s) => s.chargement);
  const erreurStatus = useStatusStore((s) => s.erreur);
  const rafraichirStatus = useStatusStore((s) => s.rafraichir);

  const rafraichirAlertes = useAlertsStore((s) => s.rafraichir);
  const alerte = useAlertsStore(selectAlerteNonAcquittee);
  // Dérivé d'une vraie alerte backend ("offline"), pas d'un délai inventé côté app.
  const horsLigne = alerte?.type === "offline";

  const [porteur, setPorteur] = useState<WearerProfile | null>(null);

  const toutRafraichir = useCallback(() => {
    return Promise.all([rafraichirStatus(), rafraichirAlertes()]);
  }, [rafraichirStatus, rafraichirAlertes]);

  useEffect(() => {
    void toutRafraichir();
  }, [toutRafraichir]);

  useEffect(() => {
    void api.getWearer().then(setPorteur);
  }, []);

  const contactPrincipal = porteur?.emergencyContacts[0] ?? null;

  const appelerFamille = () => {
    if (contactPrincipal) void Linking.openURL(`tel:${contactPrincipal.phone}`);
  };

  const dateDuJour = new Intl.DateTimeFormat(i18n.language, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={chargementStatus}
            onRefresh={toutRafraichir}
            tintColor={COULEUR_ACCENT}
            colors={[COULEUR_ACCENT]}
          />
        }
      >
        <View className="flex-row items-start justify-between mt-3 mb-4">
          <View className="flex-1">
            <Text className="text-textSoft text-sm capitalize">{dateDuJour}</Text>
            <Text className="text-text text-2xl font-extrabold mt-0.5" numberOfLines={1}>
              {t("accueil.salutation", { nom: porteur?.fullName ?? "…" })}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={!alerte}
            onPress={() => {
              if (alerte) router.push(`/alert/${alerte.id}`);
            }}
            className="items-center justify-center rounded-full bg-surface border border-border"
            style={{ width: 44, height: 44 }}
          >
            <Ionicons name="notifications-outline" size={22} color={COULEURS.text} />
            {alerte ? (
              <View
                className="absolute rounded-full bg-critical"
                style={{ width: 10, height: 10, top: 8, right: 8 }}
              />
            ) : null}
          </Pressable>
        </View>

        {alerte ? <AlertBanner alerte={alerte} /> : null}

        {status ? (
          <>
            <StatusCard status={status} />

            <View className="flex-row flex-wrap mt-4" style={{ gap: 12 }}>
              <VitalCard
                icone="water"
                libelle={t("vitaux.spo2")}
                valeur={fmtNombre(status.spo2)}
                unite="%"
              />
              <VitalCard
                icone={iconeBatterie(status.battery)}
                libelle={t("vitaux.batterie")}
                valeur={fmtNombre(status.battery)}
                unite="%"
              />
              <VitalCard
                icone={horsLigne ? "cloud-offline-outline" : "wifi"}
                libelle={t("vitaux.connectivite")}
                valeur={t(horsLigne ? "vitaux.horsLigne" : "vitaux.enLigne")}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={appelerFamille}
              disabled={!contactPrincipal}
              className="flex-row items-center rounded-2xl bg-surface border border-border mt-4 px-4 py-4"
              style={{ gap: 12, minHeight: 44, opacity: contactPrincipal ? 1 : 0.5 }}
            >
              <View
                className="items-center justify-center rounded-full bg-primarySoft"
                style={{ width: 40, height: 40 }}
              >
                <Ionicons name="call" size={20} color={COULEURS.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-text text-base font-bold">
                  {t("accueil.appelerFamille")}
                </Text>
                {contactPrincipal ? (
                  <Text className="text-textSoft text-sm mt-0.5" numberOfLines={1}>
                    {t("accueil.contactPrioritaire", { nom: contactPrincipal.fullName })}
                  </Text>
                ) : null}
              </View>
              <Ionicons
                name={I18nManager.isRTL ? "chevron-back" : "chevron-forward"}
                size={20}
                color={COULEURS.textSoft}
              />
            </Pressable>
          </>
        ) : erreurStatus ? (
          <Text className="text-warn text-lg mt-2">{erreurStatus}</Text>
        ) : (
          <Text className="text-textSoft text-lg mt-2">{t("commun.chargement")}</Text>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
