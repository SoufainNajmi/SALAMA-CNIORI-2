/** Carte "code d'invitation famille" — écran profil, rôle meriid uniquement. */
import { useEffect, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { COULEURS } from "@/theme/colors";
import { api } from "@/services/api";
import { confirmerAction } from "@/lib/confirmer";

export function InviteCodeCard() {
  const { t } = useTranslation();
  const [code, setCode] = useState<string | null>(null);
  const [regeneration, setRegeneration] = useState(false);
  const [copie, setCopie] = useState(false);

  useEffect(() => {
    void api.getInviteCode().then((r) => setCode(r.inviteCode));
  }, []);

  const copier = async () => {
    if (!code) return;
    await Clipboard.setStringAsync(code);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  };

  const regenerer = () => {
    confirmerAction({
      titre: t("profil.regenererConfirmationTitre"),
      message: t("profil.regenererConfirmationMessage"),
      labelAnnuler: t("profil.regenererConfirmationAnnuler"),
      labelConfirmer: t("profil.regenererConfirmationConfirmer"),
      onConfirmer: async () => {
        setRegeneration(true);
        try {
          const r = await api.regenerateInviteCode();
          setCode(r.inviteCode);
        } finally {
          setRegeneration(false);
        }
      },
    });
  };

  return (
    <View className="rounded-2xl bg-surface border border-border p-4" style={{ gap: 12 }}>
      <View className="flex-row items-center" style={{ gap: 8 }}>
        <Ionicons name="key-outline" size={18} color={COULEURS.primary} />
        <Text className="text-text text-base font-bold">
          {t("profil.codeInvitationTitre")}
        </Text>
      </View>

      <View className="items-center justify-center rounded-xl bg-primarySoft py-4">
        <Text
          className="text-primary text-3xl font-extrabold"
          style={{ fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", letterSpacing: 4 }}
        >
          {code ?? "…"}
        </Text>
      </View>

      <Text className="text-textSoft text-sm">{t("profil.codeInvitationAide")}</Text>

      <View className="flex-row" style={{ gap: 12 }}>
        <Pressable
          accessibilityRole="button"
          onPress={copier}
          disabled={!code}
          className="flex-1 flex-row items-center justify-center rounded-xl bg-primarySoft py-3"
          style={{ minHeight: 44, gap: 6 }}
        >
          <Ionicons name="copy-outline" size={18} color={COULEURS.primary} />
          <Text className="text-primary text-sm font-bold">
            {copie ? t("profil.copie") : t("profil.copier")}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={regenerer}
          disabled={!code || regeneration}
          className="flex-1 flex-row items-center justify-center rounded-xl border border-border py-3"
          style={{ minHeight: 44, gap: 6, opacity: regeneration ? 0.5 : 1 }}
        >
          <Ionicons name="refresh-outline" size={18} color={COULEURS.text} />
          <Text className="text-text text-sm font-bold">{t("profil.regenererCode")}</Text>
        </Pressable>
      </View>
    </View>
  );
}
