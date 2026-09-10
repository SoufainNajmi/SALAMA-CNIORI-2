/** Petits utilitaires d'affichage. */

/** Nombre affichable, ou tiret si la mesure est absente. */
export function fmtNombre(n: number | null | undefined): string {
  return n === null || n === undefined ? "—" : String(n);
}

/** Âge en années révolues à partir d'une date de naissance "AAAA-MM-JJ". */
export function calculerAge(birthDate: string): number {
  const naissance = new Date(birthDate);
  const aujourdhui = new Date();
  let age = aujourdhui.getFullYear() - naissance.getFullYear();
  const pasEncoreAnniversaire =
    aujourdhui.getMonth() < naissance.getMonth() ||
    (aujourdhui.getMonth() === naissance.getMonth() &&
      aujourdhui.getDate() < naissance.getDate());
  if (pasEncoreAnniversaire) age -= 1;
  return age;
}

/** Initiales (1-2 lettres) à partir d'un nom complet, pour un avatar de repli. */
export function initiales(nomComplet: string): string {
  const mots = nomComplet.trim().split(/\s+/).filter(Boolean);
  if (mots.length === 0) return "";
  if (mots.length === 1) return mots[0].charAt(0).toUpperCase();
  return (mots[0].charAt(0) + mots[mots.length - 1].charAt(0)).toUpperCase();
}
