/** Modale de formulaire simple (1-2 champs texte) — ajout/édition. */
import { useEffect, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";

interface Champ {
  cle: string;
  libelle: string;
  valeurInitiale?: string;
  multiligne?: boolean;
}

interface Props {
  visible: boolean;
  titre: string;
  champs: Champ[];
  libelleValider: string;
  /** Désactive les actions pendant qu'une soumission est en cours (anti double-tap). */
  enTraitement?: boolean;
  onAnnuler: () => void;
  onValider: (valeurs: Record<string, string>) => void;
}

export function FormModal({
  visible,
  titre,
  champs,
  libelleValider,
  enTraitement = false,
  onAnnuler,
  onValider,
}: Props) {
  const { t } = useTranslation();
  const [valeurs, setValeurs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      setValeurs(Object.fromEntries(champs.map((c) => [c.cle, c.valeurInitiale ?? ""])));
    }
    // Ne réinitialiser qu'à l'ouverture, pas à chaque frappe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onAnnuler}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View className="w-full rounded-2xl bg-surface p-5" style={{ gap: 12 }}>
          <Text className="text-text text-lg font-bold">{titre}</Text>

          {champs.map((champ) => (
            <View key={champ.cle} style={{ gap: 4 }}>
              <Text className="text-textSoft text-sm">{champ.libelle}</Text>
              <TextInput
                value={valeurs[champ.cle] ?? ""}
                onChangeText={(texte) => setValeurs((v) => ({ ...v, [champ.cle]: texte }))}
                multiline={champ.multiligne}
                className="rounded-xl bg-bg border border-border px-3 py-2.5 text-text text-base"
                style={{
                  minHeight: champ.multiligne ? 80 : 44,
                  textAlignVertical: champ.multiligne ? "top" : "center",
                }}
              />
            </View>
          ))}

          <View className="flex-row justify-end mt-2" style={{ gap: 12 }}>
            <Pressable
              accessibilityRole="button"
              onPress={onAnnuler}
              disabled={enTraitement}
              className="items-center justify-center px-4"
              style={{ minHeight: 44 }}
            >
              <Text className="text-textSoft text-base font-semibold">
                {t("commun.annuler")}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => onValider(valeurs)}
              disabled={enTraitement}
              className="items-center justify-center rounded-xl bg-primary px-5"
              style={{ minHeight: 44, opacity: enTraitement ? 0.6 : 1 }}
            >
              <Text className="text-white text-base font-bold">{libelleValider}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
