# SALAMA — Application mobile (famille)

Application destinée à la **famille** d'une personne âgée portant le bracelet
SALAMA. Elle affiche l'état de santé du porteur, reçoit les alertes de chute et
montre l'historique. La personne âgée n'utilise pas cette application.

## Stack

- Expo (SDK ~52) + Expo Router (routes dans `src/app/`)
- NativeWind v4 (aucun `StyleSheet.create`)
- Zustand (état global), Axios (API)
- i18next + expo-localization (arabe RTL par défaut, anglais LTR)
- expo-notifications (notifications push d'alerte)

## Démarrage

```bash
cd app
npm install
npx expo install --fix   # aligne les versions natives sur le SDK installé
cp .env.example .env      # laisser EXPO_PUBLIC_API_URL vide pour l'instant
npx expo start
```

L'app tourne **entièrement sur des données mockées** tant que le backend
n'existe pas. Rien à configurer pour la démo.

## Données : mock ou backend réel

Un seul point de bascule : `src/services/config.ts` → `USE_MOCKS`.

- `USE_MOCKS = true` (défaut) : `src/services/mock/`, aucun réseau.
- `USE_MOCKS = false` : appels réels via Axios, `EXPO_PUBLIC_API_URL` requis.

Aucun composant, store ou écran ne connaît ce drapeau : tout passe par la
façade `api` (`src/services/api.ts`).

## Contrat API

`src/types/api.ts` est la **source de vérité** partagée avec le développeur
backend (endpoints, formes de données, en-têtes, notifications push, ingestion
des mesures). Fichier autonome et commenté, à transmettre tel quel.

## État d'avancement

| Écran | État |
|---|---|
| Accueil (`(tabs)/index.tsx`) | ✅ carte d'état + bandeau d'alerte + pull-to-refresh |
| Historique (`(tabs)/history.tsx`) | ⬜ placeholder |
| Profil (`(tabs)/profile.tsx`) | ⬜ placeholder |
| Alerte plein écran (`alert/[id].tsx`) | ✅ affichage + accusé de réception |
| Appairage (`pairing.tsx`) | ⬜ vide (BLE non implémenté) |

## Points à finaliser (hors code applicatif)

- `eas init` puis renseigner `extra.eas.projectId` dans `app.json`
  (nécessaire pour obtenir les jetons Expo Push).
- Icônes / splash / icône de notification (`app.json`).
