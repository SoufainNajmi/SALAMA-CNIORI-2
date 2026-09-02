# SALAMA — Bracelet IoT de surveillance santé

## Contexte

Bracelet connecté destiné aux personnes âgées au Maroc. Surveillance des signes
vitaux, détection de chute, et interface vocale en darija marocaine.

Projet présenté au concours **CNIORI'26**.

| Échéance | Date |
|---|---|
| Livraison du dossier | 30 octobre 2026 |
| Soutenance | 25 novembre 2026 |

Équipe de 2 personnes. Budget matériel : ~2300 MAD (partagé).

## Matériel

| Composant | Rôle | Bus |
|---|---|---|
| ESP32-C3 | Microcontrôleur principal | — |
| MAX30102 | Fréquence cardiaque, SpO2 | I²C |
| MPU-6050 | Accéléromètre / gyroscope, détection de chute | I²C |

Les deux capteurs partagent le bus I²C.

## Arborescence

```
firmware/          Code embarqué ESP32-C3 (PlatformIO)
  src/
  include/
  lib/
app/               Application mobile (à décider)
backend/           API (à décider)
docs/              Documentation, architecture, dossier concours
hardware/          Schémas, BOM, budget
```

## Règles de travail

### Ne jamais inventer de valeurs matérielles

C'est la règle la plus importante de ce projet. Un registre inventé produit du
code qui compile, se téléverse, et renvoie des données fausses — ce qui est bien
pire qu'une erreur de compilation.

Ne jamais écrire de valeur pour :

- adresses I²C
- adresses ou valeurs de registres
- broches GPIO
- timings, délais, fréquences d'échantillonnage
- seuils de détection (chute, fréquence cardiaque, SpO2)
- prix des composants

Écrire `// TODO: vérifier dans la datasheet` à la place. Je remplirai après
vérification sur la fiche technique officielle du composant.

### Secrets

- `secrets.h` n'est jamais versionné.
- `secrets.example.h` est versionné, avec des valeurs vides.
- Aucun SSID, mot de passe, jeton ou URL d'API en dur dans le code.

Avant tout commit contenant du code réseau, vérifier `git status`.

### Portée des modifications

- Ne pas créer de fichiers hors de ce qui est demandé.
- Ne pas exécuter de commandes git.
- Ne pas installer de dépendances sans demander.
- Si un fichier existe déjà, demander avant de l'écraser.

### Langue

- Code et commentaires : français.
- Documentation : français.
- Interface utilisateur du bracelet : darija marocaine (voix).

## Points ouverts

À décider — ne pas trancher sans me demander :

- Plateforme de l'application mobile
- Protocole de communication bracelet ↔ backend
- Moteur de synthèse/reconnaissance vocale pour la darija
- Stratégie d'alimentation et autonomie
