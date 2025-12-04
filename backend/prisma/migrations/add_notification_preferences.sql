-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS `notification_preferences` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `appointment_reminders` BOOLEAN DEFAULT TRUE,
  `community_events` BOOLEAN DEFAULT TRUE,
  `platform_updates` BOOLEAN DEFAULT TRUE,
  `new_products_services` BOOLEAN DEFAULT TRUE,
  `urgent_care_alerts` BOOLEAN DEFAULT TRUE,
  `account_activity_alerts` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME(0) DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME(0) DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `notification_preferences_user_id_idx` (`user_id`),
  CONSTRAINT `notification_preferences_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;






