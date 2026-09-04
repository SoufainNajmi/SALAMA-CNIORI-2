/**
 * ============================================================================
 *  CONTRAT API — SALAMA (bracelet IoT de surveillance santé)
 * ============================================================================
 *
 *  Ce fichier est la SOURCE DE VÉRITÉ partagée entre l'application mobile
 *  (famille du porteur) et le backend. Il est volontairement autonome et
 *  commenté pour être transmis tel quel au développeur backend.
 *
 *  Conventions générales
 *  ---------------------
 *  - Transport            : HTTPS, JSON (UTF-8), clés en camelCase.
 *  - Préfixe des routes   : /api
 *  - Base URL             : fournie côté app par EXPO_PUBLIC_API_URL
 *                           (ex : https://api.salama.ma). Jamais en dur.
 *  - Horodatages          : chaînes ISO 8601 en UTC, suffixe "Z"
 *                           (ex : "2026-09-02T14:30:00Z").
 *  - Identifiants         : chaînes opaques. L'app ne suppose aucun format.
 *  - Fuseau d'affichage   : géré par l'app, pas par le backend.
 *  - Pagination           : aucune pour l'instant (volumes faibles).
 *
 *  Authentification
 *  ----------------
 *  - Un seul compte "famille" par porteur pour cette version.
 *  - POST /api/auth/login renvoie un jeton Bearer.
 *  - Ce jeton est envoyé sur TOUTES les autres routes dans l'en-tête :
 *        Authorization: Bearer <token>
 *  - Jeton absent, invalide ou expiré -> 401 + ApiError { code: "unauthorized" }.
 *    L'app déconnecte alors l'utilisateur et renvoie vers l'écran de connexion.
 *
 *  Endpoints couverts
 *  ------------------
 *    POST   /api/auth/login          -> LoginResponse          (body : LoginRequest)
 *    GET    /api/wearer              -> WearerProfile
 *    GET    /api/status              -> Status
 *    GET    /api/history?range=24h|7d-> HistoryResponse
 *    GET    /api/alerts             -> Alert[]
 *    POST   /api/alerts/:id/ack      -> Alert                  (body : AckAlertRequest)
 *    POST   /api/devices            -> void                    (body : RegisterDeviceRequest)
 *    DELETE /api/devices/:token      -> void
 *    POST   /api/measurements        -> void                    (body : PushMeasurementsRequest)
 *
 *  En cas d'erreur (tout code 4xx / 5xx) : voir ApiError.
 * ============================================================================
 */

/* --------------------------------------------------------------------------
 *  Primitives communes
 * -------------------------------------------------------------------------- */

/** Horodatage ISO 8601 en UTC, ex : "2026-09-02T14:30:00Z". */
export type IsoDateTime = string;

/** Date seule "AAAA-MM-JJ", sans heure ni fuseau (ex : date de naissance). */
export type IsoDate = string;

/** Identifiant opaque généré par le backend. */
export type Id = string;

/** Numéro de téléphone au format international E.164, ex : "+212600000000". */
export type PhoneNumber = string;

/** Plateforme de l'appareil mobile de la famille. */
export type DevicePlatform = "ios" | "android";

/**
 * État de santé global du porteur, calculé par le BACKEND à partir des
 * dernières mesures et de la détection de chute. L'app ne recalcule jamais
 * cet état, elle se contente de l'afficher (couleur de la carte d'accueil).
 *
 *  - "ok"      : tout est normal (carte verte)
 *  - "warning" : une valeur sort des bornes attendues, sans urgence (orange)
 *  - "alert"   : situation critique — chute ou signe vital dangereux (rouge)
 */
export type WearerState = "ok" | "warning" | "alert";

/* ==========================================================================
 *  POST /api/auth/login
 *  --------------------------------------------------------------------------
 *  Connexion du compte famille. Identifiants : numéro de téléphone + mot de
 *  passe (définis à l'inscription, hors périmètre de cette version).
 *  Mauvais identifiants -> 401 + ApiError { code: "unauthorized" }.
 * ========================================================================== */

export interface LoginRequest {
  /** Numéro de téléphone du compte, format E.164. */
  phone: PhoneNumber;
  password: string;
}

export interface LoginResponse {
  /** Jeton Bearer à placer dans l'en-tête Authorization des requêtes suivantes. */
  token: string;
  /** Date d'expiration du jeton. Passée cette date, refaire un login. */
  expiresAt: IsoDateTime;
}

