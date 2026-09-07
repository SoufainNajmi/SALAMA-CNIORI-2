/**
 * Configuration Tailwind / NativeWind.
 * Les couleurs d'état (`etat.ok` / `etat.warning` / `etat.alert`) sont
 * référencées à la fois par des classes (`bg-etat-alert`) et par le thème JS
 * (src/theme/colors.ts) — garder les deux synchronisés.
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
        etat: {
          ok: "#15803d",
          warning: "#c2410c",
          alert: "#b91c1c",
        },
      },
    },
  },
  plugins: [],
};
