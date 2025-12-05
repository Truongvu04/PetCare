-- CreateTable
CREATE TABLE IF NOT EXISTS `vaccines` (
    `vaccine_id` CHAR(25) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `species` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),

    INDEX `idx_vaccines_species`(`species`),
    INDEX `idx_vaccines_is_active`(`is_active`),
    PRIMARY KEY (`vaccine_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `vaccine_dose_schedules` (
    `schedule_id` CHAR(25) NOT NULL,
    `vaccine_id` CHAR(25) NOT NULL,
    `dose_number` INTEGER NOT NULL,
    `days_after_previous` INTEGER NOT NULL DEFAULT 0,
    `is_booster` BOOLEAN NOT NULL DEFAULT false,
    `notes` TEXT NULL,

    INDEX `idx_vaccine_dose_schedules_vaccine_id`(`vaccine_id`),
    UNIQUE INDEX `unique_vaccine_dose`(`vaccine_id`, `dose_number`),
    PRIMARY KEY (`schedule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable (with existence check)
SET @reminders_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'reminders');
SET @vaccine_id_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'reminders' AND column_name = 'vaccine_id');
SET @dose_number_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'reminders' AND column_name = 'dose_number');

SET @sql = IF(@reminders_exists > 0 AND @vaccine_id_exists = 0,
    'ALTER TABLE `reminders` ADD COLUMN `vaccine_id` CHAR(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(@reminders_exists > 0 AND @dose_number_exists = 0,
    'ALTER TABLE `reminders` ADD COLUMN `dose_number` INTEGER NULL',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- CreateIndex (only if column exists)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'reminders' AND column_name = 'vaccine_id');
SET @sql = IF(@col_exists > 0 AND (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'reminders' AND index_name = 'idx_reminders_vaccine_id') = 0,
    'CREATE INDEX `idx_reminders_vaccine_id` ON `reminders`(`vaccine_id`)',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- AddForeignKey for vaccine_dose_schedules
SET @vaccines_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'vaccines');
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'vaccine_dose_schedules' AND constraint_name = 'vaccine_dose_schedules_vaccine_id_fkey');
SET @sql = IF(@vaccines_exists > 0 AND @fk_exists = 0,
    'ALTER TABLE `vaccine_dose_schedules` ADD CONSTRAINT `vaccine_dose_schedules_vaccine_id_fkey` FOREIGN KEY (`vaccine_id`) REFERENCES `vaccines`(`vaccine_id`) ON DELETE CASCADE ON UPDATE CASCADE',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- AddForeignKey for reminders
SET @reminders_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'reminders');
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'reminders' AND constraint_name = 'reminders_vaccine_id_fkey');

-- Check if columns have compatible types and collation
SET @reminders_vaccine_id_type = (SELECT COLUMN_TYPE FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'reminders' AND column_name = 'vaccine_id');
SET @vaccines_vaccine_id_type = (SELECT COLUMN_TYPE FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'vaccines' AND column_name = 'vaccine_id');
SET @reminders_vaccine_id_collation = (SELECT COLLATION_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'reminders' AND column_name = 'vaccine_id');
SET @vaccines_vaccine_id_collation = (SELECT COLLATION_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'vaccines' AND column_name = 'vaccine_id');

-- Fix collation if needed before adding foreign key
SET @sql = IF(@reminders_exists > 0 AND @vaccines_exists > 0 AND @reminders_vaccine_id_collation IS NOT NULL AND @vaccines_vaccine_id_collation IS NOT NULL AND @reminders_vaccine_id_collation != @vaccines_vaccine_id_collation,
    CONCAT('ALTER TABLE `reminders` MODIFY COLUMN `vaccine_id` CHAR(25) CHARACTER SET utf8mb4 COLLATE ', @vaccines_vaccine_id_collation, ' NULL'),
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(@reminders_exists > 0 AND @vaccines_exists > 0 AND @fk_exists = 0,
    'ALTER TABLE `reminders` ADD CONSTRAINT `reminders_vaccine_id_fkey` FOREIGN KEY (`vaccine_id`) REFERENCES `vaccines`(`vaccine_id`) ON DELETE SET NULL ON UPDATE CASCADE',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