/* ==========================================================================
 *  GET /api/wearer
 *  --------------------------------------------------------------------------
 *  Profil du porteur du bracelet + liste des contacts d'urgence.
 *  Données quasi statiques (changent rarement). Un seul porteur par compte
 *  famille pour l'instant.
 * ========================================================================== */

export interface EmergencyContact {
  id: Id;
  /** Nom complet affiché. */
  fullName: string;
  /** Lien de parenté / relation, texte libre localisé côté saisie
   *  (ex : "الابنة", "Fille", "Voisin"). L'app l'affiche tel quel. */
  relationship: string;
  phone: PhoneNumber;
  /**
   * Ordre d'appel en cas d'alerte : 1 = prévenu en premier.
   * Valeurs uniques et contiguës recommandées (1, 2, 3…).
   */
  priority: number;
}

export interface WearerProfile {
  id: Id;
  fullName: string;
  birthDate: IsoDate;
  /** Sexe biologique — sert uniquement à l'affichage (icône, accord). */
  sex: "male" | "female";
  /** URL absolue d'une photo de profil, ou null si aucune. */
  photoUrl: string | null;
  /**
   * Informations médicales à montrer à la famille (traitements, allergies,
   * pathologies). Texte libre, peut contenir des sauts de ligne. null si vide.
   */
  medicalNotes: string | null;
  /** Contacts d'urgence, triés par `priority` croissante. */
  emergencyContacts: EmergencyContact[];
}

/* ==========================================================================
 *  GET /api/status
 *  --------------------------------------------------------------------------
 *  Dernier état connu du bracelet. Endpoint le plus sollicité (écran
 *  d'accueil + pull-to-refresh) : il doit être rapide et toujours répondre,
 *  même si le bracelet est hors ligne (dans ce cas, dernières valeurs +
 *  `lastSyncAt` ancien + `state` cohérent).
 * ========================================================================== */

export interface Status {
  /**
   * Fréquence cardiaque en battements par minute (entier).
   * null si le bracelet n'a pas de mesure fiable (mal porté, hors ligne).
   */
  heartRate: number | null;
  /**
   * Saturation pulsée en oxygène, en pourcentage 0–100 (entier).
   * null si mesure indisponible.
   */
  spo2: number | null;
  /** Niveau de batterie du bracelet, pourcentage 0–100 (entier). */
  battery: number;
  /** Dernière synchronisation réussie bracelet -> backend. */
  lastSyncAt: IsoDateTime;
  /** État global affiché par l'app (voir WearerState). */
  state: WearerState;
}

/* ==========================================================================
 *  GET /api/history?range=24h|7d
 *  --------------------------------------------------------------------------
 *  Séries temporelles de FC et SpO2 pour les graphiques de l'historique.
 *  Le paramètre `range` est OBLIGATOIRE. Toute autre valeur -> 400 + ApiError
 *  { code: "invalid_range" }.
 *
 *  Pas d'échantillonnage imposé (le backend ré-échantillonne si besoin) :
 *    - range "24h" : 1 point toutes les 5 minutes   (288 points)
 *    - range "7d"  : 1 point toutes les heures       (168 points)
 *  Les instants manquants sont renvoyés avec heartRate / spo2 à null.
 * ========================================================================== */

/** Fenêtre temporelle demandée pour l'historique. */
export type HistoryRange = "24h" | "7d";

/**
 * Un point de mesure horodaté. FC et SpO2 partagent le même instant.
 * Un champ peut être null si la mesure correspondante manque à cet instant.
 */
export interface HistorySample {
  at: IsoDateTime;
  heartRate: number | null;
  spo2: number | null;
}

export interface HistoryResponse {
  /** Rappel de la fenêtre demandée. */
  range: HistoryRange;
  /** Borne basse (incluse) de la période couverte. */
  from: IsoDateTime;
  /** Borne haute (incluse) — généralement "maintenant". */
  to: IsoDateTime;
  /**
   * Points triés par `at` croissant, au pas indiqué plus haut selon `range`.
   */
  samples: HistorySample[];
}

/* ==========================================================================
 *  Alertes
 * ========================================================================== */

