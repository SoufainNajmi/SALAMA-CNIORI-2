/** Simule la latence réseau pour rendre les écrans réalistes en développement. */
export function delaiSimule<T>(valeur: T, ms = 600): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(valeur), ms);
  });
}
