/*
  Warnings:

  - You are about to drop the column `bank_code` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `card_type` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `vnp_transaction_no` on the `payments` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Float`.

*/
-- AlterTable
ALTER TABLE `orders` MODIFY `status` ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded') NULL DEFAULT 'pending',
    MODIFY `payment_method` ENUM('momo', 'vnpay', 'zalopay', 'cod') NULL;

-- AlterTable
ALTER TABLE `payments` DROP COLUMN `bank_code`,
    DROP COLUMN `card_type`,
    DROP COLUMN `vnp_transaction_no`,
    MODIFY `amount` FLOAT NOT NULL,
    MODIFY `transaction_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `rejection_reason` TEXT NULL,
    ADD COLUMN `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `reminders` ADD COLUMN `dose_number` INTEGER NULL,
    ADD COLUMN `vaccine_id` CHAR(25) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `vendors` ADD COLUMN `rejection_reason` TEXT NULL;

-- CreateTable
CREATE TABLE `notification_preferences` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `appointment_reminders` BOOLEAN NULL DEFAULT true,
    `community_events` BOOLEAN NULL DEFAULT true,
    `platform_updates` BOOLEAN NULL DEFAULT true,
    `new_products_services` BOOLEAN NULL DEFAULT true,
    `urgent_care_alerts` BOOLEAN NULL DEFAULT true,
    `account_activity_alerts` BOOLEAN NULL DEFAULT true,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `user_id`(`user_id`),
    INDEX `notification_preferences_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `products_status_idx` ON `products`(`status`);

-- CreateIndex
CREATE INDEX `idx_reminders_vaccine_id` ON `reminders`(`vaccine_id`);

-- CreateIndex
CREATE INDEX `users_is_active_idx` ON `users`(`is_active`);

-- AddForeignKey
ALTER TABLE `reminders` ADD CONSTRAINT `reminders_vaccine_id_fkey` FOREIGN KEY (`vaccine_id`) REFERENCES `vaccines`(`vaccine_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_preferences` ADD CONSTRAINT `notification_preferences_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `health_records` ADD CONSTRAINT `health_records_pet_id_fkey` FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_pet_id_fkey` FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calendar_events` ADD CONSTRAINT `calendar_events_pet_id_fkey` FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calendar_events` ADD CONSTRAINT `calendar_events_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_history` ADD CONSTRAINT `chat_history_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_history` ADD CONSTRAINT `chat_history_pet_id_fkey` FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