/**
 * Nature de l'alerte :
 *  - "fall"    : chute détectée par l'accéléromètre du bracelet
 *  - "vitals"  : signe vital hors bornes (FC ou SpO2)
 *  - "offline" : bracelet injoignable depuis trop longtemps
 */
export type AlertType = "fall" | "vitals" | "offline";

/**
 * Détail structuré de l'alerte. Les champs présents dépendent de `type`.
 * TOUS optionnels : l'app doit fonctionner même si `details` est un objet vide.
 * `message` est un texte de repli déjà rédigé par le backend, non localisé —
 * l'app privilégie un rendu localisé à partir des champs structurés.
 */
export interface AlertDetails {
  /** "vitals" uniquement : mesure ayant déclenché l'alerte. */
  metric?: "heartRate" | "spo2";
  /** "vitals" uniquement : valeur mesurée au moment du déclenchement. */
  measuredValue?: number;
  /** "offline" uniquement : minutes écoulées depuis le dernier contact. */
  offlineMinutes?: number;
  /** Texte de repli lisible, rédigé par le backend (peut être affiché tel quel). */
  message?: string;
}

export interface Alert {
  id: Id;
  type: AlertType;
  /** Instant où l'événement s'est produit (pas l'instant de réception). */
  occurredAt: IsoDateTime;
  /** true dès qu'un membre de la famille a accusé réception. */
  acknowledged: boolean;
  /** Nom de la personne ayant acquitté ; null tant que non acquittée. */
  acknowledgedBy: string | null;
  /** Instant de l'acquittement ; null tant que non acquittée. */
  acknowledgedAt: IsoDateTime | null;
  details: AlertDetails;
}

/* --------------------------------------------------------------------------
 *  GET /api/alerts
 *  Historique complet des alertes, TRIÉ par `occurredAt` DÉCROISSANT
 *  (la plus récente en premier).
 * -------------------------------------------------------------------------- */
export type AlertsResponse = Alert[];

/* --------------------------------------------------------------------------
 *  POST /api/alerts/:id/ack
 *  Accusé de réception d'une alerte par la famille.
 *  - Corps : AckAlertRequest (peut être vide : {}).
 *  - Réponse : l'alerte mise à jour (AckAlertResponse).
 *  - Idempotent : ré-acquitter une alerte déjà acquittée renvoie 200 avec
 *    l'alerte inchangée (ne pas écraser `acknowledgedBy` / `acknowledgedAt`).
 *  - id inconnu -> 404 + ApiError { code: "not_found" }.
 * -------------------------------------------------------------------------- */
export interface AckAlertRequest {
  /** Nom du membre de la famille qui acquitte (optionnel mais recommandé). */
  acknowledgedBy?: string;
}

export type AckAlertResponse = Alert;

/* ==========================================================================
 *  NOTIFICATIONS PUSH (Expo Push)
 *  --------------------------------------------------------------------------
 *  L'app enregistre son jeton Expo Push au démarrage. Le backend stocke ce
 *  jeton et l'utilise pour pousser une notification à CHAQUE nouvelle alerte.
 *
 *  Cycle de vie :
 *    - à l'ouverture de l'app / après connexion : POST /api/devices
 *    - à la déconnexion : DELETE /api/devices/:token
 *    - le backend supprime aussi un jeton que le service Expo signale invalide
 *      (réponse "DeviceNotRegistered").
 * ========================================================================== */

/* --------------------------------------------------------------------------
 *  POST /api/devices
 *  Enregistre (ou met à jour) un jeton Expo Push pour le compte connecté.
 *  Ré-enregistrer le même jeton est idempotent.
 *  Réponse : 204 sans corps.
 * -------------------------------------------------------------------------- */
export interface RegisterDeviceRequest {
  /** Jeton renvoyé par Notifications.getExpoPushTokenAsync(), ex :
   *  "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]". */
  expoPushToken: string;
  platform: DevicePlatform;
}

/* --------------------------------------------------------------------------
 *  DELETE /api/devices/:token
 *  Désinscrit un jeton (déconnexion, changement d'appareil).
 *  token inconnu -> 204 quand même (idempotent).
 *  Réponse : 204 sans corps.
 * -------------------------------------------------------------------------- */

