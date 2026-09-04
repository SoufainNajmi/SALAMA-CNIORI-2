/**
 * Notifications push (Expo Push).
 *
 * - Enregistre le jeton de l'appareil auprès du backend (POST /api/devices).
 * - Ouvre l'écran d'alerte plein écran quand l'utilisateur tape une
 *   notification (lecture de `alertId` dans la charge utile).
 *
 * Échec silencieux : l'app reste utilisable sans notifications (utile en
 * développement, sur simulateur, ou tant que le projet EAS n'existe pas).
 */
import { useEffect } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";

import type { PushNotificationData } from "@/types/api";
import { api } from "@/services/api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function enregistrerAppareil(): Promise<void> {
  const existant = await Notifications.getPermissionsAsync();
  let accorde = existant.granted;

  if (!accorde && existant.canAskAgain) {
    const demande = await Notifications.requestPermissionsAsync();
    accorde = demande.granted;
  }
  if (!accorde) return;

  // getExpoPushTokenAsync exige un projectId EAS (app.json -> extra.eas.projectId).
  // TODO: créer le projet EAS ('eas init') puis renseigner ce champ.
  const jeton = await Notifications.getExpoPushTokenAsync();

  await api.registerDevice({
    expoPushToken: jeton.data,
    platform: Platform.OS === "ios" ? "ios" : "android",
  });
}

/** Hook à monter une seule fois, dans le layout racine. */
export function useNotifications(): void {
  const router = useRouter();

  useEffect(() => {
    enregistrerAppareil().catch(() => {
      // silencieux : pas de push, mais l'app fonctionne
    });
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((reponse) => {
      const data = reponse.notification.request.content
        .data as Partial<PushNotificationData>;
      if (data?.alertId) {
        router.push(`/alert/${data.alertId}`);
      }
    });
    return () => sub.remove();
  }, [router]);
}
