/**
 * Configuration Tailwind / NativeWind.
 *
 * Design tokens couleur — garder synchronisés avec src/theme/colors.ts.
 * Le rouge (`critical`) est réservé à l'état SOS actif : ne pas l'utiliser
 * comme couleur d'accent ou de branding ailleurs dans l'app.
 *
 * Les couleurs d'état (`etat.ok` / `etat.warning` / `etat.alert`, utilisées
 * par `bg-etat-alert` etc.) référencent ces mêmes tokens pour rester
 * cohérentes.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  // L'app est en thème clair uniquement (app.json -> userInterfaceStyle: "light").
  // `class` évite un crash de NativeWind sur le web : en mode "media", son
  // observateur de thème lève « Cannot manually set color scheme ». Aucun impact
  // visuel (aucune classe `dark:` utilisée).
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#1e3a5f",
        primaryLight: "#3b6ea5",
        primarySoft: "#e8eef5",
        bg: "#f7f9fb",
        surface: "#ffffff",
        text: "#1a2332",
        textSoft: "#64748b",
        border: "#e2e8f0",
        ok: "#0d9488",
        okSoft: "#e6f5f3",
        warn: "#d97706",
        warnSoft: "#fef3e2",
        critical: "#dc2626",
        criticalSoft: "#fdeaea",
        etat: {
          ok: "#0d9488",
          warning: "#d97706",
          alert: "#dc2626",
        },
      },
    },
  },
  plugins: [],
};
