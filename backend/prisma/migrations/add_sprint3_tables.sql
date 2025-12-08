-- Migration: Add Sprint 3 Tables
-- Health Records, Expenses, Calendar Events, Chat History

-- Create HealthRecordType enum (if not exists)
-- Note: MySQL doesn't support CREATE TYPE, so we'll use ENUM in table definition

-- Create health_records table
CREATE TABLE IF NOT EXISTS `health_records` (
  `id` CHAR(25) NOT NULL,
  `pet_id` CHAR(12) NOT NULL,
  `record_type` ENUM('weight', 'vaccination', 'health_note') NOT NULL,
  `value` DECIMAL(5, 2) NULL,
  `vaccination_name` VARCHAR(255) NULL,
  `health_note` TEXT NULL,
  `record_date` DATE NOT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `health_records_pet_id_idx` (`pet_id`),
  INDEX `health_records_record_type_idx` (`record_type`),
  INDEX `health_records_record_date_idx` (`record_date`),
  CONSTRAINT `health_records_pet_id_fkey` FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create ExpenseCategory enum (if not exists)
-- Create expenses table
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` CHAR(25) NOT NULL,
  `pet_id` CHAR(12) NOT NULL,
  `user_id` INT NOT NULL,
  `category` ENUM('food', 'medicine', 'accessories', 'vet_visit', 'grooming', 'other') NOT NULL,
  `description` VARCHAR(500) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `expense_date` DATE NOT NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `expenses_pet_id_idx` (`pet_id`),
  INDEX `expenses_user_id_idx` (`user_id`),
  INDEX `expenses_category_idx` (`category`),
  INDEX `expenses_expense_date_idx` (`expense_date`),
  CONSTRAINT `expenses_pet_id_fkey` FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `expenses_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create CalendarEventType enum (if not exists)
-- Create calendar_events table (without foreign keys to expenses/reminders first)
CREATE TABLE IF NOT EXISTS `calendar_events` (
  `id` CHAR(25) NOT NULL,
  `pet_id` CHAR(12) NOT NULL,
  `user_id` INT NOT NULL,
  `event_type` ENUM('vet_visit', 'expense', 'reminder') NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `event_date` DATE NOT NULL,
  `related_expense_id` CHAR(25) NULL,
  `related_reminder_id` CHAR(25) NULL,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `calendar_events_pet_id_idx` (`pet_id`),
  INDEX `calendar_events_user_id_idx` (`user_id`),
  INDEX `calendar_events_event_type_idx` (`event_type`),
  INDEX `calendar_events_event_date_idx` (`event_date`),
  CONSTRAINT `calendar_events_pet_id_fkey` FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `calendar_events_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign keys to expenses and reminders after tables are created
ALTER TABLE `calendar_events` 
  ADD CONSTRAINT `calendar_events_related_expense_id_fkey` 
  FOREIGN KEY (`related_expense_id`) REFERENCES `expenses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `calendar_events` 
  ADD CONSTRAINT `calendar_events_related_reminder_id_fkey` 
  FOREIGN KEY (`related_reminder_id`) REFERENCES `reminders`(`reminder_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Create chat_history table
CREATE TABLE IF NOT EXISTS `chat_history` (
  `id` CHAR(25) NOT NULL,
  `user_id` INT NOT NULL,
  `pet_id` CHAR(12) NULL,
  `message` TEXT NOT NULL,
  `response` TEXT NULL,
  `is_user_message` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `chat_history_user_id_idx` (`user_id`),
  INDEX `chat_history_pet_id_idx` (`pet_id`),
  INDEX `chat_history_created_at_idx` (`created_at`),
  CONSTRAINT `chat_history_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chat_history_pet_id_fkey` FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

