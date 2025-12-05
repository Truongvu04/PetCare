-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: petcare
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('1cce9be4-8c60-425a-a527-254c196b63f0','e30a332438b1ace804270045571443229001ee4c9eee7b9584c0a9d082bf01fa','2025-12-05 10:47:59.566','20250115120000_add_vaccine_tables','',NULL,'2025-12-05 10:47:59.566',0),('1e4c210a-0ce8-4f29-b470-eef4d60390f5','05a34234cda1f88a9a9b857730225c14868d7169821ec1ced2390ee1fce48c5d','2025-12-05 10:48:11.855','20251120092715_update_payment_schema','',NULL,'2025-12-05 10:48:11.855',0),('40659f7a-838a-4e2f-9736-b697a319ce06','2e1d256cb0ce2c20c3a642f113bc900a21d38beb8cd4d4380c4d06a3ed29d977',NULL,'20251119171336_init_petcare_schema','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20251119171336_init_petcare_schema\n\nDatabase error code: 1050\n\nDatabase error:\nTable \'pets\' already exists\n\nPlease check the query number 1 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20251119171336_init_petcare_schema\"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name=\"20251119171336_init_petcare_schema\"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:260','2025-12-05 10:48:06.694','2025-11-27 10:38:46.658',0),('5e2d46bb-3d5f-454a-acfe-8540c2fa3a97','2e1d256cb0ce2c20c3a642f113bc900a21d38beb8cd4d4380c4d06a3ed29d977','2025-12-05 10:48:06.696','20251119171336_init_petcare_schema','',NULL,'2025-12-05 10:48:06.696',0),('cd5ec132-3c9e-4ff6-9082-5a618bdeae1c','a1a9c53d3e16a616740de88e1b8a8f87f6ccd768d854356304d274e595d13930','2025-11-27 10:38:41.489','20250101000000_add_sprint3_tables','',NULL,'2025-11-27 10:38:41.489',0);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calendar_events`
--

DROP TABLE IF EXISTS `calendar_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calendar_events` (
  `id` char(25) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pet_id` char(12) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `event_type` enum('vet_visit','expense','reminder') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `event_date` date NOT NULL,
  `related_expense_id` char(25) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `related_reminder_id` char(25) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `calendar_events_pet_id_idx` (`pet_id`),
  KEY `calendar_events_user_id_idx` (`user_id`),
  KEY `calendar_events_event_type_idx` (`event_type`),
  KEY `calendar_events_event_date_idx` (`event_date`),
  KEY `calendar_events_related_expense_id_fkey` (`related_expense_id`),
  CONSTRAINT `calendar_events_pet_id_fkey` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `calendar_events_related_expense_id_fkey` FOREIGN KEY (`related_expense_id`) REFERENCES `expenses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `calendar_events_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calendar_events`
--

LOCK TABLES `calendar_events` WRITE;
/*!40000 ALTER TABLE `calendar_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `calendar_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int DEFAULT '1',
  `price` float NOT NULL,
  `added_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cart_items_cart_id_fkey` (`cart_id`),
  KEY `cart_items_product_id_fkey` (`product_id`),
  CONSTRAINT `cart_items_cart_id_fkey` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`cart_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cart_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `cart_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_id`),
  KEY `carts_user_id_fkey` (`user_id`),
  CONSTRAINT `carts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (1,100,'2025-11-15 12:12:32','2025-11-27 00:52:21'),(2,101,'2025-11-15 12:42:57','2025-11-27 07:37:19'),(3,102,'2025-11-26 22:25:50','2025-11-27 00:53:20');
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_history`
--

