

SET NAMES utf8mb4;

-- ==================== AUTH ====================

CREATE TABLE users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  phone VARCHAR(20) NOT NULL UNIQUE,          -- format E.164, aligné avec LoginRequest (types/api.ts)
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('meriid','famille') NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Un "household" relie un meriid à ses membres de famille
CREATE TABLE households (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  meriid_user_id CHAR(36) NOT NULL UNIQUE,
  invite_code VARCHAR(10) NOT NULL UNIQUE,     -- code fourni par un compte "famille" à l'inscription
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (meriid_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE household_members (
  household_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  PRIMARY KEY (household_id, user_id),
  FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==================== CONTACTS D'URGENCE ====================

CREATE TABLE emergency_contacts (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  household_id CHAR(36) NOT NULL,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  priority TINYINT UNSIGNED NOT NULL,          -- 1 = premier appelé
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_household_priority (household_id, priority)
) ENGINE=InnoDB;

-- ==================== PROFIL MÉDICAL ====================

CREATE TABLE medical_profiles (
  user_id CHAR(36) PRIMARY KEY,
  blood_type ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-') NULL,
  height_cm SMALLINT UNSIGNED NULL,
  weight_kg SMALLINT UNSIGNED NULL,
  birth_date DATE NULL,
  city VARCHAR(80) NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE allergies (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  label VARCHAR(120) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE chronic_conditions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  label VARCHAR(120) NOT NULL,
  notes TEXT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==================== MÉDICAMENTS & RAPPELS ====================

CREATE TABLE medications (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  name VARCHAR(120) NOT NULL,
  dose VARCHAR(40) NOT NULL,                   -- ex: "500mg"
  reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE medication_schedule (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  medication_id CHAR(36) NOT NULL,
  time_of_day TIME NOT NULL,                   -- ex: 08:00:00
  label ENUM('matin','midi','soir','autre') NOT NULL,
  FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Une ligne par occurrence quotidienne d'un rappel — trace le flow de confirmation/escalade
CREATE TABLE dose_events (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  medication_schedule_id CHAR(36) NOT NULL,
  scheduled_at DATETIME NOT NULL,
  status ENUM(
    'en_attente',            -- notification envoyée, pas encore de délai écoulé
    'confirme_app',          -- bouton "J'ai pris mon médicament"
    'confirme_vocal',        -- réponse positive à l'appel IA
    'appel_ia_en_cours',     -- 5min écoulées, IA en train d'appeler
    'escalade_famille'       -- pas de réponse, famille notifiée
  ) NOT NULL DEFAULT 'en_attente',
  confirmed_at DATETIME NULL,
  escalated_at DATETIME NULL,
  FOREIGN KEY (medication_schedule_id) REFERENCES medication_schedule(id) ON DELETE CASCADE,
  INDEX idx_schedule_time (medication_schedule_id, scheduled_at)
) ENGINE=InnoDB;

-- ==================== BRACELET ====================

CREATE TABLE bracelets (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  device_code VARCHAR(40) NOT NULL UNIQUE,     -- ex: SALAMA-04
  paired_at DATETIME NULL,
  battery_pct TINYINT UNSIGNED NULL,
  last_sync_at DATETIME NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Volontairement flexible (raw_payload) tant que le protocole firmware n'est pas figé.
-- heart_rate / spo2 seront extraits du payload une fois le format confirmé.
CREATE TABLE vitals_readings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  bracelet_id CHAR(36) NOT NULL,
  recorded_at DATETIME NOT NULL,
  heart_rate SMALLINT UNSIGNED NULL,
  spo2 TINYINT UNSIGNED NULL,
  raw_payload JSON NULL,
  FOREIGN KEY (bracelet_id) REFERENCES bracelets(id) ON DELETE CASCADE,
  INDEX idx_bracelet_time (bracelet_id, recorded_at)
) ENGINE=InnoDB;

-- ==================== ALERTES SOS ====================

CREATE TABLE alerts (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  type ENUM('chute','anomalie_vitale','offline','autre') NOT NULL,
  status ENUM('active','fausse_alerte','resolue') NOT NULL DEFAULT 'active',
  triggered_at DATETIME NOT NULL,
  resolved_at DATETIME NULL,
  vitals_snapshot JSON NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_status (user_id, status)
) ENGINE=InnoDB;