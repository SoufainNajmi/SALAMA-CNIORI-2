/**
 * Écran Profil : profil médical du porteur (§3), + code d'invitation pour le
 * rôle meriid, + déconnexion. Contacts d'urgence / réglages famille restent
 * à venir.
 */
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/ScreenContainer";
import { InviteCodeCard } from "@/components/InviteCodeCard";
import { MedicalProfileSection } from "@/components/MedicalProfileSection";
import { COULEURS } from "@/theme/colors";
import { confirmerAction } from "@/lib/confirmer";
import { useAuthStore } from "@/store/useAuthStore";

export default function ProfilScreen() {
  const { t } = useTranslation();
  const role = useAuthStore((s) => s.role);
  const deconnecter = useAuthStore((s) => s.deconnecter);

  const confirmerDeconnexion = () => {
    confirmerAction({
      titre: t("profil.deconnexionConfirmationTitre"),
      labelAnnuler: t("commun.annuler"),
      labelConfirmer: t("profil.deconnexion"),
      onConfirmer: deconnecter,
    });
  };

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 32, flexGrow: 1 }}
      >
        <View style={{ gap: 16, flex: 1 }}>
          {role === "meriid" ? <InviteCodeCard /> : null}
          <MedicalProfileSection modifiable={role === "famille"} />

          <View
            className="items-center mt-8 pt-6"
            style={{ borderTopWidth: 1, borderTopColor: COULEURS.border }}
          >
            <Pressable
              accessibilityRole="button"
              onPress={confirmerDeconnexion}
              className="flex-row items-center justify-center rounded-xl px-5"
              style={{ minHeight: 44, gap: 8 }}
            >
              <Ionicons name="log-out-outline" size={18} color={COULEURS.critical} />
              <Text className="text-critical text-base font-semibold">
                {t("profil.deconnexion")}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
