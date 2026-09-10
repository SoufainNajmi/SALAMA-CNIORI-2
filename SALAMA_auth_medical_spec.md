# SALAMA — Login, Profil médical, Médicaments & Escalade de rappel

Document self-contained. À donner tel quel à Claude Code.

---

## 0. Décision prise (à valider, changeable)

Confirmation de prise de médicament = **bouton "J'ai pris mon médicament" dans l'app OU réponse vocale positive à l'appel IA**. Les deux valident la prise. Si aucune des deux dans le délai, escalade vers la famille.

---

## 1. Design tokens (déjà en place — référence)

```
primary: #1e3a5f | primaryLight: #3b6ea5 | primarySoft: #e8eef5
bg: #f7f9fb | surface: #ffffff | text: #1a2332 | textSoft: #64748b | border: #e2e8f0
ok: #0d9488 | okSoft: #e6f5f3 | warn: #d97706 | warnSoft: #fef3e2
critical: #dc2626 (réservé alerte SOS active) | criticalSoft: #fdeaea
```

---

## 2. Authentification — écran `login.tsx` (nouveau)

### 2.1 Rôles
Deux rôles distincts avec permissions différentes :
- **`meriid`** (le proche suivi) : vue simplifiée, gros texte, accès à son profil médical, ses médicaments, bouton d'appel d'urgence. PAS d'accès aux réglages de configuration famille.
- **`famille`** (aidant/proche) : vue complète — accueil avec vitals, historique, gestion des contacts, configuration des rappels, réception des alertes/escalades.

### 2.2 Structure de l'écran
1. Logo + nom "SALAMA" + sous-titre
2. **Sélecteur de rôle** (segmented control, 2 options) : "Je suis le proche suivi" / "Je suis un membre de la famille" — détermine la vue post-login
3. Champ email
4. Champ mot de passe (avec toggle afficher/masquer)
5. Lien "Mot de passe oublié ?"
6. Bouton "Se connecter" (fond `primary`)
7. Lien "Créer un compte"

### 2.3 Stockage de session
- Utiliser le store Zustand `auth` existant (`store/`) — ajouter un champ `role: "meriid" | "famille"` à l'état d'auth si absent
- Le rôle détermine le layout racine après login (quelles tabs sont visibles — le rôle `meriid` ne doit PAS voir l'onglet configuration/famille)

---

## 3. Profil médical — écran `profile/medical.tsx` (nouveau, ou section dans `profile.tsx` existant)

Champs, dans cet ordre :
1. En-tête : avatar (initiales), nom complet, âge, ville
2. Grille 2x2 : Groupe sanguin (icône goutte, ton `critical`/`criticalSoft` car info vitale d'urgence) / Taille & poids
3. Section "Allergies" : tags cliquables (ton `warn`/`warnSoft`), bouton "+ Ajouter"
4. Section "Maladies chroniques" : liste en carte unique avec dividers, chevron à droite pour éditer chaque entrée

Ces données doivent être visibles par le rôle `famille` en lecture/écriture, et par le rôle `meriid` en lecture seule.

---

## 4. Médicaments — écran `medications.tsx` (nouveau)

### 4.1 Structure
1. Carte "Prochain rappel" en haut (fond `primary`, texte blanc) : nom du médicament, dose, heure
2. Liste groupée par moment de la journée (Matin / Midi / Soir), chaque groupe avec icône (soleil / coucher de soleil / lune) et heure
3. Chaque médicament : icône pilule, nom, dosage, toggle "rappel activé/désactivé"
4. Bouton "+ Ajouter un médicament" en bas

### 4.2 Logique de rappel (à implémenter dans la couche services/logique métier, PAS dans services/ existant sans validation)
```
À l'heure prévue :
  → push notification + badge dans l'app
  → attendre 5 minutes
  → SI confirmé (bouton app OU réponse vocale IA positive) : marquer "pris", fin du flow
  → SI PAS confirmé après 5 min :
      → appel vocal IA en darija : "wach khditi dwak?"
      → SI réponse positive détectée : marquer "pris", fin du flow
      → SI pas de réponse OU réponse négative : escalade vers la famille (notification, PAS une alerte SOS critique — 
        ton `warn`, pas `critical`, sauf si le patient signale un problème de santé en plus)
```
Ne pas implémenter la reconnaissance vocale elle-même ici (dépend du module voice engine darija séparé) — prévoir l'interface/les hooks pour qu'elle s'y branche plus tard. Mock le comportement avec `USE_MOCKS` en attendant.

---

## 5. Écran "Suivi de rappel" — `medication-alert/[id].tsx` (nouveau)

Affiché côté famille quand une dose est probablement manquée (résultat de l'escalade §4.2).

Structure :
1. Bandeau résumé (fond `criticalSoft`, texte `critical`) : "Dose probablement manquée" + nom du médicament + heure
2. Timeline verticale des étapes (notification → pas de confirmation → appel IA → pas de réponse → escalade), chaque étape avec heure, icône check, description
3. Bouton "Appeler [nom du proche]" (fond `primary`)

Réutiliser le composant timeline s'il en existe déjà un dans `history.tsx`, sinon créer `components/Timeline.tsx` réutilisable.

---

## 6. Composants à créer si absents dans `app/src/components/`
- `RoleSelector` (segmented control 2 options)
- `PasswordInput` (avec toggle visibilité)
- `AllergyTag`
- `MedicationRow` (icône + nom + dose + toggle)
- `Timeline` (étapes verticales avec statut coloré)

---

## 7. Instructions de travail
- Un écran à la fois, dans cet ordre : login.tsx → profile médical → medications.tsx → medication-alert/[id].tsx
- Ne pas toucher aux écrans déjà validés ((tabs)/index.tsx, alert/[id].tsx)
- Utiliser les mêmes tokens (§1), ne pas en introduire de nouveaux sans demander
- Vérifier RTL (mode arabe) sur les nouveaux écrans
- Teste avec `npx expo start --web` après chaque écran, confirme avant de passer au suivant
- Si le store `auth` (Zustand) doit être modifié pour ajouter `role`, liste-moi précisément ce qui change avant de le faire — ne pas toucher `store/` sans validation explicite (règle existante du projet)
