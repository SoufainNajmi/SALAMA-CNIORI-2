/**
 * Layout racine : providers globaux, i18n, direction RTL, notifications push.
 */
import "react-native-gesture-handler";
import "../../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { I18nextProvider } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import i18n from "@/i18n";
import { useNotifications } from "@/lib/notifications";
// Import pour déclencher l'hydratation de la préférence de langue au démarrage.
import "@/store/usePreferencesStore";

export default function RootLayout() {
  useNotifications();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18n}>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
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
