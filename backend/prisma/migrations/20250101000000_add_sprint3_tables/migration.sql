-- CreateTable
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

    INDEX `health_records_pet_id_idx`(`pet_id`),
    INDEX `health_records_record_type_idx`(`record_type`),
    INDEX `health_records_record_date_idx`(`record_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `expenses` (
    `id` CHAR(25) NOT NULL,
    `pet_id` CHAR(12) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `category` ENUM('food', 'medicine', 'accessories', 'vet_visit', 'grooming', 'other') NOT NULL,
    `description` VARCHAR(500) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `expense_date` DATE NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),

    INDEX `expenses_pet_id_idx`(`pet_id`),
    INDEX `expenses_user_id_idx`(`user_id`),
    INDEX `expenses_category_idx`(`category`),
    INDEX `expenses_expense_date_idx`(`expense_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `calendar_events` (
    `id` CHAR(25) NOT NULL,
    `pet_id` CHAR(12) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `event_type` ENUM('vet_visit', 'expense', 'reminder') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `event_date` DATE NOT NULL,
    `related_expense_id` CHAR(25) NULL,
    `related_reminder_id` CHAR(25) NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `calendar_events_pet_id_idx`(`pet_id`),
    INDEX `calendar_events_user_id_idx`(`user_id`),
    INDEX `calendar_events_event_type_idx`(`event_type`),
    INDEX `calendar_events_event_date_idx`(`event_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `chat_history` (
    `id` CHAR(25) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `pet_id` CHAR(12) NULL,
    `message` TEXT NOT NULL,
    `response` TEXT NULL,
    `is_user_message` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `chat_history_user_id_idx`(`user_id`),
    INDEX `chat_history_pet_id_idx`(`pet_id`),
    INDEX `chat_history_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey (with existence check)
SET @pets_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'pets');
SET @users_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'users');
SET @expenses_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'expenses');

SET @sql = IF(@pets_exists > 0, 
    'ALTER TABLE `health_records` ADD CONSTRAINT `health_records_pet_id_fkey` FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(@pets_exists > 0, 
    'ALTER TABLE `expenses` ADD CONSTRAINT `expenses_pet_id_fkey` FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(@users_exists > 0, 
    'ALTER TABLE `expenses` ADD CONSTRAINT `expenses_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(@pets_exists > 0, 
    'ALTER TABLE `calendar_events` ADD CONSTRAINT `calendar_events_pet_id_fkey` FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(@users_exists > 0, 
    'ALTER TABLE `calendar_events` ADD CONSTRAINT `calendar_events_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(@expenses_exists > 0, 
    'ALTER TABLE `calendar_events` ADD CONSTRAINT `calendar_events_related_expense_id_fkey` FOREIGN KEY (`related_expense_id`) REFERENCES `expenses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(@users_exists > 0, 
    'ALTER TABLE `chat_history` ADD CONSTRAINT `chat_history_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(@pets_exists > 0, 
    'ALTER TABLE `chat_history` ADD CONSTRAINT `chat_history_pet_id_fkey` FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

