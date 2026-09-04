# Architecture — SALAMA

Document vivant. Décrit les grands choix techniques et les décisions encore
ouvertes.

## Vue d'ensemble

```
[Bracelet ESP32-C3]  ──?──>  [Backend / API]  ──push──>  [App mobile (famille)]
   MAX30102 (FC, SpO2)                                       Expo / React Native
   MPU-6050 (chute)
```

- Le **bracelet** collecte les signes vitaux et détecte les chutes.
- Le **backend** (développé séparément) stocke les mesures, calcule l'état de
  santé, déclenche les alertes et envoie les notifications push.
- L'**app mobile** est destinée à la **famille** du porteur. Elle affiche
  l'état, reçoit les alertes, montre l'historique. Contrat d'API :
  [`app/src/types/api.ts`](../app/src/types/api.ts).

Le maillon `[Bracelet] ──?──> [Backend]` n'est pas tranché : voir ci-dessous.

## Flux de données

### Question ouverte : comment les mesures et les alertes remontent-elles du bracelet vers le backend ?

Deux options sont sur la table. Le point d'entrée côté backend est le même dans
les deux cas (`POST /api/measurements` : lots de mesures + événements de chute) ;
seul le transport change, et donc l'émetteur de la requête.

---

#### Option A — BLE : bracelet → téléphone → HTTPS → backend

Le bracelet expose ses données en Bluetooth Low Energy. Un téléphone appairé
(app SALAMA installée) les reçoit et les relaie au backend en HTTPS.

**Autonomie de la batterie**
BLE est conçu pour la basse consommation : advertising + notifications GATT
n'activent la radio que par courtes salves. La radio n'est jamais maintenue
active en continu. C'est l'option la plus favorable à une petite batterie de
bracelet. Le poste de consommation dominant redevient l'échantillonnage des
capteurs, pas la communication.
*(Chiffres de courant : TODO — vérifier dans la datasheet ESP32-C3.)*

**Fiabilité d'acheminement d'une alerte de chute**
C'est le point faible. L'alerte ne part que si un téléphone appairé est :
- à portée BLE (quelques mètres à une dizaine, selon les murs et l'environnement),
- allumé,
- Bluetooth activé,
- avec l'app autorisée à travailler en arrière-plan.

Si l'une de ces conditions manque, l'alerte reste dans le bracelet jusqu'à la
reconnexion — délai potentiellement long pour un événement où chaque minute
compte. La personne âgée n'utilise pas l'app : le téléphone relais est donc
celui d'un proche, qui n'est pas forcément dans la même pièce, ni au domicile.
En arrière-plan, iOS restreint fortement le BLE ; Android demande un service de
premier plan persistant. Un buzzer local sur le bracelet peut alerter
l'entourage immédiat, mais ne remplace pas une notification distante.

**Couverture hors du domicile**
Quasi nulle. Dès que le porteur s'éloigne du téléphone relais (sortie, visite,
souk), le lien est rompu. Une couverture mobile réelle supposerait que le
porteur transporte lui-même un téléphone appairé et chargé — ce qui va à
l'encontre du principe « la personne âgée n'utilise pas l'app ».

**Complexité d'implémentation**
- Firmware : serveur GATT relativement simple à mettre en place.
- App mobile : c'est là que réside la difficulté — permissions BLE iOS/Android,
  reconnexion automatique, gestion du background (service de premier plan
  Android, contraintes iOS), bufferisation, déduplication, relais réseau.
- Setup utilisateur : un appairage BLE à faire une fois (écran d'appairage).

---

#### Option B — WiFi : ESP32-C3 → HTTPS → backend (direct)

Le bracelet se connecte au WiFi du domicile et appelle lui-même le backend en
HTTPS. Pas de téléphone dans la boucle pour la remontée des données.

**Autonomie de la batterie**
Nettement défavorable. Associer un réseau WiFi et maintenir une pile TCP/IP +
TLS a un coût énergétique bien supérieur à BLE, avec des pics de courant
importants en émission. Sur une batterie de bracelet, cela impose soit une
recharge très fréquente, soit un cycle veille profonde / réveil agressif — et
ce cycle ajoute de la latence entre la détection d'une chute et son envoi.
Le handshake TLS est aussi coûteux en RAM et en CPU sur l'ESP32-C3.
*(Chiffres de courant et impact sur l'autonomie : TODO — vérifier dans la
datasheet ESP32-C3 et mesurer.)*

**Fiabilité d'acheminement d'une alerte de chute**
Meilleure quand le WiFi domestique fonctionne : l'alerte part directement, sans
dépendre de la présence, de l'état ou des réglages d'un téléphone tiers.
En contrepartie, elle dépend entièrement de l'infrastructure du domicile :
box allumée et fonctionnelle (une coupure de courant coupe aussi la box),
mot de passe WiFi toujours valide, zone de couverture WiFi incluant toutes les
pièces (y compris celles où une chute est probable : salle de bain, couloir).

**Couverture hors du domicile**
Nulle également : pas de SIM ni de connectivité cellulaire dans le matériel
prévu. Hors de portée du WiFi domestique, plus aucun lien. (Une variante
cellulaire / NB-IoT lèverait cette limite mais sort des specs matériel
actuelles.)

**Complexité d'implémentation**
- Firmware : plus lourd — pile WiFi, TLS, gestion des reconnexions, stockage
  sécurisé des identifiants WiFi, provisioning initial (SoftAP ou BLE pour
  saisir le réseau et le mot de passe — donc du BLE quand même au moins pour
  le setup).
- App mobile : aucun relais réseau à écrire ; l'app se limite à l'affichage et
  aux notifications push reçues du backend.
- Setup utilisateur : saisie du réseau et du mot de passe WiFi — friction réelle
  pour une famille non technique, à refaire si la box change.

---

#### Élément commun aux deux options

Aucune des deux ne couvre les déplacements hors du domicile sans ajouter une
connectivité cellulaire. Dans les deux cas, l'app mobile de la famille reste
nécessaire pour **recevoir** les alertes (notifications push émises par le
backend) ; le débat porte uniquement sur le chemin **montant** bracelet →
backend.

### Décision : en attente — à trancher par l'équipe
