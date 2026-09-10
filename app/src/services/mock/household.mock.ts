import AsyncStorage from "@react-native-async-storage/async-storage";

import { genererCodeInvitation } from "@/lib/inviteCode";

/**
 * État factice d'un household (celui du porteur démo), persisté via
 * AsyncStorage : sans backend réel, un simple module en mémoire perdrait le
 * code à chaque rechargement de page — ce qui casserait le flow "meriid
 * s'inscrit puis famille rejoint avec le code" dès qu'on rafraîchit l'app.
 */
const CLE_STOCKAGE = "salama-mock-invite-code";

let codeEnMemoire: string | null = null;
const codesDejaEmis = new Set<string>();

async function codeActuel(): Promise<string> {
  if (codeEnMemoire) return codeEnMemoire;
  const stocke = await AsyncStorage.getItem(CLE_STOCKAGE);
  const code = stocke ?? genererCodeInvitation();
  if (!stocke) await AsyncStorage.setItem(CLE_STOCKAGE, code);
  codeEnMemoire = code;
  codesDejaEmis.add(code);
  return code;
}

export async function inviteCodeMock(): Promise<{ inviteCode: string }> {
  return { inviteCode: await codeActuel() };
}

export async function regenererInviteCodeMock(): Promise<{ inviteCode: string }> {
  const ancien = codeEnMemoire;
  const nouveau = genererCodeInvitation();
  await AsyncStorage.setItem(CLE_STOCKAGE, nouveau);
  if (ancien) codesDejaEmis.delete(ancien);
  codeEnMemoire = nouveau;
  codesDejaEmis.add(nouveau);
  return { inviteCode: nouveau };
}

export async function codeInvitationValideMock(code: string): Promise<boolean> {
  await codeActuel();
  return codesDejaEmis.has(code.trim().toUpperCase());
}