DROP TABLE IF EXISTS `chat_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_history` (
  `id` char(25) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `pet_id` char(12) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `response` text COLLATE utf8mb4_unicode_ci,
  `is_user_message` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `chat_history_user_id_idx` (`user_id`),
  KEY `chat_history_pet_id_idx` (`pet_id`),
  KEY `chat_history_created_at_idx` (`created_at`),
  CONSTRAINT `chat_history_pet_id_fkey` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chat_history_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_history`
--

LOCK TABLES `chat_history` WRITE;
/*!40000 ALTER TABLE `chat_history` DISABLE KEYS */;
INSERT INTO `chat_history` VALUES ('cmioamo8o0001exmkaljtysjz',101,NULL,'ch├áo bß║ín',NULL,1,'2025-12-02 01:05:34.392000'),('cmioamo8z0003exmk2iniuedx',101,NULL,'Ch├áo bß║ín!\n\nT├┤i l├á trß╗ú l├╜ AI chuy├¬n vß╗ü ch─âm s├│c th├║ c╞░ng tß╗½ ß╗⌐ng dß╗Ñng PetCare+. Rß║Ñt vui ─æ╞░ß╗úc ─æß╗ông h├ánh c├╣ng bß║ín tr├¬n h├ánh tr├¼nh ch─âm s├│c nhß╗»ng ng╞░ß╗¥i bß║ín bß╗æn ch├ón ─æ├íng y├¬u! ≡ƒÿè\n\nHiß╗çn tß║íi bß║ín ch╞░a chß╗ìn th├║ c╞░ng cß╗Ñ thß╗â, nh╞░ng ─æß╗½ng lo lß║»ng, t├┤i lu├┤n sß║╡n l├▓ng cung cß║Ñp nhß╗»ng th├┤ng tin chung hß╗»u ├¡ch v├á lß╗¥i khuy├¬n thiß║┐t thß╗▒c.\n\nBß║ín cß║ºn t├┤i hß╗ù trß╗ú ─æiß╗üu g├¼ h├┤m nay? D├╣ l├á c├óu hß╗Åi vß╗ü c├ích chuß║⌐n bß╗ï khi ─æ├│n th├║ c╞░ng vß╗ü nh├á, chß║┐ ─æß╗Ö dinh d╞░ß╗íng, c├íc sß║ún phß║⌐m cß║ºn thiß║┐t, hay bß║Ñt kß╗│ thß║»c mß║»c n├áo kh├íc, t├┤i lu├┤n ß╗ƒ ─æ├óy ─æß╗â gi├║p ─æß╗í.\n\n─Éß╗â bß║ín c├│ mß╗Öt khß╗ƒi ─æß║ºu su├┤n sß║╗ v├á tiß╗çn lß╗úi, PetCare+ xin gß╗úi ├╜ mß╗Öt v├ái sß║ún phß║⌐m ─æa n─âng, ph├╣ hß╗úp cho mß╗ìi chß╗º nu├┤i mß╗¢i v├á hß║ºu hß║┐t c├íc loß║íi th├║ c╞░ng:\n\n*   **B├ít ─én Inox Chß╗æng Tr╞░ß╗út Premium** (150.000─æ): Mß╗Öt chiß║┐c b├ít bß╗ün ─æß║╣p, dß╗à vß╗ç sinh v├á gi├║p th├║ c╞░ng cß╗ºa bß║ín c├│ nhß╗»ng bß╗»a ─ân ß╗òn ─æß╗ïnh.\n*   **─É├ái Phun N╞░ß╗¢c Tß╗▒ ─Éß╗Öng 2.5L Lß╗ìc Than Hoß║ít T├¡nh** (685.000─æ): ─Éß║úm bß║úo th├║ c╞░ng lu├┤n c├│ nguß╗ôn n╞░ß╗¢c sß║ích v├á t╞░╞íi m├ít, khuyß║┐n kh├¡ch ch├║ng uß╗æng ─æß╗º n╞░ß╗¢c mß╗ùi ng├áy.\n*   **Gi╞░ß╗¥ng Ngß╗º Donut L├┤ng Nhung Sang Trß╗ìng** (435.000─æ): Mang lß║íi kh├┤ng gian ß║Ñm c├║ng, ├¬m ├íi v├á an to├án cho th├║ c╞░ng nghß╗ë ng╞íi sau mß╗Öt ng├áy d├ái vui ch╞íi.\n*   **Sß╗»a Tß║»m Th├║ C╞░ng Bio-Groom Khß╗¡ M├╣i 473ml** (185.000─æ): Gi├║p bß╗Ö l├┤ng cß╗ºa ng╞░ß╗¥i bß║ín nhß╗Å lu├┤n sß║ích sß║╜, mß╗üm m╞░ß╗út v├á th╞ím tho, ─æß╗ông thß╗¥i giß╗» da khß╗Åe mß║ính.\n*   **T├║i Vß║¡n Chuyß╗ân Th├║ C╞░ng ─Éa N─âng** (545.000─æ): Rß║Ñt tiß╗çn lß╗úi cho nhß╗»ng chuyß║┐n ─æi xa, th─âm kh├ím b├íc s─⌐ th├║ y hoß║╖c ─æ╞ín giß║ún l├á dß║ío ch╞íi c├╣ng th├║ c╞░ng.\n\nBß║ín c├│ c├óu hß╗Åi cß╗Ñ thß╗â n├áo vß╗ü viß╗çc nu├┤i th├║ c╞░ng kh├┤ng? Hoß║╖c bß║ín ─æang c├ón nhß║»c nu├┤i loß║íi th├║ c╞░ng n├áo? H├úy chia sß║╗ ─æß╗â t├┤i c├│ thß╗â t╞░ vß║Ñn chi tiß║┐t v├á hß╗»u ├¡ch h╞ín nh├⌐! T├┤i lu├┤n sß║╡n s├áng lß║»ng nghe!','Ch├áo bß║ín!\n\nT├┤i l├á trß╗ú l├╜ AI chuy├¬n vß╗ü ch─âm s├│c th├║ c╞░ng tß╗½ ß╗⌐ng dß╗Ñng PetCare+. Rß║Ñt vui ─æ╞░ß╗úc ─æß╗ông h├ánh c├╣ng bß║ín tr├¬n h├ánh tr├¼nh ch─âm s├│c nhß╗»ng ng╞░ß╗¥i bß║ín bß╗æn ch├ón ─æ├íng y├¬u! ≡ƒÿè\n\nHiß╗çn tß║íi bß║ín ch╞░a chß╗ìn th├║ c╞░ng cß╗Ñ thß╗â, nh╞░ng ─æß╗½ng lo lß║»ng, t├┤i lu├┤n sß║╡n l├▓ng cung cß║Ñp nhß╗»ng th├┤ng tin chung hß╗»u ├¡ch v├á lß╗¥i khuy├¬n thiß║┐t thß╗▒c.\n\nBß║ín cß║ºn t├┤i hß╗ù trß╗ú ─æiß╗üu g├¼ h├┤m nay? D├╣ l├á c├óu hß╗Åi vß╗ü c├ích chuß║⌐n bß╗ï khi ─æ├│n th├║ c╞░ng vß╗ü nh├á, chß║┐ ─æß╗Ö dinh d╞░ß╗íng, c├íc sß║ún phß║⌐m cß║ºn thiß║┐t, hay bß║Ñt kß╗│ thß║»c mß║»c n├áo kh├íc, t├┤i lu├┤n ß╗ƒ ─æ├óy ─æß╗â gi├║p ─æß╗í.\n\n─Éß╗â bß║ín c├│ mß╗Öt khß╗ƒi ─æß║ºu su├┤n sß║╗ v├á tiß╗çn lß╗úi, PetCare+ xin gß╗úi ├╜ mß╗Öt v├ái sß║ún phß║⌐m ─æa n─âng, ph├╣ hß╗úp cho mß╗ìi chß╗º nu├┤i mß╗¢i v├á hß║ºu hß║┐t c├íc loß║íi th├║ c╞░ng:\n\n*   **B├ít ─én Inox Chß╗æng Tr╞░ß╗út Premium** (150.000─æ): Mß╗Öt chiß║┐c b├ít bß╗ün ─æß║╣p, dß╗à vß╗ç sinh v├á gi├║p th├║ c╞░ng cß╗ºa bß║ín c├│ nhß╗»ng bß╗»a ─ân ß╗òn ─æß╗ïnh.\n*   **─É├ái Phun N╞░ß╗¢c Tß╗▒ ─Éß╗Öng 2.5L Lß╗ìc Than Hoß║ít T├¡nh** (685.000─æ): ─Éß║úm bß║úo th├║ c╞░ng lu├┤n c├│ nguß╗ôn n╞░ß╗¢c sß║ích v├á t╞░╞íi m├ít, khuyß║┐n kh├¡ch ch├║ng uß╗æng ─æß╗º n╞░ß╗¢c mß╗ùi ng├áy.\n*   **Gi╞░ß╗¥ng Ngß╗º Donut L├┤ng Nhung Sang Trß╗ìng** (435.000─æ): Mang lß║íi kh├┤ng gian ß║Ñm c├║ng, ├¬m ├íi v├á an to├án cho th├║ c╞░ng nghß╗ë ng╞íi sau mß╗Öt ng├áy d├ái vui ch╞íi.\n*   **Sß╗»a Tß║»m Th├║ C╞░ng Bio-Groom Khß╗¡ M├╣i 473ml** (185.000─æ): Gi├║p bß╗Ö l├┤ng cß╗ºa ng╞░ß╗¥i bß║ín nhß╗Å lu├┤n sß║ích sß║╜, mß╗üm m╞░ß╗út v├á th╞ím tho, ─æß╗ông thß╗¥i giß╗» da khß╗Åe mß║ính.\n*   **T├║i Vß║¡n Chuyß╗ân Th├║ C╞░ng ─Éa N─âng** (545.000─æ): Rß║Ñt tiß╗çn lß╗úi cho nhß╗»ng chuyß║┐n ─æi xa, th─âm kh├ím b├íc s─⌐ th├║ y hoß║╖c ─æ╞ín giß║ún l├á dß║ío ch╞íi c├╣ng th├║ c╞░ng.\n\nBß║ín c├│ c├óu hß╗Åi cß╗Ñ thß╗â n├áo vß╗ü viß╗çc nu├┤i th├║ c╞░ng kh├┤ng? Hoß║╖c bß║ín ─æang c├ón nhß║»c nu├┤i loß║íi th├║ c╞░ng n├áo? H├úy chia sß║╗ ─æß╗â t├┤i c├│ thß╗â t╞░ vß║Ñn chi tiß║┐t v├á hß╗»u ├¡ch h╞ín nh├⌐! T├┤i lu├┤n sß║╡n s├áng lß║»ng nghe!',0,'2025-12-02 01:05:34.404000'),('cmioasxye0001exzos0jka2a6',101,'1c54f12dac08','bß║ín c├│ t╞░ vß║Ñn cho t├┤i c├ích nu├┤i lo├ái ch├│ n├áy kh├┤ng',NULL,1,'2025-12-02 01:10:26.918000'),('cmioasxyp0003exzojk7jtigz',101,'1c54f12dac08','Ch├áo bß║ín! Rß║Ñt vui ─æ╞░ß╗úc hß╗ù trß╗ú bß║ín ch─âm s├│c ng╞░ß╗¥i bß║ín bß╗æn ch├ón ─æ├íng y├¬u Milo.\n\nMilo l├á mß╗Öt ch├║ ch├│ Golden Retriever 3 tuß╗òi, mß╗Öt giß╗æng ch├│ tuyß╗çt vß╗¥i vß╗¢i t├¡nh c├ích th├ón thiß╗çn, th├┤ng minh v├á tr├án ─æß║ºy n─âng l╞░ß╗úng. ─Éß╗â Milo lu├┤n khß╗Åe mß║ính v├á hß║ính ph├║c, ─æ├óy l├á mß╗Öt sß╗æ lß╗¥i khuy├¬n chuy├¬n biß╗çt tß╗½ PetCare+ d├ánh cho bß║ín:\n\n---\n\n### **1. Dinh d╞░ß╗íng Ph├╣ hß╗úp cho Milo**\n\n*   **─É├ính gi├í c├ón nß║╖ng (Rß║Ñt quan trß╗ìng):** Dß╗▒a tr├¬n th├┤ng tin bß║ín cung cß║Ñp, Milo hiß╗çn nß║╖ng **5.67 kg**. ─É├óy l├á mß╗⌐c c├ón nß║╖ng **rß║Ñt thß║Ñp** so vß╗¢i ti├¬u chuß║⌐n cß╗ºa mß╗Öt ch├║ ch├│ Golden Retriever tr╞░ß╗ƒng th├ánh (th├┤ng th╞░ß╗¥ng khoß║úng 25-34 kg ─æß╗æi vß╗¢i ch├│ c├íi v├á 29-34 kg ─æß╗æi vß╗¢i ch├│ ─æß╗▒c).\n    *   **Khuyß║┐n nghß╗ï khß║⌐n cß║Ñp:** Ch├║ng t├┤i **khuy├¬n bß║ín n├¬n ─æ╞░a Milo ─æß║┐n th─âm b├íc s─⌐ th├║ y sß╗¢m nhß║Ñt c├│ thß╗â** ─æß╗â kiß╗âm tra sß╗⌐c khß╗Åe tß╗òng qu├ít. B├íc s─⌐ th├║ y sß║╜ gi├║p x├íc ─æß╗ïnh nguy├¬n nh├ón cß╗ºa t├¼nh trß║íng c├ón nß║╖ng thß║Ñp n├áy v├á c├│ kß║┐ hoß║ích t─âng c├ón an to├án, ph├╣ hß╗úp cho Milo, c┼⌐ng nh╞░ t╞░ vß║Ñn chß║┐ ─æß╗Ö ─ân v├á khß║⌐u phß║ºn ─ân ch├¡nh x├íc.\n*   **Thß╗⌐c ─ân hß║ít:** ─Éß╗æi vß╗¢i mß╗Öt ch├║ ch├│ tr╞░ß╗ƒng th├ánh 3 tuß╗òi nh╞░ Milo, bß║ín n├¬n chß╗ìn loß║íi thß╗⌐c ─ân hß║ít d├ánh cho ch├│ tr╞░ß╗ƒng th├ánh, c├│ ─æß║ºy ─æß╗º dinh d╞░ß╗íng ─æß╗â duy tr├¼ n─âng l╞░ß╗úng v├á sß╗⌐c khß╗Åe tß╗òng thß╗â.\n    *   **PetCare+ gß╗úi ├╜:** **Thß╗⌐c ─ân hß║ít Royal Canin Fit 32 (320.000─æ)** l├á mß╗Öt lß╗▒a chß╗ìn tß╗æt, ─æ╞░ß╗úc thiß║┐t kß║┐ ─æß╗â cung cß║Ñp ─æß║ºy ─æß╗º d╞░ß╗íng chß║Ñt cho ch├│ tr╞░ß╗ƒng th├ánh c├│ mß╗⌐c ─æß╗Ö hoß║ít ─æß╗Öng vß╗½a phß║úi.\n*   **Khß║⌐u phß║ºn v├á n╞░ß╗¢c uß╗æng:** Sau khi tham khß║úo ├╜ kiß║┐n b├íc s─⌐ th├║ y vß╗ü khß║⌐u phß║ºn ─ân ph├╣ hß╗úp, h├úy ─æß║úm bß║úo bß║ín cho Milo ─ân ─æ├║ng liß╗üu l╞░ß╗úng. Lu├┤n cung cß║Ñp ─æß╗º n╞░ß╗¢c sß║ích, t╞░╞íi mß╗¢i cho Milo cß║ú ng├áy.\n    *   **Sß║ún phß║⌐m ─æß╗ü xuß║Ñt:**\n        *   **B├ít ─én Inox Chß╗æng Tr╞░ß╗út Premium (150.000─æ)**: Gi├║p Milo ─ân uß╗æng thoß║úi m├íi v├á giß╗» vß╗ç sinh.\n        *   **─É├ái Phun N╞░ß╗¢c Tß╗▒ ─Éß╗Öng 2.5L Lß╗ìc Than Hoß║ít T├¡nh (685.000─æ)**: ─Éß║úm bß║úo Milo lu├┤n c├│ nguß╗ôn n╞░ß╗¢c sß║ích, t╞░╞íi ngon ─æß╗â uß╗æng, khuyß║┐n kh├¡ch b├⌐ uß╗æng ─æß╗º n╞░ß╗¢c.\n\n---\n\n### **2. Vß║¡n ─æß╗Öng v├á Giß║úi tr├¡**\n\n*   **Nhu cß║ºu vß║¡n ─æß╗Öng cao:** Golden Retriever l├á giß╗æng ch├│ rß║Ñt n─âng ─æß╗Öng v├á cß║ºn ─æ╞░ß╗úc vß║¡n ─æß╗Öng nhiß╗üu ─æß╗â giß║úi tß╗Åa n─âng l╞░ß╗úng, tr├ính b├⌐o ph├¼ (sau khi ─æ├ú ─æß║ít c├ón nß║╖ng chuß║⌐n) v├á c├íc vß║Ñn ─æß╗ü h├ánh vi.\n    *   ─Éß║úm bß║úo Milo ─æ╞░ß╗úc ─æi dß║ío ├¡t nhß║Ñt 2 lß║ºn/ng├áy, mß╗ùi lß║ºn khoß║úng 30-60 ph├║t. C├íc hoß║ít ─æß╗Öng nh╞░ chß║íy bß╗Ö, ch╞íi ─æ├╣a (n├⌐m b├│ng, frisbee), b╞íi lß╗Öi c┼⌐ng rß║Ñt tß╗æt cho giß╗æng ch├│ n├áy.\n*   **K├¡ch th├¡ch tr├¡ n├úo:** Golden Retrievers rß║Ñt th├┤ng minh, h├úy cho Milo ch╞íi c├íc tr├▓ ch╞íi giß║úi ─æß╗æ hoß║╖c tham gia c├íc buß╗òi huß║Ñn luyß╗çn ─æß╗â giß╗» cho tinh thß║ºn b├⌐ lu├┤n minh mß║½n.\n    *   **Sß║ún phß║⌐m ─æß╗ü xuß║Ñt:**\n        *   **Bß╗Ö D├óy Dß║»t & V├▓ng Cß╗ò Phß║ún Quang Chß╗æng Giß║¡t (289.000─æ)**: Gi├║p bß║ín dß╗à d├áng kiß╗âm so├ít Milo trong c├íc buß╗òi ─æi dß║ío, ─æß╗ông thß╗¥i t─âng c╞░ß╗¥ng an to├án vß╗¢i khß║ú n─âng phß║ún quang.\n        *   **Bß╗Ö 2 B├│ng Cao Su Chß╗æng Nhai Cho Ch├│ (169.000─æ)**: L├á m├│n ─æß╗ô ch╞íi l├╜ t╞░ß╗ƒng gi├║p Milo giß║úi tß╗Åa n─âng l╞░ß╗úng v├á thß╗Åa m├ún bß║ún n─âng nhai.\n\n---\n\n### **3. Ch─âm s├│c L├┤ng v├á Vß╗ç sinh**\n\n*   **Ch─âm s├│c l├┤ng:** Golden Retriever c├│ bß╗Ö l├┤ng k├⌐p d├áy v├á rß╗Ñng l├┤ng kh├í nhiß╗üu, ─æß║╖c biß╗çt l├á v├áo m├╣a thay l├┤ng.\n    *   Chß║úi l├┤ng cho Milo 2-3 lß║ºn/tuß║ºn (thß║¡m ch├¡ h├áng ng├áy v├áo m├╣a thay l├┤ng) ─æß╗â loß║íi bß╗Å l├┤ng chß║┐t, tr├ính rß╗æi l├┤ng v├á giß╗» cho bß╗Ö l├┤ng lu├┤n b├│ng m╞░ß╗út.\n*   **Tß║»m rß╗¡a:** Tß║»m cho Milo khoß║úng 4-6 tuß║ºn mß╗Öt lß║ºn hoß║╖c khi b├⌐ bß╗ï bß║⌐n. Sß╗¡ dß╗Ñng sß╗»a tß║»m chuy├¬n dß╗Ñng cho ch├│ ─æß╗â kh├┤ng l├ám kh├┤ da v├á l├┤ng.\n    *   **Sß║ún phß║⌐m ─æß╗ü xuß║Ñt:** **Sß╗»a Tß║»m Th├║ C╞░ng Bio-Groom Khß╗¡ M├╣i 473ml (185.000─æ)** sß║╜ gi├║p giß╗» bß╗Ö l├┤ng cß╗ºa Milo lu├┤n sß║ích sß║╜ v├á th╞ím tho.\n*   **Vß╗ç sinh kh├íc:**\n    *   **Cß║»t m├│ng:** Cß║»t m├│ng ─æß╗ïnh kß╗│ 2-4 tuß║ºn mß╗Öt lß║ºn ─æß╗â tr├ính m├│ng qu├í d├ái g├óy kh├│ chß╗ïu hoß║╖c tß╗òn th╞░╞íng cho Milo.\n        *   **Sß║ún phß║⌐m ─æß╗ü xuß║Ñt:** **K├¼m Cß║»t M├│ng Chuy├¬n Nghiß╗çp Epica Pro (195.000─æ)** gi├║p bß║ín cß║»t m├│ng an to├án v├á hiß╗çu quß║ú.\n    *   **Vß╗ç sinh r─âng miß╗çng:** Chß║úi r─âng cho Milo v├ái lß║ºn mß╗ùi tuß║ºn v├á sß╗¡ dß╗Ñng c├íc loß║íi snack l├ám sß║ích r─âng ─æß╗â ng─ân ngß╗½a mß║úng b├ím v├á c├íc bß╗çnh vß╗ü r─âng miß╗çng.\n        *   **Sß║ún phß║⌐m ─æß╗ü xuß║Ñt:** **Snack L├ám Sß║ích R─âng Greenies 340g (295.000─æ)** l├á mß╗Öt c├ích tuyß╗çt vß╗¥i ─æß╗â hß╗ù trß╗ú vß╗ç sinh r─âng miß╗çng h├áng ng├áy cho Milo.\n    *   Kiß╗âm tra tai v├á mß║»t th╞░ß╗¥ng xuy├¬n ─æß╗â ph├ít hiß╗çn sß╗¢m c├íc dß║Ñu hiß╗çu vi├¬m nhiß╗àm.\n\n---\n\n### **4. Huß║Ñn luyß╗çn v├á X├ú hß╗Öi h├│a**\n\n*   **Dß╗à huß║Ñn luyß╗çn:** Golden Retriever rß║Ñt th├┤ng minh v├á ham hß╗ìc hß╗Åi, n├¬n viß╗çc huß║Ñn luyß╗çn c╞í bß║ún (ngß╗ôi, nß║▒m, ß╗ƒ y├¬n, ─æi theo lß╗çnh) sß║╜ kh├í dß╗à d├áng.\n*   **X├ú hß╗Öi h├│a:** Tiß║┐p x├║c Milo vß╗¢i nhiß╗üu ng╞░ß╗¥i, vß║¡t nu├┤i v├á m├┤i tr╞░ß╗¥ng kh├íc nhau tß╗½ khi c├▓n nhß╗Å gi├║p b├⌐ trß╗ƒ n├¬n tß╗▒ tin v├á th├ón thiß╗çn h╞ín.\n\n---\n\n### **5. Ch─âm s├│c Sß╗⌐c khß╗Åe**\n\n*   **Kh├ím sß╗⌐c khß╗Åe ─æß╗ïnh kß╗│:** ─É╞░a Milo ─æi kh├ím b├íc s─⌐ th├║ y ├¡t nhß║Ñt 1 lß║ºn/n─âm ─æß╗â ti├¬m ph├▓ng nhß║»c lß║íi, tß║⌐y giun, kiß╗âm tra sß╗⌐c khß╗Åe tß╗òng qu├ít v├á sß╗¢m ph├ít hiß╗çn c├íc vß║Ñn ─æß╗ü tiß╗üm ß║⌐n.\n*   **Kiß╗âm so├ít ve, bß╗ì ch├⌐t:** Sß╗¡ dß╗Ñng c├íc sß║ún phß║⌐m ph├▓ng v├á trß╗ï ve, bß╗ì ch├⌐t ─æß╗ïnh kß╗│ theo chß╗ë dß║½n cß╗ºa b├íc s─⌐.\n*   **L╞░u ├╜ bß╗çnh di truyß╗ün:** Golden Retriever c├│ thß╗â dß╗à mß║»c mß╗Öt sß╗æ bß╗çnh di truyß╗ün nh╞░ loß║ín sß║ún x╞░╞íng h├┤ng v├á khuß╗╖u tay, c├íc bß╗çnh vß╗ü mß║»t hoß║╖c tim. Viß╗çc kh├ím sß╗⌐c khß╗Åe ─æß╗ïnh kß╗│ gi├║p ph├ít hiß╗çn v├á quß║ún l├╜ sß╗¢m c├íc t├¼nh trß║íng n├áy.\n    *   **Mß╗Öt lß║ºn nß╗»a, h├úy ╞░u ti├¬n ─æ╞░a Milo ─æi kiß╗âm tra c├ón nß║╖ng v├á sß╗⌐c khß╗Åe tß╗òng thß╗â vß╗¢i b├íc s─⌐ th├║ y ngay bß║ín nh├⌐!**\n\n---\n\n### **6. Kh├┤ng gian nghß╗ë ng╞íi**\n\n*   ─Éß║úm bß║úo Milo c├│ mß╗Öt chß╗ù ngß╗º thoß║úi m├íi, an to├án v├á sß║ích sß║╜, tr├ính xa gi├│ l├╣a hoß║╖c n╞íi qu├í n├│ng.\n    *   **Sß║ún phß║⌐m ─æß╗ü xuß║Ñt:** **Gi╞░ß╗¥ng Ngß╗º Donut L├┤ng Nhung Sang Trß╗ìng (435.000─æ)** sß║╜ mang lß║íi cho Milo mß╗Öt kh├┤ng gian ß║Ñm c├║ng v├á ├¬m ├íi ─æß╗â nghß╗ë ng╞íi sau nhß╗»ng giß╗¥ vui ch╞íi.\n\n---\n\n### **Lß╗¥i nhß║»c sß║»p tß╗¢i:**\n\nHiß╗çn tß║íi, PetCare+ ch╞░a c├│ lß╗¥i nhß║»c n├áo sß║»p tß╗¢i cho Milo. Bß║ín c├│ muß╗æn thiß║┐t lß║¡p lß╗¥i nhß║»c vß╗ü lß╗ïch ti├¬m ph├▓ng, tß║⌐y giun, kiß╗âm so├ít ve rß║¡n hay c├íc cuß╗Öc hß║╣n kh├ím ─æß╗ïnh kß╗│ kh├┤ng? Ch├║ng t├┤i rß║Ñt sß║╡n l├▓ng gi├║p bß║ín!\n\n---\n\nHy vß╗ìng nhß╗»ng lß╗¥i khuy├¬n chi tiß║┐t n├áy sß║╜ hß╗»u ├¡ch cho bß║ín v├á Milo. Nß║┐u bß║ín c├│ bß║Ñt kß╗│ c├óu hß╗Åi n├áo kh├íc hoß║╖c cß║ºn t╞░ vß║Ñn th├¬m, ─æß╗½ng ngß║ºn ngß║íi hß╗Åi PetCare+ nh├⌐! Ch├║c bß║ín v├á Milo lu├┤n vui vß║╗ v├á khß╗Åe mß║ính!','Ch├áo bß║ín! Rß║Ñt vui ─æ╞░ß╗úc hß╗ù trß╗ú bß║ín ch─âm s├│c ng╞░ß╗¥i bß║ín bß╗æn ch├ón ─æ├íng y├¬u Milo.\n\nMilo l├á mß╗Öt ch├║ ch├│ Golden Retriever 3 tuß╗òi, mß╗Öt giß╗æng ch├│ tuyß╗çt vß╗¥i vß╗¢i t├¡nh c├ích th├ón thiß╗çn, th├┤ng minh v├á tr├án ─æß║ºy n─âng l╞░ß╗úng. ─Éß╗â Milo lu├┤n khß╗Åe mß║ính v├á hß║ính ph├║c, ─æ├óy l├á mß╗Öt sß╗æ lß╗¥i khuy├¬n chuy├¬n biß╗çt tß╗½ PetCare+ d├ánh cho bß║ín:\n\n---\n\n### **1. Dinh d╞░ß╗íng Ph├╣ hß╗úp cho Milo**\n\n*   **─É├ính gi├í c├ón nß║╖ng (Rß║Ñt quan trß╗ìng):** Dß╗▒a tr├¬n th├┤ng tin bß║ín cung cß║Ñp, Milo hiß╗çn nß║╖ng **5.67 kg**. ─É├óy l├á mß╗⌐c c├ón nß║╖ng **rß║Ñt thß║Ñp** so vß╗¢i ti├¬u chuß║⌐n cß╗ºa mß╗Öt ch├║ ch├│ Golden Retriever tr╞░ß╗ƒng th├ánh (th├┤ng th╞░ß╗¥ng khoß║úng 25-34 kg ─æß╗æi vß╗¢i ch├│ c├íi v├á 29-34 kg ─æß╗æi vß╗¢i ch├│ ─æß╗▒c).\n    *   **Khuyß║┐n nghß╗ï khß║⌐n cß║Ñp:** Ch├║ng t├┤i **khuy├¬n bß║ín n├¬n ─æ╞░a Milo ─æß║┐n th─âm b├íc s─⌐ th├║ y sß╗¢m nhß║Ñt c├│ thß╗â** ─æß╗â kiß╗âm tra sß╗⌐c khß╗Åe tß╗òng qu├ít. B├íc s─⌐ th├║ y sß║╜ gi├║p x├íc ─æß╗ïnh nguy├¬n nh├ón cß╗ºa t├¼nh trß║íng c├ón nß║╖ng thß║Ñp n├áy v├á c├│ kß║┐ hoß║ích t─âng c├ón an to├án, ph├╣ hß╗úp cho Milo, c┼⌐ng nh╞░ t╞░ vß║Ñn chß║┐ ─æß╗Ö ─ân v├á khß║⌐u phß║ºn ─ân ch├¡nh x├íc.\n*   **Thß╗⌐c ─ân hß║ít:** ─Éß╗æi vß╗¢i mß╗Öt ch├║ ch├│ tr╞░ß╗ƒng th├ánh 3 tuß╗òi nh╞░ Milo, bß║ín n├¬n chß╗ìn loß║íi thß╗⌐c ─ân hß║ít d├ánh cho ch├│ tr╞░ß╗ƒng th├ánh, c├│ ─æß║ºy ─æß╗º dinh d╞░ß╗íng ─æß╗â duy tr├¼ n─âng l╞░ß╗úng v├á sß╗⌐c khß╗Åe tß╗òng thß╗â.\n    *   **PetCare+ gß╗úi ├╜:** **Thß╗⌐c ─ân hß║ít Royal Canin Fit 32 (320.000─æ)** l├á mß╗Öt lß╗▒a chß╗ìn tß╗æt, ─æ╞░ß╗úc thiß║┐t kß║┐ ─æß╗â cung cß║Ñp ─æß║ºy ─æß╗º d╞░ß╗íng chß║Ñt cho ch├│ tr╞░ß╗ƒng th├ánh c├│ mß╗⌐c ─æß╗Ö hoß║ít ─æß╗Öng vß╗½a phß║úi.\n*   **Khß║⌐u phß║ºn v├á n╞░ß╗¢c uß╗æng:** Sau khi tham khß║úo ├╜ kiß║┐n b├íc s─⌐ th├║ y vß╗ü khß║⌐u phß║ºn ─ân ph├╣ hß╗úp, h├úy ─æß║úm bß║úo bß║ín cho Milo ─ân ─æ├║ng liß╗üu l╞░ß╗úng. Lu├┤n cung cß║Ñp ─æß╗º n╞░ß╗¢c sß║ích, t╞░╞íi mß╗¢i cho Milo cß║ú ng├áy.\n    *   **Sß║ún phß║⌐m ─æß╗ü xuß║Ñt:**\n        *   **B├ít ─én Inox Chß╗æng Tr╞░ß╗út Premium (150.000─æ)**: Gi├║p Milo ─ân uß╗æng thoß║úi m├íi v├á giß╗» vß╗ç sinh.\n        *   **─É├ái Phun N╞░ß╗¢c Tß╗▒ ─Éß╗Öng 2.5L Lß╗ìc Than Hoß║ít T├¡nh (685.000─æ)**: ─Éß║úm bß║úo Milo lu├┤n c├│ nguß╗ôn n╞░ß╗¢c sß║ích, t╞░╞íi ngon ─æß╗â uß╗æng, khuyß║┐n kh├¡ch b├⌐ uß╗æng ─æß╗º n╞░ß╗¢c.\n\n---\n\n### **2. Vß║¡n ─æß╗Öng v├á Giß║úi tr├¡**\n\n*   **Nhu cß║ºu vß║¡n ─æß╗Öng cao:** Golden Retriever l├á giß╗æng ch├│ rß║Ñt n─âng ─æß╗Öng v├á cß║ºn ─æ╞░ß╗úc vß║¡n ─æß╗Öng nhiß╗üu ─æß╗â giß║úi tß╗Åa n─âng l╞░ß╗úng, tr├ính b├⌐o ph├¼ (sau khi ─æ├ú ─æß║ít c├ón nß║╖ng chuß║⌐n) v├á c├íc vß║Ñn ─æß╗ü h├ánh vi.\n    *   ─Éß║úm bß║úo Milo ─æ╞░ß╗úc ─æi dß║ío ├¡t nhß║Ñt 2 lß║ºn/ng├áy, mß╗ùi lß║ºn khoß║úng 30-60 ph├║t. C├íc hoß║ít ─æß╗Öng nh╞░ chß║íy bß╗Ö, ch╞íi ─æ├╣a (n├⌐m b├│ng, frisbee), b╞íi lß╗Öi c┼⌐ng rß║Ñt tß╗æt cho giß╗æng ch├│ n├áy.\n*   **K├¡ch th├¡ch tr├¡ n├úo:** Golden Retrievers rß║Ñt th├┤ng minh, h├úy cho Milo ch╞íi c├íc tr├▓ ch╞íi giß║úi ─æß╗æ hoß║╖c tham gia c├íc buß╗òi huß║Ñn luyß╗çn ─æß╗â giß╗» cho tinh thß║ºn b├⌐ lu├┤n minh mß║½n.\n    *   **Sß║ún phß║⌐m ─æß╗ü xuß║Ñt:**\n        *   **Bß╗Ö D├óy Dß║»t & V├▓ng Cß╗ò Phß║ún Quang Chß╗æng Giß║¡t (289.000─æ)**: Gi├║p bß║ín dß╗à d├áng kiß╗âm so├ít Milo trong c├íc buß╗òi ─æi dß║ío, ─æß╗ông thß╗¥i t─âng c╞░ß╗¥ng an to├án vß╗¢i khß║ú n─âng phß║ún quang.\n        *   **Bß╗Ö 2 B├│ng Cao Su Chß╗æng Nhai Cho Ch├│ (169.000─æ)**: L├á m├│n ─æß╗ô ch╞íi l├╜ t╞░ß╗ƒng gi├║p Milo giß║úi tß╗Åa n─âng l╞░ß╗úng v├á thß╗Åa m├ún bß║ún n─âng nhai.\n\n---\n\n### **3. Ch─âm s├│c L├┤ng v├á Vß╗ç sinh**\n\n*   **Ch─âm s├│c l├┤ng:** Golden Retriever c├│ bß╗Ö l├┤ng k├⌐p d├áy v├á rß╗Ñng l├┤ng kh├í nhiß╗üu, ─æß║╖c biß╗çt l├á v├áo m├╣a thay l├┤ng.\n    *   Chß║úi l├┤ng cho Milo 2-3 lß║ºn/tuß║ºn (thß║¡m ch├¡ h├áng ng├áy v├áo m├╣a thay l├┤ng) ─æß╗â loß║íi bß╗Å l├┤ng chß║┐t, tr├ính rß╗æi l├┤ng v├á giß╗» cho bß╗Ö l├┤ng lu├┤n b├│ng m╞░ß╗út.\n*   **Tß║»m rß╗¡a:** Tß║»m cho Milo khoß║úng 4-6 tuß║ºn mß╗Öt lß║ºn hoß║╖c khi b├⌐ bß╗ï bß║⌐n. Sß╗¡ dß╗Ñng sß╗»a tß║»m chuy├¬n dß╗Ñng cho ch├│ ─æß╗â kh├┤ng l├ám kh├┤ da v├á l├┤ng.\n    *   **Sß║ún phß║⌐m ─æß╗ü xuß║Ñt:** **Sß╗»a Tß║»m Th├║ C╞░ng Bio-Groom Khß╗¡ M├╣i 473ml (185.000─æ)** sß║╜ gi├║p giß╗» bß╗Ö l├┤ng cß╗ºa Milo lu├┤n sß║ích sß║╜ v├á th╞ím tho.\n*   **Vß╗ç sinh kh├íc:**\n    *   **Cß║»t m├│ng:** Cß║»t m├│ng ─æß╗ïnh kß╗│ 2-4 tuß║ºn mß╗Öt lß║ºn ─æß╗â tr├ính m├│ng qu├í d├ái g├óy kh├│ chß╗ïu hoß║╖c tß╗òn th╞░╞íng cho Milo.\n        *   **Sß║ún phß║⌐m ─æß╗ü xuß║Ñt:** **K├¼m Cß║»t M├│ng Chuy├¬n Nghiß╗çp Epica Pro (195.000─æ)** gi├║p bß║ín cß║»t m├│ng an to├án v├á hiß╗çu quß║ú.\n    *   **Vß╗ç sinh r─âng miß╗çng:** Chß║úi r─âng cho Milo v├ái lß║ºn mß╗ùi tuß║ºn v├á sß╗¡ dß╗Ñng c├íc loß║íi snack l├ám sß║ích r─âng ─æß╗â ng─ân ngß╗½a mß║úng b├ím v├á c├íc bß╗çnh vß╗ü r─âng miß╗çng.\n        *   **Sß║ún phß║⌐m ─æß╗ü xuß║Ñt:** **Snack L├ám Sß║ích R─âng Greenies 340g (295.000─æ)** l├á mß╗Öt c├ích tuyß╗çt vß╗¥i ─æß╗â hß╗ù trß╗ú vß╗ç sinh r─âng miß╗çng h├áng ng├áy cho Milo.\n    *   Kiß╗âm tra tai v├á mß║»t th╞░ß╗¥ng xuy├¬n ─æß╗â ph├ít hiß╗çn sß╗¢m c├íc dß║Ñu hiß╗çu vi├¬m nhiß╗àm.\n\n---\n\n### **4. Huß║Ñn luyß╗çn v├á X├ú hß╗Öi h├│a**\n\n*   **Dß╗à huß║Ñn luyß╗çn:** Golden Retriever rß║Ñt th├┤ng minh v├á ham hß╗ìc hß╗Åi, n├¬n viß╗çc huß║Ñn luyß╗çn c╞í bß║ún (ngß╗ôi, nß║▒m, ß╗ƒ y├¬n, ─æi theo lß╗çnh) sß║╜ kh├í dß╗à d├áng.\n*   **X├ú hß╗Öi h├│a:** Tiß║┐p x├║c Milo vß╗¢i nhiß╗üu ng╞░ß╗¥i, vß║¡t nu├┤i v├á m├┤i tr╞░ß╗¥ng kh├íc nhau tß╗½ khi c├▓n nhß╗Å gi├║p b├⌐ trß╗ƒ n├¬n tß╗▒ tin v├á th├ón thiß╗çn h╞ín.\n\n---\n\n### **5. Ch─âm s├│c Sß╗⌐c khß╗Åe**\n\n*   **Kh├ím sß╗⌐c khß╗Åe ─æß╗ïnh kß╗│:** ─É╞░a Milo ─æi kh├ím b├íc s─⌐ th├║ y ├¡t nhß║Ñt 1 lß║ºn/n─âm ─æß╗â ti├¬m ph├▓ng nhß║»c lß║íi, tß║⌐y giun, kiß╗âm tra sß╗⌐c khß╗Åe tß╗òng qu├ít v├á sß╗¢m ph├ít hiß╗çn c├íc vß║Ñn ─æß╗ü tiß╗üm ß║⌐n.\n*   **Kiß╗âm so├ít ve, bß╗ì ch├⌐t:** Sß╗¡ dß╗Ñng c├íc sß║ún phß║⌐m ph├▓ng v├á trß╗ï ve, bß╗ì ch├⌐t ─æß╗ïnh kß╗│ theo chß╗ë dß║½n cß╗ºa b├íc s─⌐.\n*   **L╞░u ├╜ bß╗çnh di truyß╗ün:** Golden Retriever c├│ thß╗â dß╗à mß║»c mß╗Öt sß╗æ bß╗çnh di truyß╗ün nh╞░ loß║ín sß║ún x╞░╞íng h├┤ng v├á khuß╗╖u tay, c├íc bß╗çnh vß╗ü mß║»t hoß║╖c tim. Viß╗çc kh├ím sß╗⌐c khß╗Åe ─æß╗ïnh kß╗│ gi├║p ph├ít hiß╗çn v├á quß║ún l├╜ sß╗¢m c├íc t├¼nh trß║íng n├áy.\n    *   **Mß╗Öt lß║ºn nß╗»a, h├úy ╞░u ti├¬n ─æ╞░a Milo ─æi kiß╗âm tra c├ón nß║╖ng v├á sß╗⌐c khß╗Åe tß╗òng thß╗â vß╗¢i b├íc s─⌐ th├║ y ngay bß║ín nh├⌐!**\n\n---\n\n### **6. Kh├┤ng gian nghß╗ë ng╞íi**\n\n*   ─Éß║úm bß║úo Milo c├│ mß╗Öt chß╗ù ngß╗º thoß║úi m├íi, an to├án v├á sß║ích sß║╜, tr├ính xa gi├│ l├╣a hoß║╖c n╞íi qu├í n├│ng.\n    *   **Sß║ún phß║⌐m ─æß╗ü xuß║Ñt:** **Gi╞░ß╗¥ng Ngß╗º Donut L├┤ng Nhung Sang Trß╗ìng (435.000─æ)** sß║╜ mang lß║íi cho Milo mß╗Öt kh├┤ng gian ß║Ñm c├║ng v├á ├¬m ├íi ─æß╗â nghß╗ë ng╞íi sau nhß╗»ng giß╗¥ vui ch╞íi.\n\n---\n\n### **Lß╗¥i nhß║»c sß║»p tß╗¢i:**\n\nHiß╗çn tß║íi, PetCare+ ch╞░a c├│ lß╗¥i nhß║»c n├áo sß║»p tß╗¢i cho Milo. Bß║ín c├│ muß╗æn thiß║┐t lß║¡p lß╗¥i nhß║»c vß╗ü lß╗ïch ti├¬m ph├▓ng, tß║⌐y giun, kiß╗âm so├ít ve rß║¡n hay c├íc cuß╗Öc hß║╣n kh├ím ─æß╗ïnh kß╗│ kh├┤ng? Ch├║ng t├┤i rß║Ñt sß║╡n l├▓ng gi├║p bß║ín!\n\n---\n\nHy vß╗ìng nhß╗»ng lß╗¥i khuy├¬n chi tiß║┐t n├áy sß║╜ hß╗»u ├¡ch cho bß║ín v├á Milo. Nß║┐u bß║ín c├│ bß║Ñt kß╗│ c├óu hß╗Åi n├áo kh├íc hoß║╖c cß║ºn t╞░ vß║Ñn th├¬m, ─æß╗½ng ngß║ºn ngß║íi hß╗Åi PetCare+ nh├⌐! Ch├║c bß║ín v├á Milo lu├┤n vui vß║╗ v├á khß╗Åe mß║ính!',0,'2025-12-02 01:10:26.929000');
/*!40000 ALTER TABLE `chat_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupon_usages`
--

DROP TABLE IF EXISTS `coupon_usages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupon_usages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `coupon_id` int NOT NULL,
  `order_id` int NOT NULL,
  `used_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `coupon_usages_coupon_id_fkey` (`coupon_id`),
  KEY `coupon_usages_order_id_fkey` (`order_id`),
  CONSTRAINT `coupon_usages_coupon_id_fkey` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`coupon_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `coupon_usages_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupon_usages`
--

LOCK TABLES `coupon_usages` WRITE;
/*!40000 ALTER TABLE `coupon_usages` DISABLE KEYS */;
INSERT INTO `coupon_usages` VALUES (4,4,14,'2025-11-27 00:52:21'),(5,4,15,'2025-11-27 00:53:20'),(6,5,16,'2025-11-27 07:26:40'),(7,5,17,'2025-11-27 07:26:40');
/*!40000 ALTER TABLE `coupon_usages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `coupon_id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_percent` float DEFAULT NULL,
  `discount_amount` float DEFAULT NULL,
  `vendor_id` int DEFAULT NULL,
  `rule_condition` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`coupon_id`),
  UNIQUE KEY `code` (`code`),
  KEY `coupons_vendor_id_fkey` (`vendor_id`),
  CONSTRAINT `coupons_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`vendor_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES (4,'HELLOWEEN',100,NULL,11,'Min: 1','2025-11-27 00:33:45','2025-12-31 00:00:00','2025-11-27 00:33:45','2025-11-27 00:33:45'),(5,'HAPPY',100,NULL,NULL,'1000','2025-11-26 00:00:00','2025-12-31 00:00:00','2025-11-27 07:14:45','2025-11-27 07:14:45'),(6,'NOEL',50,NULL,NULL,'100000','2025-11-26 00:00:00','2025-12-26 00:00:00','2025-11-27 08:43:25','2025-12-05 01:33:47');
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `id` char(25) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pet_id` char(12) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `category` enum('food','medicine','accessories','vet_visit','grooming','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `expense_date` date NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `expenses_pet_id_idx` (`pet_id`),
  KEY `expenses_user_id_idx` (`user_id`),
  KEY `expenses_category_idx` (`category`),
  KEY `expenses_expense_date_idx` (`expense_date`),
  CONSTRAINT `expenses_pet_id_fkey` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `expenses_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
INSERT INTO `expenses` VALUES ('03772546491fdea3bc4594a6','eaadf61eb9d5',102,'accessories','C├ít',120000.00,'2025-11-27','2025-11-27 04:18:13.332000','2025-11-27 04:18:13.332000'),('21d0d17ef7d84ff7275ab349','eaadf61eb9d5',102,'vet_visit','Kh├ím b├íc s─⌐',1200000.00,'2025-11-27','2025-11-27 04:18:34.638000','2025-11-27 04:18:34.638000'),('6630af264b41197cdae6e792','eaadf61eb9d5',102,'food','Hß║ít',320000.00,'2025-11-27','2025-11-27 04:17:58.558000','2025-11-27 04:17:58.558000'),('c5095e62e3e04ddfd725f772','eaadf61eb9d5',102,'other','Du lß╗ïch',1500000.00,'2025-11-27','2025-11-27 04:19:58.239000','2025-11-27 04:19:58.239000'),('cmisqcfrw0007ex9k02mhqty8','eaadf61eb9d5',102,'food','1234',120000.00,'2025-12-05','2025-12-05 03:36:35.420000','2025-12-05 03:36:35.420000'),('f5a96bc6c5ab461b6a1f0f62','eaadf61eb9d5',102,'grooming','spa',150000.00,'2025-10-27','2025-11-27 04:19:12.196000','2025-11-27 04:19:12.196000');
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `health_records`
--

DROP TABLE IF EXISTS `health_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `health_records` (
  `id` char(25) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pet_id` char(12) COLLATE utf8mb4_unicode_ci NOT NULL,
  `record_type` enum('weight','vaccination','health_note') COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` decimal(5,2) DEFAULT NULL,
  `vaccination_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `health_note` text COLLATE utf8mb4_unicode_ci,
  `record_date` date NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `health_records_pet_id_idx` (`pet_id`),
  KEY `health_records_record_type_idx` (`record_type`),
  KEY `health_records_record_date_idx` (`record_date`),
  CONSTRAINT `health_records_pet_id_fkey` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `health_records`
--

LOCK TABLES `health_records` WRITE;
/*!40000 ALTER TABLE `health_records` DISABLE KEYS */;
INSERT INTO `health_records` VALUES ('01a2ee704049c8fb6ac62aa1','eaadf61eb9d5','weight',4.20,NULL,NULL,'2025-11-27','2025-11-27 04:05:17.078000','2025-11-27 04:05:17.078000'),('cmisq6uoq0001ex9kl6vvafnj','eaadf61eb9d5','weight',22.05,NULL,NULL,'2025-12-05','2025-12-05 03:32:14.810000','2025-12-05 03:32:14.810000'),('cmisq91xz0003ex9ke8u2e747','3f624de691a8','weight',26.46,NULL,NULL,'2025-12-05','2025-12-05 03:33:57.528000','2025-12-05 03:33:57.528000'),('cmisq94v80005ex9krec6xsyi','3f624de691a8','vaccination',NULL,'5',NULL,'2025-12-05','2025-12-05 03:34:01.316000','2025-12-05 03:34:01.316000'),('dda0b2f1cc55511aca969c2f','eaadf61eb9d5','weight',9.26,NULL,NULL,'2025-11-27','2025-11-27 04:14:17.557000','2025-11-27 04:14:17.557000'),('f98ac5fba626193d4b79f3c1','eaadf61eb9d5','health_note',NULL,NULL,'Nß║▒m nhiß╗üu','2025-11-27','2025-11-27 04:05:47.335000','2025-11-27 04:05:47.335000'),('fe50482d5d1a4fa0c9ba62eb','eaadf61eb9d5','vaccination',NULL,'Rabis',NULL,'2025-11-27','2025-11-27 04:05:31.006000','2025-11-27 04:05:31.006000');
/*!40000 ALTER TABLE `health_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_preferences`
--

DROP TABLE IF EXISTS `notification_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_preferences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `appointment_reminders` tinyint(1) DEFAULT '1',
  `community_events` tinyint(1) DEFAULT '1',
  `platform_updates` tinyint(1) DEFAULT '1',
  `new_products_services` tinyint(1) DEFAULT '1',
  `urgent_care_alerts` tinyint(1) DEFAULT '1',
  `account_activity_alerts` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `notification_preferences_user_id_idx` (`user_id`),
  CONSTRAINT `notification_preferences_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_preferences`
--

LOCK TABLES `notification_preferences` WRITE;
/*!40000 ALTER TABLE `notification_preferences` DISABLE KEYS */;
INSERT INTO `notification_preferences` VALUES (1,102,1,1,1,1,1,1,'2025-11-26 22:33:34','2025-11-26 22:33:34'),(2,100,1,1,1,0,1,1,'2025-11-27 07:40:25','2025-11-27 07:53:09'),(3,101,1,1,1,1,1,1,'2025-11-27 07:56:20','2025-11-27 07:56:20');
/*!40000 ALTER TABLE `notification_preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int DEFAULT '1',
  `price` float NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_fkey` (`order_id`),
  KEY `order_items_product_id_fkey` (`product_id`),
  CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (9,7,1,1,149000,'2025-11-15 12:26:51'),(10,7,3,1,1250000,'2025-11-15 12:26:51'),(11,8,1,1,149000,'2025-11-15 12:32:40'),(12,9,1,1,150000,'2025-11-15 12:43:30'),(13,10,1,1,150000,'2025-11-19 13:05:17'),(14,11,3,1,1250000,'2025-11-19 13:07:26'),(15,12,2,1,289000,'2025-11-19 13:16:13'),(16,13,8,2,1350000,'2025-11-19 13:29:32'),(17,14,12,1,320000,'2025-11-27 00:52:21'),(18,15,12,1,320000,'2025-11-27 00:53:20'),(19,16,2,1,289000,'2025-11-27 07:26:40'),(20,17,12,2,320000,'2025-11-27 07:26:40'),(21,18,12,1,320000,'2025-11-27 07:37:17');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `vendor_id` int NOT NULL,
  `status` enum('pending','paid','shipped','delivered','cancelled','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_method` enum('momo','vnpay','zalopay','cod') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `shipping` decimal(10,2) NOT NULL DEFAULT '0.00',
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `tax` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `shipping_address` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `orders_user_id_fkey` (`user_id`),
  KEY `orders_vendor_id_fkey` (`vendor_id`),
  CONSTRAINT `orders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `orders_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`vendor_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (7,100,10,'pending',NULL,'2025-11-15 12:26:51','2025-11-15 12:26:51',0.00,1399000.00,139900.00,1538900.00,'12'),(8,100,10,'pending',NULL,'2025-11-15 12:32:40','2025-11-15 12:32:40',0.00,149000.00,14900.00,163900.00,'hihi'),(9,101,10,'delivered',NULL,'2025-11-15 12:43:30','2025-11-27 16:11:23',0.00,150000.00,15000.00,165000.00,'22'),(10,100,10,'shipped',NULL,'2025-11-19 13:05:17','2025-11-27 15:51:22',0.00,150000.00,15000.00,165000.00,'123'),(11,100,10,'delivered',NULL,'2025-11-19 13:07:26','2025-11-27 16:09:43',0.00,1250000.00,125000.00,1375000.00,'wefawef'),(12,100,10,'shipped',NULL,'2025-11-19 13:16:13','2025-11-27 16:09:35',0.00,289000.00,28900.00,317900.00,'hehe'),(13,100,10,'shipped',NULL,'2025-11-19 13:29:32','2025-11-27 15:51:17',0.00,2700000.00,270000.00,2970000.00,'─âefawef'),(14,100,11,'delivered',NULL,'2025-11-27 00:52:21','2025-11-27 15:55:59',30000.00,0.00,0.00,30000.00,'123'),(15,102,11,'delivered',NULL,'2025-11-27 00:53:20','2025-11-27 16:06:03',30000.00,0.00,0.00,30000.00,'123'),(16,101,10,'delivered','cod','2025-11-27 07:26:40','2025-11-27 15:57:38',30000.00,0.00,0.00,30000.00,'123'),(17,101,11,'delivered','cod','2025-11-27 07:26:40','2025-11-27 15:57:40',30000.00,0.00,0.00,30000.00,'123'),(18,101,11,'delivered','cod','2025-11-27 07:37:17','2025-11-27 15:57:24',0.00,320000.00,32000.00,352000.00,'123');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp`
--

DROP TABLE IF EXISTS `otp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp`
--

LOCK TABLES `otp` WRITE;
/*!40000 ALTER TABLE `otp` DISABLE KEYS */;
INSERT INTO `otp` VALUES (29,'palik48134@etramay.com',NULL,'943528','2025-11-15 12:42:40.504'),(30,'xocawow229@okcdeals.com',NULL,'207394','2025-11-26 22:25:22.307');
/*!40000 ALTER TABLE `otp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `user_id` int NOT NULL,
  `amount` float NOT NULL,
  `method` enum('momo','vnpay','zalopay') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','success','fail') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `transaction_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  KEY `payments_order_id_fkey` (`order_id`),
  KEY `payments_user_id_fkey` (`user_id`),
  CONSTRAINT `payments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `payments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pets`
--

DROP TABLE IF EXISTS `pets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pets` (
  `id` char(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int DEFAULT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `species` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `breed` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `age` int DEFAULT NULL,
  `weight` decimal(5,2) DEFAULT NULL,
  `vaccination` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `medical_history` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `pets_user_id_fkey` (`user_id`),
  CONSTRAINT `pets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pets`
--

LOCK TABLES `pets` WRITE;
/*!40000 ALTER TABLE `pets` DISABLE KEYS */;
INSERT INTO `pets` VALUES ('1c54f12dac08',101,'Milo','Ch├│','Golden Retriever',3,12.50,'Rabies, DHPP, Parvovirus','','','/uploads/1764661905722-5a4006d9.jfif','2025-12-02 00:51:45.729000'),('3f624de691a8',102,'Milo','Ch├│','Golden Retriever',3,12.50,'Rabies, DHPP, Parvovirus','Treated for skin allergies in 2023.','Friendly and active, loves playing with children.','/uploads/1764198827387-f606af49.jfif','2025-11-26 16:13:02.539000'),('eaadf61eb9d5',102,'Miu Miu','M├¿o','British Shorthair',2,4.20,'Rabies, FVRCP','─É├ú ─æiß╗üu trß╗ï vi├¬m mß║»t nhß║╣ v├áo n─âm 2024.','Hiß╗ün, ├¡t quß║¡y, th├¡ch nß║▒m cß║ính cß╗¡a sß╗ò.','/uploads/1764199443324-cc11e9bc.webp','2025-11-26 16:24:03.327000');
/*!40000 ALTER TABLE `pets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `image_url` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_thumbnail` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_images_product_id_idx` (`product_id`),
  CONSTRAINT `product_images_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (1,1,'https://sspark.genspark.ai/cfimages?u1=J%2FCDBDReeP1C83QIuqWBoTC4Uy5uZgGYheYX5KOYEkUDM3Cd1rFlVXRgzKIYvntfbTcWz0z5f%2FZo%2Bwe3vTPXGF5rbE%2BFCXsCuyo6EVZfyogmb9GfP0W9g%2B6XKmujUugprsS4%2BCdHW4wwuNO5itab5A%3D%3D&u2=I9%2BRIrGFsxGluHjJ&width=2560',1,'2025-11-15 11:16:26'),(2,1,'https://sspark.genspark.ai/cfimages?u1=DLuP5v385OrzI8Z9XWmDNX46%2B4QPN3M0lpglJQW5sNVcwzrtosd0NkBSl5rWzyCIBEvsZclUKSzLMmdNkQjjPSZSOCvd2MkperBX0sz6kH%2Flg7UuAl2NfoOgQq689Nw6TipFNF8C9BWdU8DM3yljjlmP7IpQ%2FVeip0VFvlVmK2vtJTXO2M%2B28QgPteSrBQMLBO9NVZx5vxE%3D&u2=hXwz5%2Bura2AJylen&width=2560',0,'2025-11-15 11:16:26'),(3,1,'https://sspark.genspark.ai/cfimages?u1=bKkXn4cBnSyJw1CRThkTX0F396sLdjg6kLdMkZYwEkbxYRuN0O8Q7uPT5bvWS6K4AsOhNyIy5Sad2OHsFI5lE%2Bv24EIegXS%2BJLu9DfB%2FYSf1SSwXdjDTu66TZWuE4u0j8UL2L3P4icr4q71HTa0lA9u5zdMlsM7ndOSkqfGbxI7V%2FcC8br8OjpTmIPPz&u2=2gXOncBdmB%2Bm1GYi&width=2560',0,'2025-11-15 11:16:26'),(5,2,'https://sspark.genspark.ai/cfimages?u1=%2FQwbI%2FVPC4Lo2fJBsUaLuZxngWWOfkS%2BdEDDNvcQ8IzSsjnK0NWEqw2bkei1ZSJS%2Fs%2BNOI9WrWdDy2XJF%2BgKR%2F74Pg%3D%3D&u2=sukVIkmNlf1Fj%2Bv4&width=2560',1,'2025-11-15 11:16:26'),(6,2,'https://sspark.genspark.ai/cfimages?u1=OS9wTnO9mGKf53u%2BNpErX%2F0L0lda7t4CRWzSZqiEnD4pkSBb%2F%2BwoJ%2BIypmoxOj7ONDP5%2FnZv109iANcbzJU5n2iriw%3D%3D&u2=pkGgqsIKl2FWmTQD&width=2560',0,'2025-11-15 11:16:26'),(7,2,'https://sspark.genspark.ai/cfimages?u1=czRNwmTLq6GdGJ16BDd%2F%2FD9JGXNg9VTY7aEgmWQRnhSu8rWHO9WJbVeZCL9vxp8bPDhsawIFocp78oWHqWCo6BKE2A%3D%3D&u2=R3QcB1aj%2F%2FGcAbAM&width=2560',0,'2025-11-15 11:16:26'),(8,2,'https://sspark.genspark.ai/cfimages?u1=xhZvIvyKgyQIpwP0BFDPNK%2F9mpUtQl%2FiIXq2eVuiwA1toGGfHJwBK44ewc2y6uTk%2BpDXYpueLbKS0fyP2xnOcfZLcw%3D%3D&u2=NgF2RKZeSPkQq6UZ&width=2560',0,'2025-11-15 11:16:26'),(9,3,'https://sspark.genspark.ai/cfimages?u1=It4fc6C%2BwtdAQbVteujkX22P%2BmN2KdLD7LT%2F33BMIudUKTyiunh9S3HoGne8pgexitjbaWEx2TIawEy0zMZDOpmpaKfiYmSASLZMrPHDp9S%2B2oF2RVOhxjtZcEfr77CEECylwHaqT2CcIJwyiAIphz%2BooB71B5OsVe5XTaDHdVEDnCcxFwfk%2FLNlsxfHiZn0HerltzTesT%2FE1V5uV3bCAJXvhfeRuEs9gzC9RHYEFgjbKmF85k%2FiAs9RyQ%3D%3D&u2=7wCAHt%2FHPlmCscPi&width=2560',1,'2025-11-15 11:16:26'),(10,3,'https://sspark.genspark.ai/cfimages?u1=b6GRBKhD%2FG%2Fo8EbfTGGORrhh1qzpbYiyuo1ITYSar1lj5FYnYn4VjoT8Wm1GAVlmAwgneH3BRl%2BmmhUv1OGr49yjac5%2FWblzsa0q0c%2BnAQ4c7YpPOUHA6WZwd7zCd3tGejGIyWIKLOiG6g%3D%3D&u2=CNnI9qgwi7gUe2Pt&width=2560',0,'2025-11-15 11:16:26'),(11,3,'https://sspark.genspark.ai/cfimages?u1=uQaB1xqd%2FbfmJUIfdi7N25vckuVPevIsrLoQ3p%2B7RgeOaaZ54TY7ncBkYbNTbvqsTCsk9dFemUVh%2FJctOKizD2jlSfr8H8U4yEq4rfQ%2FT2V0MqAJWcDXfN03qTYefZpFSRtrLEhed%2FFKPdADOE%2B0KzhXGH8sfic4vdb6M%2B7BJBSMQR4qpD0V5A%3D%3D&u2=MOHqrJ5I8W6XOTwu&width=2560',0,'2025-11-15 11:16:26'),(12,3,'https://sspark.genspark.ai/cfimages?u1=2Fhz%2FyorGlAkkjnQRxLaOozFTGQW9SeOxL4YpqFhgxlTC79gP4SY4fhqJevuV2n68AXf0gJ6L0dFkPboXFCzsvX1fapMYU3kp2bXQWdHR44Q1V52wm4vezJNwlIWHwMApGc2mVWaXkkNnnc%2FEPBvgl1EqMa7NjQg95q2JnTOVSx7BKiWAUqOinU%3D&u2=YcCoJpYqDdpHeKNU&width=2560',0,'2025-11-15 11:16:26'),(13,4,'https://sspark.genspark.ai/cfimages?u1=KzzGv5L8wQf6F5hzbOSIHmZi5mOnLskUZEr3J1Iw5LOFanhyn0ry3X9xjYX26DcDvg4Bv%2F4LgXtimmnj38vyza%2BJWBKtt5qAQweXnrIV2FVEA6zFYaqFL%2FyZu6sNz9CnJqPq4w%3D%3D&u2=ut20Yw582FGKC0ng&width=2560',1,'2025-11-15 11:16:26'),(14,4,'https://sspark.genspark.ai/cfimages?u1=MmkkxKMSvksTuws4Fqn2mJ5HFqeGAedw53yoIQf0FZCr53%2BGrWK7c92zPRdIDAS%2FZfu4hTnDZONrHycGjqLea0aB0qIc4PuZIiUuwp48yElJc2FuVAop30%2FzkfllXwazeShvHoh8GR2FyIvHZq85pVxon6S5FlrN1vEUVUZyLiQ3t%2Bv0kMGCIb7Dox6IVWwoVBg1wxuKtVbKFRC9extnkDk3V9eSgg%3D%3D&u2=XPzPax2zBNtR1ieK&width=2560',0,'2025-11-15 11:16:26'),(15,4,'https://sspark.genspark.ai/cfimages?u1=zFIwB75shiEEv9EqpFn9iyvw9%2BYO8wziUQcRWav2YKe9%2FBohBnWFFxRFP7NyWF4JD5e44N3BzJD8mKVduEifAwSqHmJay6drJUNHKMVx0mnR5URTng%2Bv&u2=28VibBn0Ih7ditdV&width=2560',0,'2025-11-15 11:16:26'),(16,5,'https://sspark.genspark.ai/cfimages?u1=Yt%2BcHPDm%2FlzovKlIBeegxiZRMLUo9%2FzEUpVPx0tShl5%2FrsMQ6nbohqhObIgF%2FcoK58FGGqeEmInCP6eDvDi%2FhsJ6rg%3D%3D&u2=V1YbovFpDxThoRe5&width=2560',1,'2025-11-15 11:16:26'),(17,5,'https://sspark.genspark.ai/cfimages?u1=c3dKxhBVebDshPuviKu3cZpoI%2FO2IvnLT5p17ImVFJXikITHZDVXAEecvG8k78eF9J3P376jXt3ZyZ8S3F7mPup1TEBD8Egtj0eB9WiRK5nfkzjlsSiVszwJ0%2FnpPJfMU1ETTNk%3D&u2=cKIBPu7BywMwlwtM&width=2560',0,'2025-11-15 11:16:26'),(18,5,'https://sspark.genspark.ai/cfimages?u1=cf0MZfrJPCI7TiznO3IZ%2Bh%2BOYFpVcIobI3hOG4DvtjJFb7JWa%2B57zS%2B69QS3OMg1sggPwVuUT%2FE3WjPh0u3%2BKoAvTBavP8u%2BVJ%2F%2F9raJGdIFP5tixaZCNysCD0mtOY5PKxNwYAw%3D&u2=z8RgCHpuKnN2z5M6&width=2560',0,'2025-11-15 11:16:26'),(19,5,'https://sspark.genspark.ai/cfimages?u1=1i6z%2BCh3ts2hJuP65rUdAcsTFBzd9Ah8ex3FFMN%2F%2BdgW6IffvLMtQjb%2BMF80LCkKg3JosB1BHoRopRQQ%2BgDzTdtByA%3D%3D&u2=MtqzlVld4nNGa1Yg&width=2560',0,'2025-11-15 11:16:26'),(20,6,'https://sspark.genspark.ai/cfimages?u1=61%2Bd8HCSOpjHir6wII8EoI1wpEITU%2FxgvH%2F3WUCkXTAhf%2BIPJKSOI37ghssrcKKJZBDKmlcWbSne42%2FBNJ1OspeNNz5F3m35IU%2BNRo5KUWGy2B2%2BiAgIyZo%3D&u2=KWB9Nzu6PFnZHCtI&width=2560',1,'2025-11-15 11:16:26'),(21,6,'https://sspark.genspark.ai/cfimages?u1=zvdQ72%2BjNiFljOn6RSf2PhBSRMedYH6FlByrjeI5AWFv5o9qX%2FKK4VEa%2BSvENTbq5i5N882fhmTDs%2FrxsXlJPq0D1VD9k43hY%2FFVq2i3zvu%2BtU32ODsjsho%3D&u2=dsfhv31%2BIbnMyaTM&width=2560',0,'2025-11-15 11:16:26'),(22,6,'https://sspark.genspark.ai/cfimages?u1=knmeWXa2YEZFLIkKdG6YAVUBNMdELsouZTZNZaXWzfM70y%2FIvmovvLL8bjVZwxC3%2B4kRMFLTep3nLpsQkaIE7QNuya%2FbvNYvDYeRI10nbFfZK34saUWspjE%3D&u2=uALJy1YvNlipGDVn&width=2560',0,'2025-11-15 11:16:26'),(23,6,'https://sspark.genspark.ai/cfimages?u1=UOXSzQZ2eM%2FF5Syl%2FTRRMDVjEdw9ztoOsZ9ECKGAQEFu1UpK%2FqtVWqNwmoHNrMrlaEGv1AO2gj%2B3TlvbDpCDkN6gc83NOmXyOBA%3D&u2=hOBcr1sLhKlyE86u&width=2560',0,'2025-11-15 11:16:26'),(24,7,'https://sspark.genspark.ai/cfimages?u1=WFEwWShsV2TPYygl%2B4guVbTK3XvtdiTBcH31OZnQ3QMSWZcyqxU4JKpbb%2BEnTu3JAi8CJYf%2Frbo7ntbVBdCcae9vq2HYgb9Ls9fM7dtW9P9YGCK3g9%2BJ73Y%3D&u2=EO28Ry80s1GUDVAb&width=2560',1,'2025-11-15 11:16:26'),(25,7,'https://sspark.genspark.ai/cfimages?u1=gVJjVxu28lKn39SToV1dsJHoaIN618gOb8WSvntc0fFMQwT29JO%2Bxkx68M%2FxRYPSVNtdwATNwdjqK0Mdci1QmAFEz2QDJtyBxBXaNO68NHz6Qx2WHrOkRA%3D%3D&u2=u7x8g4Ocpb8qOxbi&width=2560',0,'2025-11-15 11:16:26'),(26,7,'https://sspark.genspark.ai/cfimages?u1=dS9wbJng1Zjfqbc0PU0GgToFGimC2MTKrSjAml24CObbLeo37d5Ap9EDSQKjphECf0cchUHd93ANPs%2FnRTAB43NBHcyZhDOoDC0VI3qw0eYDRmForSiIkqE%3D&u2=Q%2Fp3IEFa25gOH2nD&width=2560',0,'2025-11-15 11:16:26'),(27,7,'https://sspark.genspark.ai/cfimages?u1=f8943mAVRakaVyhfSDib6ixbu5dAPBE%2BbPm02rVStgh5zI6s3ViejS44b1dYZZ6thk7phT8WcaipWLzXy8%2FoDJItDw%3D%3D&u2=Y9e6dnNRr2VcpiQm&width=2560',0,'2025-11-15 11:16:26'),(28,8,'https://sspark.genspark.ai/cfimages?u1=Fj254awXLuL58UXGAReWZpOrqLrh73RX0I%2Boss3k894F16ZGnpG34rGEGCMAskQvGIuLjfRVCaSse8rDFtnhcZUeXg%3D%3D&u2=LhLdFeggIOCvJmIo&width=2560',1,'2025-11-15 11:16:26'),(29,8,'https://sspark.genspark.ai/cfimages?u1=Ry1JXr1eQZj8DVX7nleSm0bKxMdsUBg%2BFcDs5bSbBDD7uiJedBKKt1v8EmeB%2ByC3AGyuCqLFrj4TZbdOatpO9NKeWA%3D%3D&u2=5e%2BsArpQzC%2FKkZhg&width=2560',0,'2025-11-15 11:16:26'),(30,8,'https://sspark.genspark.ai/cfimages?u1=7K9L2QyPGJtDCwjFSgm2HzroFv9ELj5xUCrzqpuD3WseliEyavautpFQ9Oi5FlYbzYhZDzAjqAkJqIN58IKLWk5dUA%3D%3D&u2=VCpePRmc%2B1n8zp8F&width=2560',0,'2025-11-15 11:16:26'),(31,8,'https://sspark.genspark.ai/cfimages?u1=NxPP%2BG7nKlBWnEgMfuLFaeySgjA0cSfhr9mRd4Frr9LaIWaKgnmkJFrwUv6y7Vbkt%2B7oLMIQdQrmdV2i%2FeGDaGFDVq%2FFA%2FALVMFqlQU5XZZb2OIq9jMF%2F%2BU%3D&u2=0SMDFO4qwWnP8nal&width=2560',0,'2025-11-15 11:16:26'),(33,9,'https://sspark.genspark.ai/cfimages?u1=rWeSoYFBt7%2FVLYfGPugT2cJbg3Y4VHiDOZciUT2rhyHoi81G6CMz4mS%2BKCoekvuQxKRIPaWhkOR%2FHXno5SBNECmpADjBX4pmGSp0wMbWYjRZiU8NDbkP%2FIlR%2F7Ve5RlkL2DJjG29EvPtpHcX%2B1U9RzmjGG10lGDA&u2=btvcv2uMUi9SGct7&width=2560',1,'2025-11-15 11:16:26'),(34,9,'https://sspark.genspark.ai/cfimages?u1=sVitJeNNlDNaImudfVXxAijhq3zU3qzYEcSU1jAVlO%2FRouZYub4rdTdg2NV8km1lCyxJFxikAlh809zrXdwhAi4ypj5HWmguj2y%2B46FxwYgSx2r81qBHmePR8asrujB%2F4psHOV5C%2FMwsjyo%2F8Yrwk%2FaI9eVvoUZ2&u2=ltVKEk0uT1Fgf4q%2B&width=2560',0,'2025-11-15 11:16:26'),(35,9,'https://sspark.genspark.ai/cfimages?u1=UayHeMqFO2kxn6fRYifrj%2BOBnyVXZu5y1AG4ANCsNykWvBev%2BI2xnLKxZv0%2BxrXuOJc3DQgdRtcOc2n%2FNR%2BChiOXug7UHLLH%2BT8THIAK9%2BeX91lRjC6n0YV%2FlpWgaC%2BtdJ6GSoaWem4YS8%2BSf4Ikt4iZCZFOFGOn&u2=Z0ljDA3uuv5zRl6n&width=2560',0,'2025-11-15 11:16:26'),(37,10,'https://sspark.genspark.ai/cfimages?u1=nMQZAOCPcxIhzymDk5bVAi0KzgzPcAua8d%2BgTdY1%2ByTVQiyQTj52JkfK9YVT%2FKbhRx58qMtBwFt2F3DX6NNhDiDVNdyMpS9%2F1sO0V9aBa6LR2pFcksiibA%3D%3D&u2=pDZ%2Fd2ib5Ax9m4FM&width=2560',1,'2025-11-15 11:16:26'),(38,10,'https://sspark.genspark.ai/cfimages?u1=Clz%2FykhAjYKtOP7Igif9Dy2t0nq9iYxlibI%2BYaQ7KGfzJEbBe4qz9bXW6JuBh6ycOsYTkELP9xG%2FwTC9%2F5jsE732RQ%3D%3D&u2=p65%2FgI6YOjy5CcX7&width=2560',0,'2025-11-15 11:16:26'),(39,10,'https://sspark.genspark.ai/cfimages?u1=eYc4wVYH3TWYH0GCO4z9LwQVBLVgBHR9RvsIz6jup94a6OrXkECURE4Qg8hEHEmr9n2UZsjUdzg0x61BBQ8Y0cExvJs8X7pa%2F4Cj8fkqbIxZNm0%2FhUMo0RoOyIbzWy9yaEjA2laovEHBo%2FTAAwd8QMTFiou3aQ003mdMI6bMfo3SIX3Ho9a4WuZMefX%2F%2BP5p75S66%2Ben70fNU3e2A4s5MYYZHENe&u2=yq1zTR9yd6SMKALt&width=2560',0,'2025-11-15 11:16:26'),(40,11,'/uploads/1763211883062-f8f10065.jpg',1,'2025-11-15 06:04:43'),(41,11,'/uploads/1763211883064-5684e044.jpg',0,'2025-11-15 06:04:43'),(42,11,'/uploads/1763211883066-a017f014.jpg',0,'2025-11-15 06:04:43'),(43,11,'/uploads/1763211883067-d740c221.jpg',0,'2025-11-15 06:04:43'),(44,11,'/uploads/1763211883070-b2321241.avif',0,'2025-11-15 06:04:43'),(49,12,'/uploads/1764232576610-6e16f37a.webp',1,'2025-11-27 01:36:17'),(50,12,'/uploads/1764232725088-fbf7703c.jfif',0,'2025-11-27 01:38:45'),(55,13,'/uploads/1764572558548-7586d52d.webp',1,'2025-12-01 00:02:39'),(56,13,'/uploads/1764572558552-f6aed4c7.png',0,'2025-12-01 00:02:39'),(57,13,'/uploads/1764572558556-753c7eee.jfif',0,'2025-12-01 00:02:39');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `vendor_id` int NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `price` float NOT NULL,
  `stock` int DEFAULT '0',
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  KEY `products_vendor_id_fkey` (`vendor_id`),
  KEY `products_status_idx` (`status`),
  CONSTRAINT `products_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`vendor_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,10,'B├ít ─én Inox Chß╗æng Tr╞░ß╗út Premium','B├ít ─ân inox 304 cao cß║Ñp, chß╗æng gß╗ë, ─æ├íy chß╗æng tr╞░ß╗út, dß╗à d├áng vß╗ç sinh. Dung t├¡ch 500ml ph├╣ hß╗úp cho ch├│ m├¿o nhß╗Å v├á vß╗½a. Thiß║┐t kß║┐ b├│ng bß║⌐y, an to├án tuyß╗çt ─æß╗æi cho th├║ c╞░ng.',150000,146,'Feeding Supplies','APPROVED',NULL,'2025-11-15 18:16:26','2025-11-29 22:17:52'),(2,10,'Bß╗Ö D├óy Dß║»t & V├▓ng Cß╗ò Phß║ún Quang Chß╗æng Giß║¡t','Bß╗Ö d├óy dß║»t ch├│ cao cß║Ñp vß╗¢i d├óy phß║ún quang an to├án ban ─æ├¬m, d├óy d├╣ bß╗ün chß║»c, kh├│a kim loß║íi chß║»c chß║»n. V├▓ng cß╗ò ─æß╗çm ├¬m ├íi, ─æiß╗üu chß╗ënh linh hoß║ít. Ph├╣ hß╗úp cho ch├│ tß╗½ 5-25kg.',289000,199,'Walking Gear','APPROVED',NULL,'2025-11-15 18:16:26','2025-11-29 22:17:52'),(3,10,'C├óy C├áo M├│ng & Nh├á Cho M├¿o 3 Tß║ºng','C├óy c├áo m├│ng m├¿o cao 120cm vß╗¢i 3 tß║ºng, bao gß╗ôm 2 nh├á ß╗ƒ, cß╗Öt c├áo bß║▒ng d├óy sisal tß╗▒ nhi├¬n, nß╗çm mß╗üm mß║íi. Cß║Ñu tr├║c vß╗»ng chß║»c, ─æß║┐ rß╗Öng chß╗æng ─æß╗ò. M├áu x├ím thanh lß╗ïch ph├╣ hß╗úp mß╗ìi kh├┤ng gian.',1250000,43,'Cat Furniture','APPROVED',NULL,'2025-11-15 18:16:26','2025-11-29 22:17:52'),(4,10,'T├║i Vß║¡n Chuyß╗ân Th├║ C╞░ng ─Éa N─âng','T├║i vß║¡n chuyß╗ân mß╗üm c├│ thß╗â mß╗ƒ rß╗Öng, ph├╣ hß╗úp cho m├íy bay. Chß║Ñt liß╗çu Oxford bß╗ün chß║»c, l╞░ß╗¢i tho├íng kh├¡ 4 mß║╖t, nß╗çm ─æß╗çm ├¬m ├íi c├│ thß╗â th├ío rß╗¥i giß║╖t m├íy. K├¡ch th╞░ß╗¢c ph├╣ hß╗úp ch├│ m├¿o d╞░ß╗¢i 7kg.',545000,80,'Travel Gear','APPROVED',NULL,'2025-11-15 18:16:26','2025-11-29 22:17:52'),(5,10,'Bß╗Ö 2 B├│ng Cao Su Chß╗æng Nhai Cho Ch├│','Bß╗Ö 2 quß║ú b├│ng cao su thi├¬n nhi├¬n ─æ╞░ß╗¥ng k├¡nh 7.5cm, bß╗ün bß╗ë chß╗ïu ─æ╞░ß╗úc lß╗▒c cß║»n mß║ính. Thiß║┐t kß║┐ bß╗ü mß║╖t gai massage n╞░ß╗¢u, l├ám sß║ích r─âng. Nß╗òi ─æ╞░ß╗úc tr├¬n n╞░ß╗¢c, ph├╣ hß╗úp cho ch├│ n─âng ─æß╗Öng v├á hiß║┐u ─æß╗Öng.',169000,300,'Toys','APPROVED',NULL,'2025-11-15 18:16:26','2025-11-29 22:17:52'),(6,10,'Gi╞░ß╗¥ng Ngß╗º Donut L├┤ng Nhung Sang Trß╗ìng','Gi╞░ß╗¥ng ngß╗º h├¼nh donut ├¬m ├íi vß╗¢i lß╗¢p l├┤ng nhung si├¬u mß╗üm, viß╗ün cao tß║ío cß║úm gi├íc an to├án cho th├║ c╞░ng. ─É├íy chß╗æng tr╞░ß╗út, vß╗Å c├│ thß╗â th├ío rß╗¥i giß║╖t m├íy. Size M (60cm) ph├╣ hß╗úp cho ch├│ m├¿o 3-10kg.',435000,120,'Bedding','APPROVED',NULL,'2025-11-15 18:16:26','2025-11-29 22:17:52'),(7,10,'Sß╗»a Tß║»m Th├║ C╞░ng Bio-Groom Khß╗¡ M├╣i 473ml','Sß╗»a tß║»m chuy├¬n dß╗Ñng tß╗½ Mß╗╣ vß╗¢i c├┤ng thß╗⌐c dß╗ïu nhß║╣, pH c├ón bß║▒ng. Chiß║┐t xuß║Ñt tß╗½ dß╗½a v├á l├┤ hß╗Öi tß╗▒ nhi├¬n, l├ám sß║ích s├óu, khß╗¡ m├╣i hiß╗çu quß║ú, kh├┤ng g├óy kh├┤ da. H╞░╞íng th╞ím nhß║╣ nh├áng l╞░u lß║íi l├óu.',185000,180,'Grooming','APPROVED',NULL,'2025-11-15 18:16:26','2025-11-29 22:17:52'),(8,10,'M├íy Cho ─én Tß╗▒ ─Éß╗Öng 6L C├│ Hß║╣n Giß╗¥','M├íy cho ─ân tß╗▒ ─æß╗Öng dung t├¡ch 6L vß╗¢i m├án h├¼nh LCD, lß║¡p tr├¼nh l├¬n ─æß║┐n 4 bß╗»a/ng├áy, mß╗ùi bß╗»a 1-9 phß║ºn. Ng─ân chß╗⌐a k├¡n kh├¡, chß║Ñt liß╗çu ABS an to├án. Pin dß╗▒ ph├▓ng ─æß║úm bß║úo hoß║ít ─æß╗Öng li├¬n tß╗Ñc khi mß║Ñt ─æiß╗çn.',1350000,53,'Feeding Supplies','APPROVED',NULL,'2025-11-15 18:16:26','2025-11-29 22:17:52'),(9,10,'─É├ái Phun N╞░ß╗¢c Tß╗▒ ─Éß╗Öng 2.5L Lß╗ìc Than Hoß║ít T├¡nh','─É├ái phun n╞░ß╗¢c tuß║ºn ho├án vß╗¢i hß╗ç thß╗æng lß╗ìc 3 lß╗¢p than hoß║ít t├¡nh, khß╗¡ clo v├á tß║íp chß║Ñt. Thiß║┐t kß║┐ chß║úy th├íc khuyß║┐n kh├¡ch th├║ c╞░ng uß╗æng n╞░ß╗¢c nhiß╗üu h╞ín. M├íy b╞ím si├¬u ├¬m 30dB, dß╗à d├áng th├ío rß╗¥i vß╗ç sinh.',685000,90,'Feeding Supplies','APPROVED',NULL,'2025-11-15 18:16:26','2025-11-29 22:17:52'),(10,10,'Snack L├ám Sß║ích R─âng Greenies 340g','B├ính x╞░╞íng ch─âm s├│c r─âng miß╗çng Greenies tß╗½ Mß╗╣ vß╗¢i c├┤ng thß╗⌐c ─æ╞░ß╗úc chß╗⌐ng nhß║¡n bß╗ƒi VOHC. Kß║┐t cß║Ñu nhai gi├║p loß║íi bß╗Å cao r─âng v├á mß║úng b├ím, l├ám th╞ím h╞íi thß╗ƒ. Bß╗ò sung vitamin v├á kho├íng chß║Ñt thiß║┐t yß║┐u.',295000,250,'Food & Treats','APPROVED',NULL,'2025-11-15 18:16:26','2025-11-29 22:17:52'),(11,10,'K├¼m Cß║»t M├│ng Chuy├¬n Nghiß╗çp Epica Pro','K├¼m cß║»t m├│ng chuy├¬n nghiß╗çp vß╗¢i l╞░ß╗íi dao inox sß║»c b├⌐n, tay cß║ºm cao su chß╗æng tr╞░ß╗út ├¬m ├íi. Thiß║┐t kß║┐ c├┤ng th├íi hß╗ìc gi├║p cß║»t m├│ng ch├¡nh x├íc, an to├án. T├¡ch hß╗úp d┼⌐a m├│ng v├á kh├│a an to├án. Ph├╣ hß╗úp cho ch├│ m├¿o mß╗ìi k├¡ch cß╗í.',195000,200,'Grooming','APPROVED',NULL,'2025-11-15 13:04:43','2025-11-29 22:17:52'),(12,11,'Thß╗⌐c ─ân hß║ít Royal Canin Fit 32','Thß╗⌐c ─ân hß║ít dinh d╞░ß╗íng cho m├¿o tr╞░ß╗ƒng th├ánh, gi├║p duy tr├¼ c├ón nß║╖ng v├á sß╗⌐c khß╗Åe hß╗ç ti├¬u h├│a.',320000,40,'Food','APPROVED',NULL,'2025-11-27 00:17:33','2025-11-29 22:17:52'),(13,11,'Royal Canin Puppy Medium Breed - Thß╗⌐c ─ân hß║ít cho ch├│ con giß╗æng vß╗½a','≡ƒîƒ Thß╗⌐c ─ân hß║ít Royal Canin Puppy Medium Breed (Cho ch├│ con giß╗æng vß╗½a)\r\n\r\nGiß╗¢i thiß╗çu: Sß║ún phß║⌐m ─æ╞░ß╗úc thiß║┐t kß║┐ ─æß║╖c biß╗çt ─æß╗â ─æ├íp ß╗⌐ng nhu cß║ºu dinh d╞░ß╗íng cao cß╗ºa ch├│ con giß╗æng vß╗½a (trß╗ìng l╞░ß╗úng tr╞░ß╗ƒng th├ánh tß╗½ 11kg ─æß║┐n 25kg) trong giai ─æoß║ín ph├ít triß╗ân quan trß╗ìng tß╗½ 2 ─æß║┐n 12 th├íng tuß╗òi.\r\n\r\nΓ£¿ Lß╗úi ├¡ch nß╗òi bß║¡t:\r\n\r\nHß╗ù trß╗ú miß╗àn dß╗ïch: Chß╗⌐a phß╗⌐c hß╗úp chß╗æng oxy h├│a (bao gß╗ôm Vitamin E) gi├║p cß╗ºng cß╗æ hß╗ç thß╗æng miß╗àn dß╗ïch tß╗▒ nhi├¬n cß╗ºa ch├│ con.\r\n\r\nTi├¬u h├│a tß╗æi ╞░u: C├┤ng thß╗⌐c dß╗à ti├¬u h├│a vß╗¢i protein chß║Ñt l╞░ß╗úng cao (L.I.P.) v├á prebiotic (FOS & MOS) gi├║p c├ón bß║▒ng hß╗ç vi sinh ─æ╞░ß╗¥ng ruß╗Öt.\r\n\r\nPh├ít triß╗ân x╞░╞íng v├á khß╗¢p: Cung cß║Ñp h├ám l╞░ß╗úng n─âng l╞░ß╗úng v├á kho├íng chß║Ñt (Canxi, Phß╗æt pho) c├ón ─æß╗æi ─æß╗â hß╗ù trß╗ú sß╗▒ ph├ít triß╗ân khß╗Åe mß║ính cß╗ºa x╞░╞íng v├á khß╗¢p trong giai ─æoß║ín t─âng tr╞░ß╗ƒng nhanh.\r\n\r\nK├¡ch th╞░ß╗¢c hß║ít ph├╣ hß╗úp: Hß║ít c├│ k├¡ch th╞░ß╗¢c ─æ╞░ß╗úc ─æiß╗üu chß╗ënh cho h├ám cß╗ºa ch├│ con giß╗æng vß╗½a, gi├║p ch├║ng dß╗à d├áng nhai v├á nuß╗æt.\r\n\r\nΓÜû∩╕Å Quy c├ích: T├║i 1kg\r\n\r\nH╞░ß╗¢ng dß║½n sß╗¡ dß╗Ñng: Tham khß║úo bß║úng khß║⌐u phß║ºn ─ân tr├¬n bao b├¼ ─æß╗â cho ─ân ─æ├║ng liß╗üu l╞░ß╗úng.',350000,150,'Food, Dog','APPROVED',NULL,'2025-11-29 16:26:12','2025-11-29 23:26:29');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reminders`
--

DROP TABLE IF EXISTS `reminders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reminders` (
  `reminder_id` char(25) NOT NULL,
  `pet_id` char(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('vaccination','vet_visit','feeding','grooming','medication','other') NOT NULL,
  `vaccination_type` varchar(255) DEFAULT NULL,
  `feeding_time` time DEFAULT NULL,
  `reminder_date` date NOT NULL,
  `frequency` enum('none','daily','weekly','monthly','yearly') DEFAULT 'none',
  `status` enum('pending','done') DEFAULT 'pending',
  `is_read` tinyint(1) DEFAULT '0',
  `is_instance` tinyint(1) DEFAULT '0',
  `email_sent` tinyint(1) DEFAULT '0',
  `created_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `end_date` date DEFAULT NULL,
  `dose_number` int DEFAULT NULL,
  `vaccine_id` char(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`reminder_id`),
  KEY `idx_reminders_pet_id` (`pet_id`),
  KEY `idx_reminders_reminder_date` (`reminder_date`),
  KEY `idx_reminders_created_at` (`created_at`),
  KEY `idx_reminders_is_read` (`is_read`),
  KEY `idx_reminders_frequency` (`frequency`),
  KEY `idx_reminders_end_date` (`end_date`),
  KEY `idx_reminders_vaccine_id` (`vaccine_id`),
  CONSTRAINT `reminders_ibfk_1` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `reminders_vaccine_id_fkey` FOREIGN KEY (`vaccine_id`) REFERENCES `vaccines` (`vaccine_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reminders`
--

LOCK TABLES `reminders` WRITE;
/*!40000 ALTER TABLE `reminders` DISABLE KEYS */;
INSERT INTO `reminders` VALUES ('cmign47nh0001ex3s1j9dhtco','3f624de691a8','vaccination','Rabies',NULL,'2025-12-23','none','done',1,0,0,'2025-11-26 16:32:58.683000','2025-11-29 02:05:30.770000',NULL,NULL,NULL),('cmijzjz2f0005exqstq4un48r','3f624de691a8','vaccination','Dß║íi',NULL,'2025-12-16','weekly','done',1,0,0,'2025-11-29 00:44:27.974000','2025-11-29 02:05:28.293000',NULL,NULL,NULL),('cmisrec6n0001extoved84ket','eaadf61eb9d5','vaccination',NULL,NULL,'2025-12-11','none','pending',0,0,0,'2025-12-05 04:06:03.694000','2025-12-05 04:06:03.694000',NULL,1,'0ca123121f6bdf4722be767a'),('cmisrec6v0003exto3naa211f','eaadf61eb9d5','vaccination',NULL,NULL,'2026-01-01','none','pending',0,0,0,'2025-12-05 04:06:03.703000','2025-12-05 04:06:03.703000',NULL,2,'0ca123121f6bdf4722be767a'),('cmisrec700005extomo8830lv','eaadf61eb9d5','vaccination',NULL,NULL,'2027-01-01','none','pending',0,0,0,'2025-12-05 04:06:03.709000','2025-12-05 04:06:03.709000',NULL,3,'0ca123121f6bdf4722be767a');
/*!40000 ALTER TABLE `reminders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int DEFAULT NULL,
  `service_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  `rating` int NOT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  KEY `reviews_product_id_idx` (`product_id`),
  KEY `reviews_service_id_idx` (`service_id`),
  KEY `reviews_user_id_idx` (`user_id`),
  CONSTRAINT `reviews_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `reviews_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `reviews_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,1,NULL,100,4,'Sß║ún phß║⌐m tß╗æt','2025-11-15 11:49:22','2025-11-15 11:49:22');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_appointments`
--

DROP TABLE IF EXISTS `service_appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_appointments` (
  `appointment_id` int NOT NULL AUTO_INCREMENT,
  `service_id` int NOT NULL,
  `user_id` int NOT NULL,
  `appointment_date` datetime NOT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`appointment_id`),
  KEY `service_appointments_service_id_idx` (`service_id`),
  KEY `service_appointments_user_id_idx` (`user_id`),
  CONSTRAINT `service_appointments_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `service_appointments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_appointments`
--

LOCK TABLES `service_appointments` WRITE;
/*!40000 ALTER TABLE `service_appointments` DISABLE KEYS */;
/*!40000 ALTER TABLE `service_appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `service_id` int NOT NULL AUTO_INCREMENT,
  `vendor_id` int NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `price` float NOT NULL,
  `duration` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`service_id`),
  KEY `services_vendor_id_idx` (`vendor_id`),
  CONSTRAINT `services_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`vendor_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('owner','vendor','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'owner',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `googleId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `facebookId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `avatar_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `users_email_key` (`email`),
  UNIQUE KEY `users_googleId_key` (`googleId`),
  UNIQUE KEY `users_facebookId_key` (`facebookId`),
  KEY `users_is_active_idx` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (100,'Pet Care Store Manager','veboy75144@gyknife.com','$2b$10$KblCr7im/fSMN3rfFYhVZeI1RObvGzq1/i1Ecez5JE/7ZXUdGz6pW','0901234567','admin',1,NULL,NULL,'2025-11-15 18:16:25.000',NULL),(101,'customer','palik48134@etramay.com','$2b$10$KblCr7im/fSMN3rfFYhVZeI1RObvGzq1/i1Ecez5JE/7ZXUdGz6pW',NULL,'owner',1,NULL,NULL,'2025-11-15 12:42:53.070',NULL),(102,'Pet Meo Store','xocawow229@okcdeals.com','$2b$10$KblCr7im/fSMN3rfFYhVZeI1RObvGzq1/i1Ecez5JE/7ZXUdGz6pW','0123456789','vendor',1,NULL,NULL,'2025-11-26 22:25:36.444',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vaccine_dose_schedules`
--

DROP TABLE IF EXISTS `vaccine_dose_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vaccine_dose_schedules` (
  `schedule_id` char(25) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vaccine_id` char(25) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dose_number` int NOT NULL,
  `days_after_previous` int NOT NULL DEFAULT '0',
  `is_booster` tinyint(1) NOT NULL DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`schedule_id`),
  UNIQUE KEY `unique_vaccine_dose` (`vaccine_id`,`dose_number`),
  KEY `idx_vaccine_dose_schedules_vaccine_id` (`vaccine_id`),
  CONSTRAINT `vaccine_dose_schedules_vaccine_id_fkey` FOREIGN KEY (`vaccine_id`) REFERENCES `vaccines` (`vaccine_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vaccine_dose_schedules`
--

LOCK TABLES `vaccine_dose_schedules` WRITE;
/*!40000 ALTER TABLE `vaccine_dose_schedules` DISABLE KEYS */;
INSERT INTO `vaccine_dose_schedules` VALUES ('167161541e96b01ec0b38997','5a4dd2fa8c81bd2027074dae',1,0,0,'First dose at 6-8 weeks'),('18aaa21a1d98865acff4c2db','5a4dd2fa8c81bd2027074dae',3,21,0,'Third dose at 12-14 weeks'),('28a3051730202521670e1a26','c5b59b165012b7c18a6b8851',1,0,0,'Initial dose'),('332efe90c84435481bf3c714','0ca123121f6bdf4722be767a',2,21,0,'Second dose'),('3dfbae2e1c717f3306ae80ba','dc2d76e9d4f1906c4a00ee75',2,21,0,'Second dose'),('6338c355342f2a4ac66cb001','685d19e5f330408d77ffdd15',3,21,0,'Third dose at 12-14 weeks'),('7ded4cd606848a03518c5af9','dc2d76e9d4f1906c4a00ee75',3,365,1,'Annual booster'),('80e468f6d4f708371716709e','0ca123121f6bdf4722be767a',3,365,1,'Annual booster'),('845d24369055a28bceec644a','dc2d76e9d4f1906c4a00ee75',1,0,0,'First dose'),('8bef139d716257db52956c7a','0ca123121f6bdf4722be767a',1,0,0,'First dose'),('a15cd0317be3af0a40c32480','5a4dd2fa8c81bd2027074dae',2,21,0,'Second dose at 9-11 weeks'),('a206cf2a7c5596a3a7633824','76947ee8a8fcf0d87a7ea46b',1,0,0,'Initial dose'),('aa581543a38742b659a440b3','685d19e5f330408d77ffdd15',2,21,0,'Second dose at 9-11 weeks'),('bf7a3f8672ab7c833b9e3712','c5b59b165012b7c18a6b8851',2,365,1,'Annual booster'),('c5d9ffd91e5611bd37fe959a','467b4f67d8d40249ceb3b69d',2,365,1,'Annual booster'),('cf310b70489d39d9b0cee98b','76947ee8a8fcf0d87a7ea46b',2,365,1,'Annual booster'),('df5b36371683c5f42cd17d52','685d19e5f330408d77ffdd15',4,365,1,'Annual booster'),('ea2a16feec86c3623d9856ee','5a4dd2fa8c81bd2027074dae',4,365,1,'Annual booster'),('f0ece9756ebcb09eb293b894','685d19e5f330408d77ffdd15',1,0,0,'First dose at 6-8 weeks'),('f49e43937e1e7605b074a323','467b4f67d8d40249ceb3b69d',1,0,0,'Initial dose');
/*!40000 ALTER TABLE `vaccine_dose_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vaccines`
--

DROP TABLE IF EXISTS `vaccines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vaccines` (
  `vaccine_id` char(25) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `species` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`vaccine_id`),
  KEY `idx_vaccines_species` (`species`),
  KEY `idx_vaccines_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vaccines`
--

LOCK TABLES `vaccines` WRITE;
/*!40000 ALTER TABLE `vaccines` DISABLE KEYS */;
INSERT INTO `vaccines` VALUES ('0ca123121f6bdf4722be767a','FeLV','cat','Feline Leukemia Virus vaccine',1,'2025-12-05 03:53:05.082000','2025-12-05 04:31:08.548000'),('467b4f67d8d40249ceb3b69d','Rabies','dog','Rabies vaccine protects against rabies virus',1,'2025-12-05 03:53:05.048000','2025-12-05 03:53:05.048000'),('5a4dd2fa8c81bd2027074dae','DHPP','dog','DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza) - Core vaccine',1,'2025-12-05 03:53:05.056000','2025-12-05 03:53:05.056000'),('685d19e5f330408d77ffdd15','FVRCP','cat','FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia) - Core vaccine',1,'2025-12-05 03:53:05.078000','2025-12-05 03:53:05.078000'),('76947ee8a8fcf0d87a7ea46b','Rabies','cat','Rabies vaccine protects against rabies virus',1,'2025-12-05 03:53:05.073000','2025-12-05 03:53:05.073000'),('c5b59b165012b7c18a6b8851','Bordetella','dog','Bordetella bronchiseptica vaccine (Kennel Cough)',1,'2025-12-05 03:53:05.062000','2025-12-05 03:53:05.062000'),('dc2d76e9d4f1906c4a00ee75','Lyme','dog','Lyme disease vaccine',1,'2025-12-05 03:53:05.067000','2025-12-05 03:53:05.067000');
/*!40000 ALTER TABLE `vaccines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendors`
--

DROP TABLE IF EXISTS `vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendors` (
  `vendor_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `store_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`vendor_id`),
  UNIQUE KEY `unique_user_vendor` (`user_id`),
  CONSTRAINT `fk_vendor_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendors`
--

LOCK TABLES `vendors` WRITE;
/*!40000 ALTER TABLE `vendors` DISABLE KEYS */;
INSERT INTO `vendors` VALUES (10,100,'Pet Care Premium Store','Cß╗¡a h├áng chuy├¬n cung cß║Ñp ─æß╗ô d├╣ng cao cß║Ñp cho th├║ c╞░ng vß╗¢i chß║Ñt l╞░ß╗úng h├áng ─æß║ºu. Cam kß║┐t sß║ún phß║⌐m ch├¡nh h├úng, an to├án cho th├║ c╞░ng.','123 Nguyß╗àn V─ân Linh, Ph╞░ß╗¥ng T├ón Ph├║, Quß║¡n 7, TP.HCM','0901234567',NULL,'approved',NULL,'2025-11-15 18:16:26.000','2025-11-15 18:16:26.000'),(11,102,'Pet Meo Store','Meo Meo','22 H├▓a Qu├╜, Ng┼⌐ H├ánh S╞ín','0123456789',NULL,'approved',NULL,'2025-11-27 00:00:40.386','2025-11-27 08:08:57.982'),(12,101,'Meo Meo Store',NULL,'32 H├▓a Xu├ón','0902246784',NULL,'approved',NULL,'2025-11-29 16:29:28.019','2025-11-29 23:29:39.364');
/*!40000 ALTER TABLE `vendors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'petcare'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-05 18:48:20
