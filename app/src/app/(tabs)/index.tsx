/**
 * Écran d'accueil.
 * - Bandeau d'alerte en haut si une alerte n'est pas acquittée.
 * - Grande carte d'état colorée (FC, SpO2, batterie, dernière synchro).
 * - Pull-to-refresh (recharge statut + alertes).
 */
import { useCallback, useEffect } from "react";
import { RefreshControl, ScrollView, Text } from "react-native";
import { useTranslation } from "react-i18next";

import { AlertBanner } from "@/components/AlertBanner";
import { ScreenContainer } from "@/components/ScreenContainer";
import { StatusCard } from "@/components/StatusCard";
import { COULEUR_ACCENT } from "@/theme/colors";
import { useStatusStore } from "@/store/useStatusStore";
import { selectAlerteNonAcquittee, useAlertsStore } from "@/store/useAlertsStore";

export default function AccueilScreen() {
  const { t } = useTranslation();

  const status = useStatusStore((s) => s.status);
  const chargementStatus = useStatusStore((s) => s.chargement);
  const erreurStatus = useStatusStore((s) => s.erreur);
  const rafraichirStatus = useStatusStore((s) => s.rafraichir);

  const rafraichirAlertes = useAlertsStore((s) => s.rafraichir);
  const alerte = useAlertsStore(selectAlerteNonAcquittee);

  const toutRafraichir = useCallback(() => {
    return Promise.all([rafraichirStatus(), rafraichirAlertes()]);
  }, [rafraichirStatus, rafraichirAlertes]);

  useEffect(() => {
    void toutRafraichir();
  }, [toutRafraichir]);

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
        <Text className="text-3xl font-extrabold text-neutral-900 mt-3 mb-4">
          {t("accueil.titre")}
        </Text>

        {alerte ? <AlertBanner alerte={alerte} /> : null}

        {status ? (
          <StatusCard status={status} />
        ) : erreurStatus ? (
          <Text className="text-etat-alert text-lg mt-2">{erreurStatus}</Text>
        ) : (
          <Text className="text-neutral-500 text-lg mt-2">
            {t("commun.chargement")}
          </Text>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
