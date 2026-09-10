/**
 * Layout racine : providers globaux, i18n, direction RTL, notifications push,
 * garde d'authentification.
 */
import "react-native-gesture-handler";
import "../../global.css";

import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { I18nextProvider } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import i18n from "@/i18n";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/store/useAuthStore";
// Import pour déclencher l'hydratation de la préférence de langue au démarrage.
import "@/store/usePreferencesStore";

/**
 * Redirige vers /login tant que l'utilisateur n'est pas connecté.
 * Attend la fin de l'hydratation du store persisté (AsyncStorage) avant de
 * décider, sinon une session valide serait redirigée par erreur le temps que
 * le jeton soit relu du disque.
 */
function GardeAuth() {
  const router = useRouter();
  const segments = useSegments();
  const [hydrate, setHydrate] = useState(() => useAuthStore.persist.hasHydrated());
  const estConnecte = useAuthStore((s) => s.estConnecte);

  useEffect(() => {
    if (hydrate) return;
    // L'hydratation (lecture d'AsyncStorage) démarre dès la création du
    // store, avant ce premier rendu : elle peut donc déjà être terminée ici
    // — sans ce re-check, l'abonnement arriverait après coup et ne serait
    // jamais notifié.
    if (useAuthStore.persist.hasHydrated()) {
      setHydrate(true);
      return;
    }
    return useAuthStore.persist.onFinishHydration(() => setHydrate(true));
  }, [hydrate]);

  useEffect(() => {
    if (!hydrate) return;
    const surEcranConnexion = segments[0] === "login" || segments[0] === "register";
    if (!estConnecte() && !surEcranConnexion) {
      router.replace("/login");
    }
  }, [hydrate, segments, estConnecte, router]);

  return null;
}

export default function RootLayout() {
  useNotifications();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18n}>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <GardeAuth />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen
              name="alert/[id]"
              options={{ presentation: "fullScreenModal", animation: "fade" }}
            />
            <Stack.Screen
              name="pairing"
              options={{ presentation: "modal" }}
            />
          </Stack>
        </SafeAreaProvider>
      </I18nextProvider>
    </GestureHandlerRootView>
  );
}
