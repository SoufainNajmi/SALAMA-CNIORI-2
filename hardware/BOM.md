# BOM chiffrée — Prototype SALAMA (1 unité)

> Prix relevés en septembre 2026 (captures ponctuelles, fluctuent ±30 % selon stock/promo). À reconfirmer au panier avant commande.
> ⚠️ = valeur d'ingénierie à valider sur datasheet + mesure avant intégration firmware (aucune valeur injectée sans vérification, conformément à la règle du projet).

## 1. Microcontrôleur

| Réf. | Fonction | Qté | Prix unit. (MAD) | Délai | Notes |
|---|---|---|---|---|---|
| **ESP32-C3 SuperMini** (USB-C) | MCU principal, WiFi, I²C, GPIO | 2 (redondance) | 60–95 | Local 1–3 j | shoppingmaroc.net, shop4makers |

**Décision** : SuperMini local retenu (équipe soude through-hole). DevKitM-1 importé et option puce nue/PCB custom écartées (délai/complexité).

## 2. Capteurs (bus I²C partagé)

| Réf. | Fonction | Qté | Prix unit. (MAD) | Délai | Notes |
|---|---|---|---|---|---|
| MAX30102 (breakout GY-MAX30102) | FC + SpO2 (PPG) | 2 (redondance) | 25–55 | Local 1–3 j | Vérifier marquage (parfois MAX30105, compatible) |
| MPU-6050 (breakout GY-521) | Accéléro/gyro → détection chute | 2 (redondance) | 35–45 | Local 1–3 j | — |

⚠️ Alimenter les deux breakouts en 3V3. Pull-ups I²C embarquées sur les breakouts ; prévoir 2–3 résistances 4,7 kΩ de secours (valeur finale à confirmer à l'oscillo).

## 3. Alimentation

| Réf. | Fonction | Qté | Prix (MAD) | Délai | Notes |
|---|---|---|---|---|---|
| Module TP4056 + protection (DW01+FS8205, USB-C) | Charge LiPo + protection | 1 | 15–25 | Local 1–3 j | Version SANS protection à proscrire (projet santé) |
| Cellule LiPo 3,7V — MVP: 604030 600mAh / Cible bracelet: 302020~400mAh | Alimentation | 1 | 40–90 | Local 1–3 j | Stock parfois limité → commander tôt |
| Condensateur réservoir ⚠️ ~220–470µF faible ESR + 100nF céramique | Absorber pics WiFi TX, éviter brownout | 1–2 | 3–8 | Local 1–3 j | Valeur à valider par mesure |
| *(v2 optionnel)* Buck-boost 3,3V (TPS63020) | Rail propre + autonomie | 0–1 | 20–60 | Local/intl | Non nécessaire pour MVP |

## 4. Interface physique (chemin critique hors ligne)

| Réf. | Fonction | Qté | Prix (MAD) | Délai |
|---|---|---|---|---|
| Bouton poussoir 6×6×5mm | « Aide » + « Annuler » | 2 (+2 rechange) | 1,5/pce | Local 1–3 j |
| Module moteur vibration (driver intégré) | Retour haptique | 1 | 15–25 | Local 1–3 j |
| Buzzer actif 5V | Confirmation sonore | 1 | 4–8 | Local 1–3 j |

## 5. Boîtier / bracelet

| Réf. | Fonction | Qté | Prix (MAD) | Délai |
|---|---|---|---|---|
| Impression 3D PLA (si fablab BTS dispo) | Coque + porte-capteur | ~50–100g | 15–30 | Local/immédiat |
| Boîtier plastique projet (alternative) | Sans imprimante | 1 | 15–40 | Local 1–3 j |
| Bracelet silicone 20–22mm | Fixation poignet | 1 | 20–40 | Local |

## 6. Connectique & prototypage

| Réf. | Qté | Prix (MAD) | Délai |
|---|---|---|---|
| Breadboard 400 points | 1 | 6–10 | Local |
| Fils Dupont (lots M/M + M/F) | 2 lots | 5–12/lot | Local |
| Connecteur JST-PH 2.0 | 1–2 | 5–10 | Local |
| Plaque perforée 5×7cm | 1 | 8–15 | Local |
| Fil câblage AWG 26–30 | 1 | 10–20 | Local |

## 7. Consommables & divers

| Réf. | Prix (MAD) | Délai |
|---|---|---|
| Lot résistances (dont 4,7kΩ pull-ups ⚠️) | 5–15 | Local |
| Lot condensateurs (électro + céramique) | 5–15 | Local |
| Transistors NPN + diodes | 3–8 | Local |
| Adhésif/Kapton/gaine thermo | 15–30 | Local |
| Étain à souder | 20–40 | Local |
| Frais de port (1–2 commandes) | 40–80 | — |

## Totaux & budget (2300 MAD alloués)

| Scénario | Bas | Haut |
|---|---|---|
| **MVP démo/soutenance** (breadboard, 1 exemplaire) | 330 MAD | 580 MAD |
| **Version réelle** (redondance pièces fragiles, coque 3D, perfboard soudé) | 550 MAD | 1 250 MAD |

**Verdict : marge très large.** Même le scénario haut (~1250 MAD) reste ~1050 MAD sous le budget. Rien à couper.

## Alertes délais (dossier 30 oct., soutenance 25 nov.)

✅ **Aucun composant du chemin critique n'exige de commande internationale.** Tout est en stock au Maroc (1–3 jours) : ESP32-C3 SuperMini, MAX30102, MPU-6050, TP4056, LiPo, passifs.

❌ Écarté : DevKitM-1 importé (Mouser, 1-2 sem + douane), PCB custom JLCPCB (1-2 sem + soudure SMD) — reportés en v2.

## Recommandation d'achat

Commander cette semaine, en une passe, chez 2 marchands :
- **Moussasoft** : MPU-6050, buzzer, boutons, LiPo, breadboard, fils, passifs
- **shoppingmaroc.net / shop4makers** : ESP32-C3 SuperMini
- **a2itronic / micro-planet** : MAX30102 + TP4056

Prendre **×2** les pièces fragiles (ESP32-C3, MAX30102, MPU-6050) : +180–400 MAD, sécurise contre un module grillé sans perdre de semaine.

Reporter à novembre (non-bloquant pour le dossier) : coque 3D, bracelet silicone définitif, régulateur buck-boost. Le choix de la cellule LiPo définitive se fait après la première mesure d'autonomie réelle.

## Sources prix (relevées septembre 2026)

- ESP32-C3 SuperMini — shoppingmaroc.net · shop4makers · dsindustrie
- MAX30102 — Moussasoft · a2itronic · ArduiPlanet · micro-planet
- MPU-6050 GY-521 — Moussasoft · MEGMa · Aytoo
- TP4056 — micro-planet · shop4makers · Witty
- LiPo — Moussasoft (604030, 603048, 302020)
- Moteur vibration / Buzzer / Bouton — micro-planet · shop4makers · Moussasoft
- Breadboard / Dupont / Résistances — Moussasoft
- Filament PLA — TAGin3D · Moussasoft · shop4makers