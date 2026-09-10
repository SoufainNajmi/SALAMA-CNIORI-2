/** Écran de connexion : rôle + téléphone + mot de passe. */
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
import { Ionicons } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/ScreenContainer";
import { PasswordInput } from "@/components/PasswordInput";
import { RoleSelector } from "@/components/RoleSelector";
import { COULEURS } from "@/theme/colors";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import type { Role } from "@/types/api";
import { messageErreur } from "@/lib/erreurs";

export default function ConnexionScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const seConnecter = useAuthStore((s) => s.seConnecter);

  const [role, setRole] = useState<Role>("famille");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const champsValides = telephone.trim().length > 0 && motDePasse.length > 0;

  const onSeConnecter = async () => {
    if (!champsValides || envoi) return;
    setEnvoi(true);
    setErreur(null);
    try {
      const reponse = await api.login({
        phone: telephone.trim(),
        password: motDePasse,
      });
      // Le rôle qui fait foi est celui renvoyé par le serveur, pas le choix
      // local (qui ne sert qu'à présélectionner le sélecteur).
      seConnecter(reponse.token, reponse.expiresAt, reponse.role ?? role);
      router.replace("/");
    } catch (e) {
      setErreur(messageErreur(e) || t("connexion.erreur"));
    } finally {
      setEnvoi(false);
    }
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
          <View className="items-center mb-8">
            <View
              className="items-center justify-center rounded-full bg-primarySoft mb-4"
              style={{ width: 64, height: 64 }}
            >
              <Ionicons name="pulse" size={32} color={COULEURS.primary} />
            </View>
            <Text className="text-text text-3xl font-extrabold">SALAMA</Text>
            <Text className="text-textSoft text-base mt-1 text-center">
              {t("connexion.sousTitre")}
            </Text>
          </View>

          <View style={{ gap: 16 }}>
            <RoleSelector
              valeur={role}
              onChange={setRole}
              libelleMeriid={t("connexion.roleMeriid")}
              libelleFamille={t("connexion.roleFamille")}
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

            {erreur ? <Text className="text-critical text-sm">{erreur}</Text> : null}

            <Pressable accessibilityRole="button" className="self-end">
              <Text className="text-primary text-sm font-semibold">
                {t("connexion.motDePasseOublie")}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={onSeConnecter}
              disabled={!champsValides || envoi}
              className="items-center justify-center rounded-2xl bg-primary py-4"
              style={{ minHeight: 44, opacity: champsValides ? 1 : 0.5 }}
            >
              <Text className="text-white text-lg font-bold">
                {t("connexion.seConnecter")}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/register")}
              className="items-center py-2"
              style={{ minHeight: 44, justifyContent: "center" }}
            >
              <Text className="text-primary text-base font-semibold">
                {t("connexion.creerCompte")}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
