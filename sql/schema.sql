-- Schema completo do banco de dados
-- Criação de todas as tabelas necessárias para o sistema de eventos

CREATE TABLE IF NOT EXISTS `Users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `cpf` VARCHAR(20) NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `is_attendant` BOOLEAN NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `Events` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `starts_at` TIMESTAMP NOT NULL,
  `ends_at` TIMESTAMP NOT NULL,
  `location` VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS `Enrollments` (
  `user_id` INT UNSIGNED NOT NULL,
  `event_id` INT UNSIGNED NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `checkin_time` TIMESTAMP,
  `source` VARCHAR(255),
  
  PRIMARY KEY (`user_id`, `event_id`),
  
  CONSTRAINT `fk_enrollment_user` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`)
  ON UPDATE NO ACTION ON DELETE CASCADE,
  
  CONSTRAINT `fk_enrollment_event` FOREIGN KEY (`event_id`) REFERENCES `Events`(`id`)
  ON UPDATE NO ACTION ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `Certificates` (
  `user_id` INT UNSIGNED NOT NULL,
  `event_id` INT UNSIGNED NOT NULL,
  `hash` VARCHAR(255) NOT NULL PRIMARY KEY,
  `issued_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT `fk_certificate_enrollment` FOREIGN KEY (`user_id`, `event_id`) REFERENCES `Enrollments`(`user_id`, `event_id`)
  ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS `AuditLogs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `ip` VARCHAR(255),
  `user_id` INT UNSIGNED,
  `route` VARCHAR(255),
  `method` VARCHAR(50),
  `status_code` INT,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`)
  ON UPDATE NO ACTION ON DELETE NO ACTION
);
