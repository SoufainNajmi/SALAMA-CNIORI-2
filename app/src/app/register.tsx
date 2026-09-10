/** Écran de création de compte : rôle + infos + code d'invitation (famille). */
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { ScreenContainer } from "@/components/ScreenContainer";
import { PasswordInput } from "@/components/PasswordInput";
import { RoleSelector } from "@/components/RoleSelector";
import { COULEURS } from "@/theme/colors";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import type { Role } from "@/types/api";
import { messageErreur } from "@/lib/erreurs";

export default function InscriptionScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const seConnecter = useAuthStore((s) => s.seConnecter);

  const [role, setRole] = useState<Role>("meriid");
  const [nomComplet, setNomComplet] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [codeInvitation, setCodeInvitation] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const champsCommunsValides =
    nomComplet.trim().length > 0 &&
    telephone.trim().length > 0 &&
    motDePasse.length > 0;
  const codeRequisEtValide = role === "meriid" || codeInvitation.trim().length > 0;
  const champsValides = champsCommunsValides && codeRequisEtValide;

  const onCreerCompte = async () => {
    if (!champsValides || envoi) return;
    if (motDePasse !== confirmation) {
      setErreur(t("inscription.erreurMotDePasse"));
      return;
    }
    setEnvoi(true);
    setErreur(null);
    try {
      const reponse = await api.register({
        fullName: nomComplet.trim(),
        phone: telephone.trim(),
        password: motDePasse,
        role,
        inviteCode: role === "famille" ? codeInvitation.trim() : undefined,
      });
      seConnecter(reponse.token, reponse.expiresAt, reponse.role);
      router.replace("/");
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setEnvoi(false);
    }
  };

  const retourConnexion = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/login");
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingVertical: 24 }}
        >
          <Text className="text-text text-3xl font-extrabold text-center mb-6">
            {t("inscription.titre")}
          </Text>

          <View style={{ gap: 16 }}>
            <RoleSelector
              valeur={role}
              onChange={setRole}
              libelleMeriid={t("connexion.roleMeriid")}
              libelleFamille={t("connexion.roleFamille")}
            />

            <TextInput
              value={nomComplet}
              onChangeText={setNomComplet}
              placeholder={t("inscription.nomComplet")}
              placeholderTextColor={COULEURS.textSoft}
              autoCorrect={false}
              className="rounded-2xl bg-surface border border-border px-4 text-text text-base"
              style={{ minHeight: 44, paddingVertical: 14 }}
            />

            <TextInput
              value={telephone}
              onChangeText={setTelephone}
              placeholder={t("connexion.telephone")}
              placeholderTextColor={COULEURS.textSoft}
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
              className="rounded-2xl bg-surface border border-border px-4 text-text text-base"
              style={{ minHeight: 44, paddingVertical: 14 }}
            />

            <PasswordInput
              valeur={motDePasse}
              onChangeText={setMotDePasse}
              placeholder={t("connexion.motDePasse")}
            />

            <PasswordInput
              valeur={confirmation}
              onChangeText={setConfirmation}
              placeholder={t("inscription.confirmerMotDePasse")}
            />

            {role === "famille" ? (
              <View style={{ gap: 6 }}>
                <TextInput
                  value={codeInvitation}
                  onChangeText={setCodeInvitation}
                  placeholder={t("inscription.codeInvitation")}
                  placeholderTextColor={COULEURS.textSoft}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  className="rounded-2xl bg-surface border border-border px-4 text-text text-base"
                  style={{ minHeight: 44, paddingVertical: 14 }}
                />
                <Text className="text-textSoft text-sm">
                  {t("inscription.codeInvitationAide")}
                </Text>
              </View>
            ) : null}

            {erreur ? <Text className="text-critical text-sm">{erreur}</Text> : null}

            <Pressable
              accessibilityRole="button"
              onPress={onCreerCompte}
              disabled={!champsValides || envoi}
              className="items-center justify-center rounded-2xl bg-primary py-4"
              style={{ minHeight: 44, opacity: champsValides ? 1 : 0.5 }}
            >
              <Text className="text-white text-lg font-bold">
                {t("inscription.creerCompte")}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={retourConnexion}
              className="flex-row items-center justify-center flex-wrap"
              style={{ minHeight: 44, gap: 4 }}
            >
              <Text className="text-textSoft text-base">{t("inscription.dejaCompte")}</Text>
              <Text className="text-primary text-base font-semibold">
                {t("inscription.seConnecter")}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