/**
 * Charge utile transportée dans le champ `data` de la notification push
 * envoyée par le BACKEND lors d'une alerte.
 *
 * Le service Expo enveloppe ceci ainsi (référence pour le backend) :
 *   {
 *     "to": "<expoPushToken>",
 *     "title": data.title,
 *     "body": data.body,
 *     "sound": "default",
 *     "priority": "high",
 *     "data": PushNotificationData
 *   }
 *
 * Quand l'utilisateur tape la notification, l'app lit `alertId` et ouvre
 * directement l'écran /alert/[id].
 */
export interface PushNotificationData {
  /** Identifiant de l'alerte -> route /alert/:alertId. */
  alertId: Id;
  type: AlertType;
  occurredAt: IsoDateTime;
  /** Titre déjà rédigé et localisé par le backend (langue du compte). */
  title: string;
  /** Corps déjà rédigé et localisé par le backend. */
  body: string;
}

/* ==========================================================================
 *  INGESTION DES MESURES
 *  --------------------------------------------------------------------------
 *  Le transport des mesures entre le bracelet et le backend n'est PAS encore
 *  tranché (BLE via un téléphone relais vs WiFi direct depuis l'ESP32-C3).
 *  Voir docs/ARCHITECTURE.md, section « Flux de données ».
 *
 *  Cet endpoint reste valable dans les deux cas : il reçoit des lots de
 *  mesures + des événements de chute. Selon l'option retenue, l'appelant sera
 *  l'application mobile (transport BLE) ou le firmware du bracelet (WiFi
 *  direct). Le format ci-dessous ne change pas.
 * ========================================================================== */

/** Événement de chute détecté par le bracelet, relayé tel quel. */
export interface FallEvent {
  at: IsoDateTime;
  /**
   * Indice de confiance de la détection, entre 0 et 1 (1 = quasi certain).
   * Le backend décide s'il déclenche une alerte "fall" à partir de ce champ.
   */
  confidence: number;
}

/* --------------------------------------------------------------------------
 *  POST /api/measurements
 *  Lot de mesures collectées par le bracelet depuis le dernier envoi.
 *  Émetteur selon l'option de transport retenue (voir docs/ARCHITECTURE.md).
 *  Doit être idempotent côté backend sur (compte, at) : renvoyer deux fois le
 *  même point ne crée pas de doublon.
 *  Réponse : 202 sans corps.
 * -------------------------------------------------------------------------- */
export interface PushMeasurementsRequest {
  /** Points de FC / SpO2 horodatés, triés par `at` croissant. */
  samples: HistorySample[];
  /** Niveau de batterie du bracelet au moment de l'envoi (0–100). */
  battery: number;
  /** Chutes détectées depuis le dernier envoi (souvent vide). */
  fallEvents: FallEvent[];
}

/* ==========================================================================
 *  Forme d'erreur commune — toutes les réponses 4xx / 5xx
 * ========================================================================== */

/**
 * Codes connus de l'app (le champ `code` peut en contenir d'autres, traités
 * comme "erreur inconnue") :
 *  - "unauthorized"  : 401 — jeton absent / invalide / expiré
 *  - "not_found"     : 404 — ressource inexistante (ex : id d'alerte)
 *  - "invalid_range" : 400 — paramètre `range` de /api/history invalide
 */
export interface ApiError {
  /** Code court et stable, ex : "not_found", "invalid_range", "unauthorized". */
  code: string;
  /** Message technique lisible (debug). Pas forcément montré à l'utilisateur. */
  message: string;
  /** Détails optionnels libres (champ fautif, etc.). */
  details?: Record<string, unknown>;
}

/* ==========================================================================
 *  Récapitulatif typé des routes (utilitaire côté app, ignoré par le backend)
 * ========================================================================== */

export interface ApiContract {
  "POST /api/auth/login": { body: LoginRequest; response: LoginResponse };
  "GET /api/wearer": { response: WearerProfile };
  "GET /api/status": { response: Status };
  "GET /api/history": { query: { range: HistoryRange }; response: HistoryResponse };
  "GET /api/alerts": { response: AlertsResponse };
  "POST /api/alerts/:id/ack": {
    params: { id: Id };
    body: AckAlertRequest;
    response: AckAlertResponse;
  };
  "POST /api/devices": { body: RegisterDeviceRequest; response: void };
  "DELETE /api/devices/:token": { params: { token: string }; response: void };
  "POST /api/measurements": { body: PushMeasurementsRequest; response: void };
}
