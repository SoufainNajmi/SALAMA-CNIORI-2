# SALAMA — Design System & Écran Accueil : spécification complète

Ce document est self-contained. Donne-le tel quel à Claude Code — pas besoin de contexte additionnel.

---

## 0. Décision : langue par défaut

**Langue par défaut de l'app = Arabe (AR)**, avec fallback FR si une clé manque.
Raison : public cible = personnes âgées marocaines, l'arabe est plus naturel à lire que le français pour cette tranche d'âge. FR reste disponible comme langue secondaire, EN ne doit JAMAIS être utilisé — retire tout fallback vers l'anglais dans le provider i18n.

Action : vérifie `i18n/index.ts` (ou équivalent) — le `defaultLocale` ou `fallbackLng` doit être `"ar"`, pas `"en"`. Vérifie aussi que TOUTES les clés utilisées dans `(tabs)/index.tsx` existent dans `ar.json` ET `fr.json` (pas seulement une des deux) — c'est la cause probable du bug "Hello, فاطمة بناني" (clé manquante en AR → fallback EN pour ce mot précis).

---

## 1. Design tokens (déjà appliqués en Étape 1 — pour référence uniquement, ne pas retoucher)

```
primary:      #1e3a5f
primaryLight: #3b6ea5
primarySoft:  #e8eef5
bg:           #f7f9fb
surface:      #ffffff
text:         #1a2332
textSoft:     #64748b
border:       #e2e8f0
ok:           #0d9488
okSoft:       #e6f5f3
warn:         #d97706
warnSoft:     #fef3e2
critical:     #dc2626   (réservé UNIQUEMENT à l'alerte SOS active)
criticalSoft: #fdeaea
```

---

## 2. Écran Accueil — structure exacte à produire

Ordre vertical, un seul ScrollView :

### 2.1 Header
- Ligne 1 : date complète, petit texte gris (`textSoft`), ex. "Mercredi 9 septembre" / "الأربعاء ٩ سبتمبر"
- Ligne 2 : "Bonjour, [Prénom]" / "مرحبا، [الاسم]" — **une seule langue à la fois, jamais mélangée**
- Icône cloche en haut à droite, badge rouge si notification non lue

### 2.2 Hero card (carte de statut principal)
- Fond : `primary` si tout va bien, `warn` si attention, jamais `critical` ici (critical = écran alerte dédié)
- Contenu, dans cet ordre :
  1. Pill de statut ("Tout va bien" / "Nécessite attention") en haut
  2. "Dernière synchro il y a X min" — **texte seul, PAS une carte, PAS dans la grille**
  3. UN SEUL vital en grand (le plus important — fréquence cardiaque), format : grand chiffre + unité
- Ce vital ne doit PAS être répété dans la grille en dessous

### 2.3 Grille 2x2 de vitals (les AUTRES métriques uniquement)
- Doit contenir les métriques qui ne sont PAS déjà dans la hero card
- Exemple correct : Oxygène sanguin, Batterie bracelet, Activité/Mouvement, Portée bracelet
- Ne jamais inclure "Last sync" comme carte — c'est une métadonnée, pas un vital
- Chaque carte : icône (fond `primarySoft`, icône `primary`), valeur en grand, label en dessous

### 2.4 Bouton CTA "Appeler famille"
- Obligatoire, sous la grille — actuellement absent du build, à ajouter
- Icône téléphone + texte principal + sous-texte "Contact prioritaire : [Nom]"
- Style : carte cliquable pleine largeur, fond `surface`, bordure `border`, chevron à droite

---

## 3. Composants réutilisables requis

Si absents dans `app/src/components/`, les créer :
- `StatusPill` — props: `tone: "ok" | "warn" | "crit"`, `children`
- `VitalCard` — props: `icon`, `label`, `value`, `unit`, `tone`

---

## 4. Bugs actuels à corriger (build testé aujourd'hui)

1. **Duplication** : "Heart rate 88 bpm" apparaît dans la hero card ET dans la grille → retirer heart rate de la grille, il reste uniquement dans la hero card (voir §2.2 et §2.3)
2. **"Last sync" en carte dans la grille** → retirer, garder uniquement en texte dans la hero card (§2.2 point 2)
3. **Bouton "Appeler famille" manquant** → ajouter (§2.4)
4. **Mélange de langues "Hello, فاطمة بناني"** → corriger selon §0 (clé manquante en AR, fallback ne doit jamais aller vers EN)

---

## 5. Instructions de travail

- Corrige les 4 bugs du §4 d'abord, puis vérifie que la structure correspond exactement au §2
- Teste avec `npx expo start --web` après chaque correction
- Ne touche pas à `services/` ni `store/`
- Un seul écran à la fois : `(tabs)/index.tsx` pour l'instant
- Confirme avant toute suppression de fichier
