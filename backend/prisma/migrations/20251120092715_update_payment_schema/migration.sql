/*
  Warnings:

  - You are about to alter the column `transaction_id` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE `payments` ADD COLUMN `bank_code` VARCHAR(20) NULL,
    ADD COLUMN `card_type` VARCHAR(20) NULL,
    ADD COLUMN `vnp_transaction_no` VARCHAR(50) NULL,
    MODIFY `amount` DECIMAL(15, 2) NOT NULL,
    MODIFY `transaction_id` VARCHAR(100) NULL;
