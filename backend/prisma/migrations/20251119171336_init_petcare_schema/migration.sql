-- CreateTable
CREATE TABLE `pets` (
    `id` CHAR(12) NOT NULL,
    `user_id` INTEGER NULL,
    `name` VARCHAR(100) NOT NULL,
    `species` VARCHAR(50) NOT NULL,
    `breed` VARCHAR(100) NULL,
    `age` INTEGER NULL,
    `weight` DECIMAL(5, 2) NULL,
    `vaccination` VARCHAR(100) NULL,
    `medical_history` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `photo_url` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `pets_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reminders` (
    `reminder_id` CHAR(25) NOT NULL,
    `pet_id` CHAR(12) NOT NULL,
    `type` ENUM('vaccination', 'vet_visit', 'feeding', 'grooming', 'medication', 'other') NOT NULL,
    `vaccination_type` VARCHAR(255) NULL,
    `feeding_time` TIME(0) NULL,
    `reminder_date` DATE NOT NULL,
    `frequency` ENUM('none', 'daily', 'weekly', 'monthly', 'yearly') NULL DEFAULT 'none',
    `status` ENUM('pending', 'done') NULL DEFAULT 'pending',
    `is_read` BOOLEAN NULL DEFAULT false,
    `is_instance` BOOLEAN NULL DEFAULT false,
    `email_sent` BOOLEAN NULL DEFAULT false,
    `created_at` TIMESTAMP(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
    `end_date` DATE NULL,

    INDEX `idx_reminders_created_at`(`created_at`),
    INDEX `idx_reminders_end_date`(`end_date`),
    INDEX `idx_reminders_frequency`(`frequency`),
    INDEX `idx_reminders_is_read`(`is_read`),
    INDEX `idx_reminders_pet_id`(`pet_id`),
    INDEX `idx_reminders_reminder_date`(`reminder_date`),
    PRIMARY KEY (`reminder_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coupon_usages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `coupon_id` INTEGER NOT NULL,
    `order_id` INTEGER NOT NULL,
    `used_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `coupon_usages_coupon_id_fkey`(`coupon_id`),
    INDEX `coupon_usages_order_id_fkey`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coupons` (
    `coupon_id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(100) NOT NULL,
    `discount_percent` FLOAT NULL,
    `discount_amount` FLOAT NULL,
    `vendor_id` INTEGER NULL,
    `rule_condition` TEXT NULL,
    `start_date` DATETIME(0) NULL,
    `end_date` DATETIME(0) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `code`(`code`),
    INDEX `coupons_vendor_id_fkey`(`vendor_id`),
    PRIMARY KEY (`coupon_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `quantity` INTEGER NULL DEFAULT 1,
    `price` FLOAT NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `order_items_order_id_fkey`(`order_id`),
    INDEX `order_items_product_id_fkey`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `order_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `vendor_id` INTEGER NOT NULL,
    `status` ENUM('pending', 'paid', 'shipped', 'cancelled', 'refunded') NULL DEFAULT 'pending',
    `payment_method` ENUM('momo', 'vnpay', 'zalopay') NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `shipping` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `subtotal` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `tax` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `total` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `shipping_address` VARCHAR(500) NULL,

    INDEX `orders_user_id_fkey`(`user_id`),
    INDEX `orders_vendor_id_fkey`(`vendor_id`),
    PRIMARY KEY (`order_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `otp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `code` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `payment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `amount` FLOAT NOT NULL,
    `method` ENUM('momo', 'vnpay', 'zalopay') NOT NULL,
    `status` ENUM('pending', 'success', 'fail') NULL DEFAULT 'pending',
    `transaction_id` VARCHAR(191) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `payments_order_id_fkey`(`order_id`),
    INDEX `payments_user_id_fkey`(`user_id`),
    PRIMARY KEY (`payment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `image_url` VARCHAR(1000) NOT NULL,
    `is_thumbnail` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `product_images_product_id_idx`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `product_id` INTEGER NOT NULL AUTO_INCREMENT,
    `vendor_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `price` FLOAT NOT NULL,
    `stock` INTEGER NULL DEFAULT 0,
    `category` VARCHAR(100) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `products_vendor_id_fkey`(`vendor_id`),
    PRIMARY KEY (`product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `review_id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NULL,
    `service_id` INTEGER NULL,
    `user_id` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `reviews_product_id_idx`(`product_id`),
    INDEX `reviews_service_id_idx`(`service_id`),
    INDEX `reviews_user_id_idx`(`user_id`),
    PRIMARY KEY (`review_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_appointments` (
    `appointment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `service_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `appointment_date` DATETIME(0) NOT NULL,
    `status` VARCHAR(50) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `service_appointments_service_id_idx`(`service_id`),
    INDEX `service_appointments_user_id_idx`(`user_id`),
    PRIMARY KEY (`appointment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `services` (
    `service_id` INTEGER NOT NULL AUTO_INCREMENT,
    `vendor_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `price` FLOAT NOT NULL,
    `duration` INTEGER NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `services_vendor_id_idx`(`vendor_id`),
    PRIMARY KEY (`service_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `role` ENUM('owner', 'vendor', 'admin') NOT NULL DEFAULT 'owner',
    `googleId` VARCHAR(191) NULL,
    `facebookId` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `avatar_url` VARCHAR(255) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_googleId_key`(`googleId`),
    UNIQUE INDEX `users_facebookId_key`(`facebookId`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendors` (
    `vendor_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `store_name` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `address` VARCHAR(255) NULL,
    `phone` VARCHAR(50) NULL,
    `logo_url` VARCHAR(255) NULL,
    `status` ENUM('pending', 'approved', 'rejected') NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `unique_user_vendor`(`user_id`),
    PRIMARY KEY (`vendor_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cart_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cart_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `quantity` INTEGER NULL DEFAULT 1,
    `price` FLOAT NOT NULL,
    `added_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `cart_items_cart_id_fkey`(`cart_id`),
    INDEX `cart_items_product_id_fkey`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `carts` (
    `cart_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `carts_user_id_fkey`(`user_id`),
    PRIMARY KEY (`cart_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pets` ADD CONSTRAINT `pets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reminders` ADD CONSTRAINT `reminders_ibfk_1` FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coupon_usages` ADD CONSTRAINT `coupon_usages_coupon_id_fkey` FOREIGN KEY (`coupon_id`) REFERENCES `coupons`(`coupon_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coupon_usages` ADD CONSTRAINT `coupon_usages_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coupons` ADD CONSTRAINT `coupons_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`vendor_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`vendor_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`vendor_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`service_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_appointments` ADD CONSTRAINT `service_appointments_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`service_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_appointments` ADD CONSTRAINT `service_appointments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `services` ADD CONSTRAINT `services_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`vendor_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendors` ADD CONSTRAINT `fk_vendor_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_cart_id_fkey` FOREIGN KEY (`cart_id`) REFERENCES `carts`(`cart_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carts` ADD CONSTRAINT `carts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
