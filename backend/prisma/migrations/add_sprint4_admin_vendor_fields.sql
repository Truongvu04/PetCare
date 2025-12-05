-- Migration: Add Sprint 4 Admin & Vendor Module fields
-- Date: 2024-01-XX
-- Description: Add ProductStatus enum, product status fields, user is_active field

-- Step 1: Add ProductStatus enum (MySQL doesn't support CREATE TYPE, so we'll use ALTER TABLE with CHECK constraint)
-- Note: MySQL doesn't have native enum types like PostgreSQL, but Prisma handles this
-- The enum will be created when Prisma generates the migration

-- Step 2: Add status column to products table
ALTER TABLE `products` 
ADD COLUMN `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING' AFTER `category`,
ADD COLUMN `rejection_reason` TEXT NULL AFTER `status`;

-- Step 3: Add index on status for better query performance
CREATE INDEX `products_status_idx` ON `products` (`status`);

-- Step 4: Add is_active column to users table
ALTER TABLE `users` 
ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT TRUE AFTER `role`;

-- Step 5: Add index on is_active for better query performance
CREATE INDEX `users_is_active_idx` ON `users` (`is_active`);

-- Step 6: Set default status for existing products to APPROVED (assuming they were already approved)
-- Note: This runs AFTER the column is added, so all existing products will have status = 'PENDING' by default
-- We update them to APPROVED to maintain backward compatibility
UPDATE `products` SET `status` = 'APPROVED' WHERE `status` = 'PENDING';

