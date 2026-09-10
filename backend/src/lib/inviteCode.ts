/** Génère un code d'invitation lisible (sans caractères ambigus 0/O, 1/I/L). */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function genererCodeInvitation(longueur = 8): string {
  let code = "";
  for (let i = 0; i < longueur; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}
