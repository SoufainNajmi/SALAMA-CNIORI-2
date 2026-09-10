/**
 * Confirmation avant action destructive, cross-plateforme.
 * `Alert.alert` de react-native-web est un no-op (voir
 * node_modules/react-native-web/src/exports/Alert) — sans ce détour, aucune
 * confirmation ne s'affiche jamais sur web et l'action n'est donc jamais
 * déclenchée. Sur natif (iOS/Android), l'alerte native habituelle est gardée.
 */
import { Alert, Platform } from "react-native";

interface Options {
  titre: string;
  message?: string;
  labelAnnuler: string;
  labelConfirmer: string;
  onConfirmer: () => void;
}

export function confirmerAction({
  titre,
  message,
  labelAnnuler,
  labelConfirmer,
  onConfirmer,
}: Options) {
  if (Platform.OS === "web") {
    const texte = message ? `${titre}\n\n${message}` : titre;
    // eslint-disable-next-line no-alert
    if (window.confirm(texte)) onConfirmer();
    return;
  }

  Alert.alert(titre, message, [
    { text: labelAnnuler, style: "cancel" },
    { text: labelConfirmer, style: "destructive", onPress: onConfirmer },
  ]);
}
