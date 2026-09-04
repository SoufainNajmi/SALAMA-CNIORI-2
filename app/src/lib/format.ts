/** Petits utilitaires d'affichage. */

/** Nombre affichable, ou tiret si la mesure est absente. */
export function fmtNombre(n: number | null | undefined): string {
  return n === null || n === undefined ? "—" : String(n);
}
