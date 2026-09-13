/**
 * Modale d'ajout/édition d'un traitement : condition, nom du médicament, et
 * une liste dynamique d'horaires (heure "HH:MM" saisie en texte + moment de
 * la journée choisi explicitement — aucun seuil matin/midi/soir n'est déduit
 * de l'heure, voir CLAUDE.md).
 * Distincte de `FormModal` (générique, champs texte uniquement) car la
 * liste d'horaires ajout/suppression ne rentre pas dans ce contrat.
 */
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { COULEURS } from "@/theme/colors";
import type { MedicationTimeInput, MedicationTimeLabel } from "@/types/api";

const LABELS: MedicationTimeLabel[] = ["matin", "midi", "soir", "autre"];
const REGEX_HEURE = /^([01]\d|2[0-3]):([0-5]\d)$/;
const REGEX_DATE = /^\d{4}-\d{2}-\d{2}$/;

export interface ValeursMedicament {
  conditionLabel: string;
  name: string;
  dose: string | null;
  instructions: string | null;
  notes: string | null;
  startDate: string | null;
  endDate: string | null;
  times: MedicationTimeInput[];
}

interface Props {
  visible: boolean;
  titre: string;
  libelleValider: string;
  valeurInitiale?: ValeursMedicament;
  enTraitement?: boolean;
  onAnnuler: () => void;
  onValider: (valeurs: ValeursMedicament) => void;
}

const HORAIRE_VIDE: MedicationTimeInput = { timeOfDay: "", label: "matin" };

