-- CreateTable
CREATE TABLE `Users` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `role` ENUM('owner', 'vendor', 'admin') NOT NULL DEFAULT 'owner',
    `googleId` VARCHAR(191) NULL,
    `facebookId` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Users_email_key`(`email`),
    UNIQUE INDEX `Users_googleId_key`(`googleId`),
    UNIQUE INDEX `Users_facebookId_key`(`facebookId`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OTP` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `code` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pets` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `species` VARCHAR(191) NOT NULL,
    `breed` VARCHAR(191) NULL,
    `age` INTEGER NULL,
    `weight` DOUBLE NULL,
    `vaccination` VARCHAR(191) NULL,
    `medical_history` TEXT NULL,
    `description` TEXT NULL,
    `photo_url` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reminders` (
    `reminder_id` VARCHAR(191) NOT NULL,
    `type` ENUM('vaccination', 'vet_visit', 'feeding', 'grooming', 'medication', 'other', 'checkup') NOT NULL,
    `vaccination_type` VARCHAR(191) NULL,
    `feeding_time` TIME NULL,
    `reminder_date` DATE NOT NULL,
    `frequency` ENUM('none', 'daily', 'weekly', 'monthly', 'yearly') NOT NULL DEFAULT 'none',
    `status` ENUM('pending', 'done') NOT NULL DEFAULT 'pending',
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `end_date` DATE NULL,
    `is_instance` BOOLEAN NOT NULL DEFAULT false,
    `email_sent` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `pet_id` VARCHAR(191) NOT NULL,

    INDEX `reminders_pet_id_idx`(`pet_id`),
    INDEX `reminders_reminder_date_idx`(`reminder_date`),
    PRIMARY KEY (`reminder_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pets` ADD CONSTRAINT `pets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reminders` ADD CONSTRAINT `reminders_pet_id_fkey` FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