export function MedicationFormModal({
  visible,
  titre,
  libelleValider,
  valeurInitiale,
  enTraitement = false,
  onAnnuler,
  onValider,
}: Props) {
  const { t } = useTranslation();
  const [conditionLabel, setConditionLabel] = useState("");
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [instructions, setInstructions] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [times, setTimes] = useState<MedicationTimeInput[]>([HORAIRE_VIDE]);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setConditionLabel(valeurInitiale?.conditionLabel ?? "");
    setName(valeurInitiale?.name ?? "");
    setDose(valeurInitiale?.dose ?? "");
    setInstructions(valeurInitiale?.instructions ?? "");
    setNotes(valeurInitiale?.notes ?? "");
    setStartDate(valeurInitiale?.startDate ?? "");
    setEndDate(valeurInitiale?.endDate ?? "");
    setTimes(valeurInitiale?.times?.length ? valeurInitiale.times.map((h) => ({ ...h })) : [{ ...HORAIRE_VIDE }]);
    setErreur(null);
    // Ne réinitialiser qu'à l'ouverture, pas à chaque frappe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const majHoraire = (index: number, patch: Partial<MedicationTimeInput>) => {
    setTimes((liste) => liste.map((h, i) => (i === index ? { ...h, ...patch } : h)));
  };

  const ajouterHoraire = () => setTimes((liste) => [...liste, { ...HORAIRE_VIDE }]);

  const retirerHoraire = (index: number) =>
    setTimes((liste) => (liste.length > 1 ? liste.filter((_, i) => i !== index) : liste));

  const valider = () => {
    if (!conditionLabel.trim() || !name.trim()) {
      setErreur(t("medicaments.erreurChampsObligatoires"));
      return;
    }
    if (times.some((h) => !REGEX_HEURE.test(h.timeOfDay.trim()))) {
      setErreur(t("medicaments.erreurHoraireInvalide"));
      return;
    }
    const debut = startDate.trim();
    const fin = endDate.trim();
    if (debut && !REGEX_DATE.test(debut)) {
      setErreur(t("medicaments.erreurDateInvalide"));
      return;
    }
    if (fin && !REGEX_DATE.test(fin)) {
      setErreur(t("medicaments.erreurDateInvalide"));
      return;
    }
    if (debut && fin && fin < debut) {
      setErreur(t("medicaments.erreurDateOrdre"));
      return;
    }
    setErreur(null);
    onValider({
      conditionLabel: conditionLabel.trim(),
      name: name.trim(),
      dose: dose.trim() || null,
      instructions: instructions.trim() || null,
      notes: notes.trim() || null,
      startDate: debut || null,
      endDate: fin || null,
      times: times.map((h) => ({ timeOfDay: h.timeOfDay.trim(), label: h.label })),
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onAnnuler}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View className="w-full rounded-2xl bg-surface p-5" style={{ gap: 12, maxHeight: "85%" }}>
          <Text className="text-text text-lg font-bold">{titre}</Text>

          <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
            <View style={{ gap: 12 }}>
              <View style={{ gap: 4 }}>
                <Text className="text-textSoft text-sm">{t("medicaments.champCondition")}</Text>
                <TextInput
                  value={conditionLabel}
                  onChangeText={setConditionLabel}
                  className="rounded-xl bg-bg border border-border px-3 py-2.5 text-text text-base"
                  style={{ minHeight: 44 }}
                />
              </View>

              <View style={{ gap: 4 }}>
                <Text className="text-textSoft text-sm">{t("medicaments.champMedicament")}</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  className="rounded-xl bg-bg border border-border px-3 py-2.5 text-text text-base"
                  style={{ minHeight: 44 }}
                />
              </View>

              <View className="flex-row" style={{ gap: 12 }}>
                <View className="flex-1" style={{ gap: 4 }}>
                  <Text className="text-textSoft text-sm">{t("medicaments.champDose")}</Text>
                  <TextInput
                    value={dose}
                    onChangeText={setDose}
                    className="rounded-xl bg-bg border border-border px-3 py-2.5 text-text text-base"
                    style={{ minHeight: 44 }}
                  />
                </View>
                <View className="flex-1" style={{ gap: 4 }}>
                  <Text className="text-textSoft text-sm">{t("medicaments.champInstructions")}</Text>
                  <TextInput
                    value={instructions}
                    onChangeText={setInstructions}
                    placeholder={t("medicaments.instructionsPlaceholder")}
                    placeholderTextColor={COULEURS.textSoft}
                    className="rounded-xl bg-bg border border-border px-3 py-2.5 text-text text-base"
                    style={{ minHeight: 44 }}
                  />
                </View>
              </View>

              <View style={{ gap: 4 }}>
                <Text className="text-textSoft text-sm">{t("medicaments.champNotes")}</Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  className="rounded-xl bg-bg border border-border px-3 py-2.5 text-text text-base"
                  style={{ minHeight: 80, textAlignVertical: "top" }}
                />
              </View>

              <View className="flex-row" style={{ gap: 12 }}>
                <View className="flex-1" style={{ gap: 4 }}>
                  <Text className="text-textSoft text-sm">{t("medicaments.champDateDebut")}</Text>
                  <TextInput
                    value={startDate}
                    onChangeText={setStartDate}
                    placeholder={t("medicaments.datePlaceholder")}
                    placeholderTextColor={COULEURS.textSoft}
                    keyboardType="numbers-and-punctuation"
                    className="rounded-xl bg-bg border border-border px-3 py-2.5 text-text text-base"
                    style={{ minHeight: 44 }}
                  />
                </View>
                <View className="flex-1" style={{ gap: 4 }}>
                  <Text className="text-textSoft text-sm">{t("medicaments.champDateFin")}</Text>
                  <TextInput
                    value={endDate}
                    onChangeText={setEndDate}
                    placeholder={t("medicaments.datePlaceholder")}
                    placeholderTextColor={COULEURS.textSoft}
                    keyboardType="numbers-and-punctuation"
                    className="rounded-xl bg-bg border border-border px-3 py-2.5 text-text text-base"
                    style={{ minHeight: 44 }}
                  />
                </View>
              </View>

              <View style={{ gap: 8 }}>
                <Text className="text-textSoft text-sm">{t("medicaments.horairesTitre")}</Text>
                {times.map((horaire, index) => (
                  <View
                    key={index}
                    className="rounded-xl bg-bg border border-border p-3"
                    style={{ gap: 8 }}
                  >
                    <View className="flex-row items-center" style={{ gap: 8 }}>
                      <TextInput
                        value={horaire.timeOfDay}
                        onChangeText={(texte) => majHoraire(index, { timeOfDay: texte })}
                        placeholder={t("medicaments.horairePlaceholder")}
                        placeholderTextColor={COULEURS.textSoft}
                        keyboardType="numbers-and-punctuation"
                        className="flex-1 rounded-xl bg-surface border border-border px-3 py-2.5 text-text text-base"
                        style={{ minHeight: 44 }}
                      />
                      {times.length > 1 ? (
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => retirerHoraire(index)}
                          hitSlop={8}
                          style={{ minWidth: 36, minHeight: 36, alignItems: "center", justifyContent: "center" }}
                        >
                          <Ionicons name="close-circle-outline" size={20} color={COULEURS.textSoft} />
                        </Pressable>
                      ) : null}
                    </View>

                    <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                      {LABELS.map((label) => {
                        const actif = horaire.label === label;
                        return (
                          <Pressable
                            key={label}
                            accessibilityRole="button"
                            accessibilityState={{ selected: actif }}
                            onPress={() => majHoraire(index, { label })}
                            className={`rounded-full px-3 py-1.5 ${actif ? "bg-primary" : "bg-surface border border-border"}`}
                            style={{ minHeight: 32 }}
                          >
                            <Text className={`text-xs font-bold ${actif ? "text-white" : "text-textSoft"}`}>
                              {t(`medicaments.horaireLabel.${label}`)}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ))}

                <Pressable
                  accessibilityRole="button"
                  onPress={ajouterHoraire}
                  className="rounded-full border border-border px-4 py-2 self-start"
                  style={{ minHeight: 36 }}
                >
                  <Text className="text-primary text-sm font-bold">{t("medicaments.ajouterHoraire")}</Text>
                </Pressable>
              </View>

              {erreur ? <Text className="text-critical text-sm">{erreur}</Text> : null}
            </View>
          </ScrollView>

          <View className="flex-row justify-end mt-2" style={{ gap: 12 }}>
            <Pressable
              accessibilityRole="button"
              onPress={onAnnuler}
              disabled={enTraitement}
              className="items-center justify-center px-4"
              style={{ minHeight: 44 }}
            >
              <Text className="text-textSoft text-base font-semibold">{t("commun.annuler")}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={valider}
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
