-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: sijagolinkshare_app_db
-- ------------------------------------------------------
-- Server version	8.0.30

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
-- Table structure for table `admin_activity_logs`
--

DROP TABLE IF EXISTS `admin_activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_activity_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `details` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `admin_activity_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=230 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_activity_logs`
--

LOCK TABLES `admin_activity_logs` WRITE;
/*!40000 ALTER TABLE `admin_activity_logs` DISABLE KEYS */;
INSERT INTO `admin_activity_logs` VALUES (1,2,'login','{\"ip\": \"::1\"}','2025-04-20 10:33:10'),(2,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 10:33:50'),(3,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 10:33:50'),(4,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 10:33:54'),(5,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 10:33:55'),(6,2,'login','{\"ip\": \"::1\"}','2025-04-20 10:57:18'),(7,2,'view_transactions','{\"ip\": \"::1\", \"url\": \"/admin/transactions\", \"method\": \"GET\"}','2025-04-20 12:03:53'),(8,2,'view_transactions','{\"ip\": \"::1\", \"url\": \"/admin/transactions\", \"method\": \"GET\"}','2025-04-20 12:04:05'),(9,2,'login','{\"ip\": \"::1\"}','2025-04-20 12:05:22'),(10,2,'view_new_product','{\"ip\": \"::1\", \"url\": \"/admin/products/new\", \"method\": \"GET\"}','2025-04-20 12:05:46'),(11,2,'view_new_brand','{\"ip\": \"::1\", \"url\": \"/admin/brands/new\", \"method\": \"GET\"}','2025-04-20 12:06:24'),(12,2,'view_new_product','{\"ip\": \"::1\", \"url\": \"/admin/products/new\", \"method\": \"GET\"}','2025-04-20 12:06:39'),(13,2,'view_transactions','{\"ip\": \"::1\", \"url\": \"/admin/transactions\", \"method\": \"GET\"}','2025-04-20 12:06:54'),(14,2,'login','{\"ip\": \"::1\"}','2025-04-20 12:22:57'),(15,2,'view_new_product','{\"ip\": \"::1\", \"url\": \"/admin/products/new\", \"method\": \"GET\"}','2025-04-20 12:23:09'),(16,2,'login','{\"ip\": \"::1\"}','2025-04-20 12:35:04'),(17,2,'view_new_product','{\"ip\": \"::1\", \"url\": \"/admin/products/new\", \"method\": \"GET\"}','2025-04-20 12:35:05'),(18,2,'view_new_product','{\"ip\": \"::1\", \"url\": \"/admin/products/new\", \"method\": \"GET\"}','2025-04-20 12:41:03'),(19,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 12:41:20'),(20,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/bulk-import\", \"method\": \"GET\"}','2025-04-20 12:41:37'),(21,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 12:43:31'),(22,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/1/edit\", \"method\": \"GET\"}','2025-04-20 12:43:34'),(23,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/1\", \"method\": \"GET\"}','2025-04-20 12:43:38'),(24,2,'view_delete_product','{\"ip\": \"::1\", \"url\": \"/admin/products/1/delete\", \"method\": \"GET\"}','2025-04-20 12:43:57'),(25,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/1\", \"method\": \"GET\"}','2025-04-20 12:44:54'),(26,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 13:04:28'),(27,2,'view_new_product','{\"ip\": \"::1\", \"url\": \"/admin/products/new\", \"method\": \"GET\"}','2025-04-20 13:04:44'),(28,2,'login','{\"ip\": \"::1\"}','2025-04-20 13:07:15'),(29,2,'view_new_product','{\"ip\": \"::1\", \"url\": \"/admin/products/new\", \"method\": \"GET\"}','2025-04-20 13:07:16'),(30,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 13:07:30'),(31,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/1\", \"method\": \"GET\"}','2025-04-20 13:07:42'),(32,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/1/edit\", \"method\": \"GET\"}','2025-04-20 13:08:09'),(33,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/1/edit\", \"method\": \"GET\"}','2025-04-20 13:08:09'),(34,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/1\", \"method\": \"GET\"}','2025-04-20 13:09:06'),(35,2,'update_product','{\"ip\": \"::1\", \"url\": \"/admin/products/1/edit\", \"method\": \"POST\"}','2025-04-20 13:09:16'),(36,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/1\", \"method\": \"GET\"}','2025-04-20 13:09:17'),(37,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/2/edit\", \"method\": \"GET\"}','2025-04-20 13:09:30'),(38,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/2/edit\", \"method\": \"GET\"}','2025-04-20 13:09:30'),(39,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/2\", \"method\": \"GET\"}','2025-04-20 13:09:32'),(40,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/9\", \"method\": \"GET\"}','2025-04-20 13:09:44'),(41,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 13:09:48'),(42,2,'view_brands','{\"ip\": \"::1\", \"url\": \"/admin/brands\", \"method\": \"GET\"}','2025-04-20 13:09:51'),(43,2,'view_users','{\"ip\": \"::1\", \"url\": \"/admin/users\", \"method\": \"GET\"}','2025-04-20 13:09:55'),(44,2,'view_transactions','{\"ip\": \"::1\", \"url\": \"/admin/transactions\", \"method\": \"GET\"}','2025-04-20 13:10:01'),(45,2,'view_transactions','{\"ip\": \"::1\", \"url\": \"/admin/transactions\", \"method\": \"GET\"}','2025-04-20 13:10:14'),(46,2,'view_new_product','{\"ip\": \"::1\", \"url\": \"/admin/products/new\", \"method\": \"GET\"}','2025-04-20 13:10:42'),(47,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 13:11:01'),(48,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/2/edit\", \"method\": \"GET\"}','2025-04-20 13:12:33'),(49,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/2/edit\", \"method\": \"GET\"}','2025-04-20 13:12:33'),(50,2,'update_product','{\"ip\": \"::1\", \"url\": \"/admin/products/2/edit\", \"method\": \"POST\"}','2025-04-20 13:13:02'),(51,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/2\", \"method\": \"GET\"}','2025-04-20 13:13:02'),(52,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/2\", \"method\": \"GET\"}','2025-04-20 13:14:10'),(53,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products/\", \"method\": \"GET\"}','2025-04-20 13:14:13'),(54,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/2/edit\", \"method\": \"GET\"}','2025-04-20 13:14:18'),(55,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/2/edit\", \"method\": \"GET\"}','2025-04-20 13:14:18'),(56,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/2\", \"method\": \"GET\"}','2025-04-20 13:14:20'),(57,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products/\", \"method\": \"GET\"}','2025-04-20 13:14:23'),(58,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/1/edit\", \"method\": \"GET\"}','2025-04-20 13:14:27'),(59,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/1/edit\", \"method\": \"GET\"}','2025-04-20 13:14:28'),(60,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/1\", \"method\": \"GET\"}','2025-04-20 13:14:31'),(61,2,'view_new_product','{\"ip\": \"::1\", \"url\": \"/admin/products/new\", \"method\": \"GET\"}','2025-04-20 13:15:12'),(62,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 13:18:24'),(63,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/1/edit\", \"method\": \"GET\"}','2025-04-20 13:18:27'),(64,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/1/edit\", \"method\": \"GET\"}','2025-04-20 13:18:27'),(65,2,'update_product','{\"ip\": \"::1\", \"url\": \"/admin/products/1/edit\", \"method\": \"POST\"}','2025-04-20 13:18:32'),(66,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/1\", \"method\": \"GET\"}','2025-04-20 13:18:32'),(67,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products/\", \"method\": \"GET\"}','2025-04-20 13:18:40'),(68,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/2/edit\", \"method\": \"GET\"}','2025-04-20 13:18:41'),(69,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/2/edit\", \"method\": \"GET\"}','2025-04-20 13:18:41'),(70,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/2/edit\", \"method\": \"GET\"}','2025-04-20 13:18:42'),(71,2,'update_product','{\"ip\": \"::1\", \"url\": \"/admin/products/2/edit\", \"method\": \"POST\"}','2025-04-20 13:18:51'),(72,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/2\", \"method\": \"GET\"}','2025-04-20 13:18:51'),(73,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products/\", \"method\": \"GET\"}','2025-04-20 13:19:30'),(74,2,'view_new_product','{\"ip\": \"::1\", \"url\": \"/admin/products/new\", \"method\": \"GET\"}','2025-04-20 13:19:34'),(75,2,'view_new_product','{\"ip\": \"::1\", \"url\": \"/admin/products/new\", \"method\": \"GET\"}','2025-04-20 13:23:23'),(76,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 13:25:15'),(77,2,'view_transactions','{\"ip\": \"::1\", \"url\": \"/admin/transactions\", \"method\": \"GET\"}','2025-04-20 13:25:21'),(78,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/1\", \"method\": \"GET\"}','2025-04-20 13:25:30'),(79,2,'login','{\"ip\": \"::1\"}','2025-04-20 15:44:37'),(80,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 15:44:48'),(81,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 15:46:07'),(82,2,'login','{\"ip\": \"::1\"}','2025-04-20 15:46:25'),(83,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 15:46:25'),(84,2,'login','{\"ip\": \"::1\"}','2025-04-20 15:49:10'),(85,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 15:49:10'),(86,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 15:50:09'),(87,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/1\", \"method\": \"GET\"}','2025-04-20 15:50:13'),(88,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products?page=2&sort=id&order=ASC\", \"method\": \"GET\"}','2025-04-20 15:50:17'),(89,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products?page=1&sort=id&order=ASC\", \"method\": \"GET\"}','2025-04-20 15:50:21'),(90,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/1/edit\", \"method\": \"GET\"}','2025-04-20 15:50:23'),(91,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/1/edit\", \"method\": \"GET\"}','2025-04-20 15:50:23'),(92,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/1\", \"method\": \"GET\"}','2025-04-20 15:50:25'),(93,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products/\", \"method\": \"GET\"}','2025-04-20 15:50:30'),(94,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/9\", \"method\": \"GET\"}','2025-04-20 15:51:19'),(95,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 15:51:28'),(96,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/1/edit\", \"method\": \"GET\"}','2025-04-20 15:51:30'),(97,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/1/edit\", \"method\": \"GET\"}','2025-04-20 15:51:30'),(98,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/1/edit\", \"method\": \"GET\"}','2025-04-20 15:51:31'),(99,2,'update_product','{\"ip\": \"::1\", \"url\": \"/admin/products/1/edit\", \"method\": \"POST\"}','2025-04-20 15:51:34'),(100,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/1\", \"method\": \"GET\"}','2025-04-20 15:51:34'),(101,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/1\", \"method\": \"GET\"}','2025-04-20 15:55:35'),(102,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 15:55:46'),(103,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/1/edit\", \"method\": \"GET\"}','2025-04-20 15:55:48'),(104,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/1/edit\", \"method\": \"GET\"}','2025-04-20 15:55:49'),(105,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/1\", \"method\": \"GET\"}','2025-04-20 15:55:50'),(106,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 15:55:53'),(107,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/1/edit\", \"method\": \"GET\"}','2025-04-20 15:55:56'),(108,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/1/edit\", \"method\": \"GET\"}','2025-04-20 15:55:57'),(109,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/1\", \"method\": \"GET\"}','2025-04-20 15:56:00'),(110,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 15:56:01'),(111,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/1/edit\", \"method\": \"GET\"}','2025-04-20 15:56:03'),(112,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/1/edit\", \"method\": \"GET\"}','2025-04-20 15:56:03'),(113,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/1\", \"method\": \"GET\"}','2025-04-20 15:56:05'),(114,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/1\", \"method\": \"GET\"}','2025-04-20 16:00:27'),(115,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 16:01:30'),(116,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products?page=2&sort=id&order=ASC\", \"method\": \"GET\"}','2025-04-20 16:01:40'),(117,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products?sort=id&order=DESC&page=1\", \"method\": \"GET\"}','2025-04-20 16:01:44'),(118,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products?sort=price&order=DESC&page=1\", \"method\": \"GET\"}','2025-04-20 16:01:53'),(119,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products?sort=price&order=DESC&page=1\", \"method\": \"GET\"}','2025-04-20 16:12:55'),(120,2,'view_new_product','{\"ip\": \"::1\", \"url\": \"/admin/products/new\", \"method\": \"GET\"}','2025-04-20 16:12:58'),(121,2,'create_product','{\"ip\": \"::1\", \"url\": \"/admin/products/new\", \"method\": \"POST\"}','2025-04-20 16:13:48'),(122,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 16:13:48'),(123,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products?page=2&sort=id&order=ASC\", \"method\": \"GET\"}','2025-04-20 16:13:53'),(124,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/23\", \"method\": \"GET\"}','2025-04-20 16:14:03'),(125,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 16:14:10'),(126,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products?page=2&sort=id&order=ASC\", \"method\": \"GET\"}','2025-04-20 16:15:02'),(127,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/21/edit\", \"method\": \"GET\"}','2025-04-20 16:34:11'),(128,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/21/edit\", \"method\": \"GET\"}','2025-04-20 16:34:12'),(129,2,'update_product','{\"ip\": \"::1\", \"url\": \"/admin/products/21/edit\", \"method\": \"POST\"}','2025-04-20 16:34:19'),(130,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/21\", \"method\": \"GET\"}','2025-04-20 16:34:19'),(131,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/21/edit\", \"method\": \"GET\"}','2025-04-20 16:34:26'),(132,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/21/edit\", \"method\": \"GET\"}','2025-04-20 16:34:27'),(133,2,'update_product','{\"ip\": \"::1\", \"url\": \"/admin/products/21/edit\", \"method\": \"POST\"}','2025-04-20 16:34:31'),(134,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/21\", \"method\": \"GET\"}','2025-04-20 16:34:31'),(135,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 16:34:39'),(136,2,'view_users','{\"ip\": \"::1\", \"url\": \"/admin/users\", \"method\": \"GET\"}','2025-04-20 16:38:57'),(137,2,'view_users','{\"ip\": \"::1\", \"url\": \"/admin/users\", \"method\": \"GET\"}','2025-04-20 16:39:48'),(138,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/2\", \"method\": \"GET\"}','2025-04-20 16:41:55'),(139,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/3\", \"method\": \"GET\"}','2025-04-20 16:42:08'),(140,2,'view_users','{\"ip\": \"::1\", \"url\": \"/admin/users\", \"method\": \"GET\"}','2025-04-20 16:44:02'),(141,2,'view_transactions','{\"ip\": \"::1\", \"url\": \"/admin/transactions\", \"method\": \"GET\"}','2025-04-20 16:44:09'),(142,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/1\", \"method\": \"GET\"}','2025-04-20 16:44:15'),(143,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/2\", \"method\": \"GET\"}','2025-04-20 16:44:18'),(144,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/4\", \"method\": \"GET\"}','2025-04-20 16:44:23'),(145,2,'view_transaction_details','{\"ip\": \"::1\", \"url\": \"/admin/transactions/new\", \"method\": \"GET\"}','2025-04-20 16:44:39'),(146,2,'view_transactions','{\"ip\": \"::1\", \"url\": \"/admin/transactions\", \"method\": \"GET\"}','2025-04-20 16:45:54'),(147,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/6\", \"method\": \"GET\"}','2025-04-20 16:48:31'),(148,2,'view_users','{\"ip\": \"::1\", \"url\": \"/admin/users\", \"method\": \"GET\"}','2025-04-20 16:56:53'),(149,2,'login','{\"ip\": \"::1\"}','2025-04-20 16:57:36'),(150,2,'view_users','{\"ip\": \"::1\", \"url\": \"/admin/users\", \"method\": \"GET\"}','2025-04-20 16:58:03'),(151,2,'login','{\"ip\": \"::1\"}','2025-04-20 16:58:28'),(152,2,'view_users','{\"ip\": \"::1\", \"url\": \"/admin/users\", \"method\": \"GET\"}','2025-04-20 16:58:42'),(153,2,'view_users','{\"ip\": \"::1\", \"url\": \"/admin/users\", \"method\": \"GET\"}','2025-04-20 17:14:21'),(154,2,'view_users','{\"ip\": \"::1\", \"url\": \"/admin/users\", \"method\": \"GET\"}','2025-04-20 17:14:22'),(155,2,'view_users','{\"ip\": \"::1\", \"url\": \"/admin/users\", \"method\": \"GET\"}','2025-04-20 17:14:28'),(156,2,'view_users','{\"ip\": \"::1\", \"url\": \"/admin/users\", \"method\": \"GET\"}','2025-04-20 17:14:28'),(157,2,'login','{\"ip\": \"::1\"}','2025-04-20 17:15:16'),(158,2,'view_users','{\"ip\": \"::1\", \"url\": \"/admin/users\", \"method\": \"GET\"}','2025-04-20 17:15:16'),(159,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/1\", \"method\": \"GET\"}','2025-04-20 17:15:25'),(160,2,'view_users','{\"ip\": \"::1\", \"url\": \"/admin/users\", \"method\": \"GET\"}','2025-04-20 17:15:35'),(161,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/2\", \"method\": \"GET\"}','2025-04-20 17:16:00'),(162,2,'view_users','{\"ip\": \"::1\", \"url\": \"/admin/users\", \"method\": \"GET\"}','2025-04-20 17:16:32'),(163,2,'view_delete_user','{\"ip\": \"::1\", \"url\": \"/admin/users/6/delete\", \"method\": \"GET\"}','2025-04-20 17:16:37'),(164,2,'delete_user','{\"ip\": \"::1\", \"url\": \"/admin/users/6/delete\", \"method\": \"POST\"}','2025-04-20 17:16:41'),(165,2,'view_users','{\"ip\": \"::1\", \"url\": \"/admin/users\", \"method\": \"GET\"}','2025-04-20 17:16:41'),(166,2,'login','{\"ip\": \"::1\"}','2025-04-20 17:20:35'),(167,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/9\", \"method\": \"GET\"}','2025-04-20 17:20:39'),(168,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 17:20:47'),(169,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products?page=2&sort=id&order=ASC\", \"method\": \"GET\"}','2025-04-20 17:20:49'),(170,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products?page=2&sort=id&order=ASC\", \"method\": \"GET\"}','2025-04-20 17:20:49'),(171,2,'view_product_details','{\"ip\": \"::1\", \"url\": \"/admin/products/23\", \"method\": \"GET\"}','2025-04-20 17:20:51'),(172,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 17:20:57'),(173,2,'login','{\"ip\": \"::1\"}','2025-04-20 17:38:34'),(174,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-20 17:38:34'),(175,2,'view_users','{\"ip\": \"::1\", \"url\": \"/admin/users\", \"method\": \"GET\"}','2025-04-20 17:38:44'),(176,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/9\", \"method\": \"GET\"}','2025-04-20 17:38:51'),(177,2,'view_users','{\"ip\": \"::1\", \"url\": \"/admin/users\", \"method\": \"GET\"}','2025-04-20 17:39:00'),(178,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/5\", \"method\": \"GET\"}','2025-04-20 17:39:05'),(179,2,'view_users','{\"ip\": \"::1\", \"url\": \"/admin/users\", \"method\": \"GET\"}','2025-04-20 17:39:09'),(180,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/2\", \"method\": \"GET\"}','2025-04-20 17:39:17'),(181,2,'view_users','{\"ip\": \"::1\", \"url\": \"/admin/users\", \"method\": \"GET\"}','2025-04-20 17:39:22'),(182,2,'login','{\"ip\": \"::1\"}','2025-04-21 06:46:45'),(183,2,'login','{\"ip\": \"::1\"}','2025-04-21 07:13:42'),(184,2,'login','{\"ip\": \"::1\"}','2025-04-21 07:26:21'),(185,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-21 09:26:49'),(186,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-21 09:45:44'),(187,2,'view_brands','{\"ip\": \"::1\", \"url\": \"/admin/brands\", \"method\": \"GET\"}','2025-04-21 09:45:52'),(188,2,'view_transactions','{\"ip\": \"::1\", \"url\": \"/admin/transactions\", \"method\": \"GET\"}','2025-04-21 09:46:33'),(189,2,'view_transactions','{\"ip\": \"::1\", \"url\": \"/admin/transactions\", \"method\": \"GET\"}','2025-04-21 09:46:42'),(190,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-21 09:54:21'),(191,2,'view_brands','{\"ip\": \"::1\", \"url\": \"/admin/brands\", \"method\": \"GET\"}','2025-04-21 09:54:24'),(192,2,'view_transactions','{\"ip\": \"::1\", \"url\": \"/admin/transactions\", \"method\": \"GET\"}','2025-04-21 09:54:59'),(193,2,'view_transactions','{\"ip\": \"::1\", \"url\": \"/admin/transactions\", \"method\": \"GET\"}','2025-04-21 09:55:04'),(194,2,'view_transactions','{\"ip\": \"::1\", \"url\": \"/admin/transactions\", \"method\": \"GET\"}','2025-04-21 09:55:10'),(195,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/2\", \"method\": \"GET\", \"targetId\": \"2\"}','2025-04-21 09:55:17'),(196,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/2\", \"method\": \"GET\", \"targetId\": \"2\"}','2025-04-21 10:05:33'),(197,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/2\", \"method\": \"GET\", \"targetId\": \"2\"}','2025-04-21 10:08:50'),(198,2,'view_brands','{\"ip\": \"::1\", \"url\": \"/admin/brands\", \"method\": \"GET\"}','2025-04-21 10:09:56'),(199,2,'view_transactions','{\"ip\": \"::1\", \"url\": \"/admin/transactions\", \"method\": \"GET\"}','2025-04-22 07:17:56'),(200,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/2\", \"method\": \"GET\", \"targetId\": \"2\"}','2025-04-22 07:18:04'),(201,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/10\", \"method\": \"GET\", \"targetId\": \"10\"}','2025-04-22 07:35:40'),(202,2,'view_brand_details','{\"ip\": \"::1\", \"url\": \"/admin/brands/1\", \"method\": \"GET\", \"targetId\": \"1\"}','2025-04-23 04:39:41'),(203,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/2\", \"method\": \"GET\", \"targetId\": \"2\"}','2025-04-23 04:39:43'),(204,2,'view_brands','{\"ip\": \"::1\", \"url\": \"/admin/brands\", \"method\": \"GET\"}','2025-04-23 04:39:47'),(205,2,'view_order','{\"ip\": \"::1\", \"url\": \"/admin/orders/new\", \"method\": \"GET\", \"targetId\": \"new\"}','2025-04-23 04:39:47'),(206,2,'view_transactions','{\"ip\": \"::1\", \"url\": \"/admin/transactions\", \"method\": \"GET\"}','2025-04-23 04:39:51'),(207,2,'view_new_product','{\"ip\": \"::1\", \"url\": \"/admin/products/new\", \"method\": \"GET\"}','2025-04-23 04:40:02'),(208,2,'view_order','{\"ip\": \"::1\", \"url\": \"/admin/orders/new\", \"method\": \"GET\", \"targetId\": \"new\"}','2025-04-23 04:40:03'),(209,2,'view_transactions','{\"ip\": \"::1\", \"url\": \"/admin/transactions\", \"method\": \"GET\"}','2025-04-23 04:40:03'),(210,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/10\", \"method\": \"GET\", \"targetId\": \"10\"}','2025-04-23 04:40:55'),(211,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/9\", \"method\": \"GET\", \"targetId\": \"9\"}','2025-04-23 04:41:06'),(212,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/1\", \"method\": \"GET\", \"targetId\": \"1\"}','2025-04-23 04:41:24'),(213,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/2\", \"method\": \"GET\", \"targetId\": \"2\"}','2025-04-23 04:41:43'),(214,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/9\", \"method\": \"GET\", \"targetId\": \"9\"}','2025-04-23 04:41:58'),(215,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/9\", \"method\": \"GET\", \"targetId\": \"9\"}','2025-04-23 04:42:21'),(216,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/9\", \"method\": \"GET\", \"targetId\": \"9\"}','2025-04-23 04:42:59'),(217,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/9\", \"method\": \"GET\", \"targetId\": \"9\"}','2025-04-23 04:44:23'),(218,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/9\", \"method\": \"GET\", \"targetId\": \"9\"}','2025-04-23 04:44:32'),(219,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/9\", \"method\": \"GET\", \"targetId\": \"9\"}','2025-04-23 04:45:05'),(220,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/9\", \"method\": \"GET\", \"targetId\": \"9\"}','2025-04-23 04:45:32'),(221,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/9\", \"method\": \"GET\", \"targetId\": \"9\"}','2025-04-23 04:46:31'),(222,2,'view_user_details','{\"ip\": \"::1\", \"url\": \"/admin/users/9\", \"method\": \"GET\", \"targetId\": \"9\"}','2025-04-23 05:09:47'),(223,2,'view_transactions','{\"ip\": \"::1\", \"url\": \"/admin/transactions\", \"method\": \"GET\"}','2025-04-23 05:10:57'),(224,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-23 05:11:00'),(225,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/1/edit\", \"method\": \"GET\", \"targetId\": \"1\"}','2025-04-23 05:11:04'),(226,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/1/edit\", \"method\": \"GET\", \"targetId\": \"1\"}','2025-04-23 05:11:05'),(227,2,'view_products','{\"ip\": \"::1\", \"url\": \"/admin/products\", \"method\": \"GET\"}','2025-04-23 05:11:26'),(228,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/1/edit\", \"method\": \"GET\", \"targetId\": \"1\"}','2025-04-23 05:11:31'),(229,2,'view_edit_product','{\"ip\": \"::1\", \"url\": \"/admin/products/1/edit\", \"method\": \"GET\", \"targetId\": \"1\"}','2025-04-23 05:11:31');
/*!40000 ALTER TABLE `admin_activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_sessions`
--

DROP TABLE IF EXISTS `admin_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `device_info` text,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_token` (`session_token`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `admin_sessions_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_sessions`
--

LOCK TABLES `admin_sessions` WRITE;
/*!40000 ALTER TABLE `admin_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `role` enum('admin','superadmin','editor') NOT NULL DEFAULT 'admin',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_users`
--

LOCK TABLES `admin_users` WRITE;
/*!40000 ALTER TABLE `admin_users` DISABLE KEYS */;
INSERT INTO `admin_users` VALUES (2,'admin','admin@example.com','$2b$10$Hh/ey87hpIPXMG9eImKGsunr5YDA534pXIN9uPlC.6c5BCWxGL9Ye','Admin User','superadmin','2025-04-20 10:32:21','2025-04-20 10:32:59'),(3,'superadmin','superadmin@example.com','$2b$10$Hh/ey87hpIPXMG9eImKGsunr5YDA534pXIN9uPlC.6c5BCWxGL9Ye','Super Admin','superadmin','2025-04-21 04:27:50','2025-04-21 04:27:50'),(4,'editor','editor@example.com','$2b$10$Hh/ey87hpIPXMG9eImKGsunr5YDA534pXIN9uPlC.6c5BCWxGL9Ye','Editor User','editor','2025-04-21 04:27:50','2025-04-21 04:27:50'),(5,'admin2','admin2@example.com','$2b$10$Hh/ey87hpIPXMG9eImKGsunr5YDA534pXIN9uPlC.6c5BCWxGL9Ye','Admin User 2','admin','2025-04-21 04:27:50','2025-04-21 04:27:50');
/*!40000 ALTER TABLE `admin_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `affiliate_links`
--

DROP TABLE IF EXISTS `affiliate_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `affiliate_links` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `link_code` varchar(100) NOT NULL,
  `clicks` int DEFAULT '0',
  `conversions` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `link_code` (`link_code`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `affiliate_links_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `affiliate_links_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `affiliate_links`
--

LOCK TABLES `affiliate_links` WRITE;
/*!40000 ALTER TABLE `affiliate_links` DISABLE KEYS */;
/*!40000 ALTER TABLE `affiliate_links` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `brands`
--

DROP TABLE IF EXISTS `brands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brands` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `cashback_percentage` decimal(5,2) DEFAULT '0.00',
  `products_count` int DEFAULT '0',
  `description` text,
  `featured` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `priority` int NOT NULL DEFAULT '100',
  PRIMARY KEY (`id`),
  KEY `idx_brands_priority` (`priority`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brands`
--

LOCK TABLES `brands` WRITE;
/*!40000 ALTER TABLE `brands` DISABLE KEYS */;
INSERT INTO `brands` VALUES (1,'Unilever Indonesia','/images/brands/unilever.png',11.53,5,'Unilever is a British multinational consumer goods company that produces food, beverages, cleaning agents, and personal care products.',1,'2025-04-19 10:59:17','2025-04-20 16:13:48',100),(2,'ERIGO Official Shop','/images/brands/erigo.png',7.21,3,'Erigo is an Indonesian fashion brand that offers a wide range of casual and streetwear clothing for men and women.',1,'2025-04-19 10:59:17','2025-04-19 16:40:18',100),(3,'JINISO Official Shop','/images/brands/jiniso.png',4.32,2,'JINISO is a local brand specializing in high-quality clothing with unique designs for young people.',0,'2025-04-19 10:59:17','2025-04-19 16:40:18',100),(4,'Samsung Official','/images/brands/samsung.png',5.50,1,'Samsung is a South Korean multinational electronics company that offers a wide range of consumer electronics products.',1,'2025-04-19 10:59:17','2025-04-19 16:40:18',100),(5,'Xiaomi Official Store','/images/brands/xiaomi.png',6.75,1,'Xiaomi is a Chinese electronics company that designs and manufactures smartphones, laptops, and other consumer electronics.',1,'2025-04-19 10:59:17','2025-04-19 16:40:18',100),(6,'Shopee','/images/brands/shopee.png',3.50,3,'The leading e-commerce platform in Southeast Asia',0,'2025-04-19 11:18:37','2025-04-19 16:40:18',1),(7,'TikTok','/images/brands/tiktok.png',2.75,2,'Short-form video hosting service and e-commerce platform',0,'2025-04-19 11:18:37','2025-04-19 16:40:18',4),(8,'Tokopedia','/images/brands/tokopedia.png',3.00,2,'Indonesian e-commerce company',0,'2025-04-19 11:18:37','2025-04-19 16:40:18',2),(9,'Lazada','/images/brands/lazada.png',2.50,3,'Southeast Asian e-commerce platform',0,'2025-04-19 11:18:37','2025-04-19 16:40:18',3),(10,'Zalora','/images/brands/zalora.png',4.00,2,'Fashion e-commerce site in Asia',0,'2025-04-19 11:18:37','2025-04-19 16:40:18',100);
/*!40000 ALTER TABLE `brands` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `link_clicks`
--

DROP TABLE IF EXISTS `link_clicks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `link_clicks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `affiliate_link_id` int NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `referrer` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `affiliate_link_id` (`affiliate_link_id`),
  CONSTRAINT `link_clicks_ibfk_1` FOREIGN KEY (`affiliate_link_id`) REFERENCES `affiliate_links` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `link_clicks`
--

LOCK TABLES `link_clicks` WRITE;
/*!40000 ALTER TABLE `link_clicks` DISABLE KEYS */;
/*!40000 ALTER TABLE `link_clicks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `type` enum('transaction','system','promotion') NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `link` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
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
  `quantity` int NOT NULL DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL,
  `cashback_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,1,1,31296.00,1564.00,'2025-04-21 04:27:29'),(2,2,1,1,105239.00,5261.00,'2025-04-21 04:27:29'),(3,3,1,1,78992.00,3949.00,'2025-04-21 04:27:29'),(4,4,1,1,47988.00,2399.00,'2025-04-21 04:27:29'),(5,5,1,1,100854.00,5042.00,'2025-04-21 04:27:29'),(6,6,1,1,15683.00,784.00,'2025-04-21 04:27:29'),(7,7,1,1,26677.00,1333.00,'2025-04-21 04:27:29'),(8,8,1,1,95320.00,4766.00,'2025-04-21 04:27:29'),(9,9,1,1,50476.00,2523.00,'2025-04-21 04:27:29'),(10,10,1,1,39231.00,1961.00,'2025-04-21 04:27:29'),(11,11,1,1,56254.00,2812.00,'2025-04-21 04:27:29'),(12,12,1,1,92043.00,4602.00,'2025-04-21 04:27:29'),(13,13,1,1,100002.00,5000.00,'2025-04-21 04:27:29'),(14,14,1,1,30744.00,1537.00,'2025-04-21 04:27:29'),(15,15,1,1,80149.00,4007.00,'2025-04-21 04:27:29'),(16,16,1,1,29550.00,1477.00,'2025-04-21 04:27:29'),(17,17,1,1,16841.00,842.00,'2025-04-21 04:27:29'),(18,18,1,1,106194.00,5309.00,'2025-04-21 04:27:29'),(19,19,1,1,57269.00,2863.00,'2025-04-21 04:27:29'),(20,20,1,1,101443.00,5072.00,'2025-04-21 04:27:29'),(32,1,1,2,10500.00,520.00,'2025-04-21 04:27:57'),(33,1,3,1,10296.00,524.00,'2025-04-21 04:27:57'),(34,2,5,1,50000.00,2500.00,'2025-04-21 04:27:57'),(35,2,9,1,55239.00,2761.00,'2025-04-21 04:27:57'),(36,3,8,1,78992.00,3949.00,'2025-04-21 04:27:57'),(37,4,4,1,47988.00,2399.00,'2025-04-21 04:27:57'),(38,5,7,1,50000.00,2500.00,'2025-04-21 04:27:57'),(39,5,10,1,50854.00,2542.00,'2025-04-21 04:27:57'),(40,6,2,1,15683.00,784.00,'2025-04-21 04:27:57'),(41,7,3,1,26677.00,1333.00,'2025-04-21 04:27:57');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_status_history`
--

DROP TABLE IF EXISTS `order_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_status_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `old_status` enum('pending','processing','completed','cancelled') DEFAULT NULL,
  `new_status` enum('pending','processing','completed','cancelled') NOT NULL,
  `notes` text,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_status_history`
--

LOCK TABLES `order_status_history` WRITE;
/*!40000 ALTER TABLE `order_status_history` DISABLE KEYS */;
INSERT INTO `order_status_history` VALUES (1,1,NULL,'cancelled',NULL,NULL,'2025-04-21 04:27:29'),(2,2,NULL,'cancelled',NULL,NULL,'2025-04-21 04:27:29'),(3,3,NULL,'processing',NULL,NULL,'2025-04-21 04:27:29'),(4,4,NULL,'processing',NULL,NULL,'2025-04-21 04:27:29'),(5,5,NULL,'processing',NULL,NULL,'2025-04-21 04:27:29'),(6,6,NULL,'completed',NULL,NULL,'2025-04-21 04:27:29'),(7,7,NULL,'processing',NULL,NULL,'2025-04-21 04:27:29'),(8,8,NULL,'pending',NULL,NULL,'2025-04-21 04:27:29'),(9,9,NULL,'processing',NULL,NULL,'2025-04-21 04:27:29'),(10,10,NULL,'cancelled',NULL,NULL,'2025-04-21 04:27:29'),(11,11,NULL,'pending',NULL,NULL,'2025-04-21 04:27:29'),(12,12,NULL,'cancelled',NULL,NULL,'2025-04-21 04:27:29'),(13,13,NULL,'pending',NULL,NULL,'2025-04-21 04:27:29'),(14,14,NULL,'processing',NULL,NULL,'2025-04-21 04:27:29'),(15,15,NULL,'completed',NULL,NULL,'2025-04-21 04:27:29'),(16,16,NULL,'completed',NULL,NULL,'2025-04-21 04:27:29'),(17,17,NULL,'processing',NULL,NULL,'2025-04-21 04:27:29'),(18,18,NULL,'cancelled',NULL,NULL,'2025-04-21 04:27:29'),(19,19,NULL,'pending',NULL,NULL,'2025-04-21 04:27:29'),(20,20,NULL,'completed',NULL,NULL,'2025-04-21 04:27:29');
/*!40000 ALTER TABLE `order_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `cashback_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('pending','processing','completed','cancelled') NOT NULL DEFAULT 'pending',
  `shipping_status` enum('pending','shipped','delivered') DEFAULT 'pending',
  `notes` text,
  `payment_method` varchar(50) DEFAULT NULL,
  `shipping_address` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,9,'ORD-70592051-0',31296.00,1564.00,'cancelled','pending','Leave at the front door','Credit Card','Jl. Gatot Subroto No. 45, Jakarta Selatan','2025-04-20 17:36:32','2025-04-21 04:28:11'),(2,9,'ORD-70592057-1',105239.00,5261.00,'cancelled','pending','Call before delivery','Credit Card','Jl. Merdeka No. 67, Bandung','2025-04-20 17:36:32','2025-04-21 04:28:11'),(3,9,'ORD-70592060-2',78992.00,3949.00,'processing','shipped',NULL,'Credit Card','Jl. Sudirman No. 123, Jakarta Pusat','2025-04-20 17:36:32','2025-04-21 04:28:11'),(4,9,'ORD-70592063-3',47988.00,2399.00,'processing','shipped',NULL,'Credit Card','Jl. Gatot Subroto No. 45, Jakarta Selatan','2025-04-20 17:36:32','2025-04-21 04:28:11'),(5,9,'ORD-70592065-4',100854.00,5042.00,'processing','shipped','Please deliver in the morning','Credit Card','Jl. Merdeka No. 67, Bandung','2025-04-20 17:36:32','2025-04-21 04:28:11'),(6,9,'ORD-70592068-5',15683.00,784.00,'completed','delivered','Leave at the front door','Credit Card','Jl. Sudirman No. 123, Jakarta Pusat','2025-04-20 17:36:32','2025-04-21 04:28:11'),(7,9,'ORD-70592070-6',26677.00,1333.00,'processing','shipped','Call before delivery','Credit Card','Jl. Gatot Subroto No. 45, Jakarta Selatan','2025-04-20 17:36:32','2025-04-21 04:28:11'),(8,9,'ORD-70592074-7',95320.00,4766.00,'pending','pending',NULL,'Credit Card','Jl. Merdeka No. 67, Bandung','2025-04-20 17:36:32','2025-04-21 04:28:11'),(9,9,'ORD-70592077-8',50476.00,2523.00,'processing','shipped',NULL,'Credit Card','Jl. Sudirman No. 123, Jakarta Pusat','2025-04-20 17:36:32','2025-04-21 04:28:11'),(10,9,'ORD-70592080-9',39231.00,1961.00,'cancelled','pending','Please deliver in the morning','Credit Card','Jl. Gatot Subroto No. 45, Jakarta Selatan','2025-04-20 17:36:32','2025-04-21 04:28:11'),(11,10,'ORD-70701180-0',56254.00,2812.00,'pending','pending','Leave at the front door','Credit Card','Jl. Merdeka No. 67, Bandung','2025-04-20 17:38:21','2025-04-21 04:28:11'),(12,10,'ORD-70701187-1',92043.00,4602.00,'cancelled','pending','Call before delivery','Credit Card','Jl. Sudirman No. 123, Jakarta Pusat','2025-04-20 17:38:21','2025-04-21 04:28:11'),(13,10,'ORD-70701189-2',100002.00,5000.00,'pending','pending',NULL,'Credit Card','Jl. Gatot Subroto No. 45, Jakarta Selatan','2025-04-20 17:38:21','2025-04-21 04:28:11'),(14,10,'ORD-70701192-3',30744.00,1537.00,'processing','shipped',NULL,'Credit Card','Jl. Merdeka No. 67, Bandung','2025-04-20 17:38:21','2025-04-21 04:28:11'),(15,10,'ORD-70701194-4',80149.00,4007.00,'completed','delivered','Please deliver in the morning','Credit Card','Jl. Sudirman No. 123, Jakarta Pusat','2025-04-20 17:38:21','2025-04-21 04:28:11'),(16,10,'ORD-70701196-5',29550.00,1477.00,'completed','delivered','Leave at the front door','Credit Card','Jl. Gatot Subroto No. 45, Jakarta Selatan','2025-04-20 17:38:21','2025-04-21 04:28:11'),(17,10,'ORD-70701199-6',16841.00,842.00,'processing','shipped','Call before delivery','Credit Card','Jl. Merdeka No. 67, Bandung','2025-04-20 17:38:21','2025-04-21 04:28:11'),(18,10,'ORD-70701201-7',106194.00,5309.00,'cancelled','pending',NULL,'Credit Card','Jl. Sudirman No. 123, Jakarta Pusat','2025-04-20 17:38:21','2025-04-21 04:28:11'),(19,10,'ORD-70701202-8',57269.00,2863.00,'pending','pending',NULL,'Credit Card','Jl. Gatot Subroto No. 45, Jakarta Selatan','2025-04-20 17:38:21','2025-04-21 04:28:11'),(20,10,'ORD-70701204-9',101443.00,5072.00,'completed','delivered','Please deliver in the morning','Credit Card','Jl. Merdeka No. 67, Bandung','2025-04-20 17:38:21','2025-04-21 04:28:11');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_order_status_complete` AFTER UPDATE ON `orders` FOR EACH ROW BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Insert a transaction record for the cashback
        INSERT INTO `user_transactions` 
            (user_id, amount, transaction_type, status, reference_id, reference_type, description)
        VALUES 
            (NEW.user_id, NEW.cashback_amount, 'cashback', 'completed', 
             CONCAT('ORD-', NEW.id), 'order', 
             CONCAT('Cashback from order #', NEW.order_number));
             
        -- Update user balance
        INSERT INTO `user_balances` (user_id, available_balance, pending_balance, total_earned)
        VALUES (NEW.user_id, NEW.cashback_amount, 0, NEW.cashback_amount)
        ON DUPLICATE KEY UPDATE 
            available_balance = available_balance + NEW.cashback_amount,
            total_earned = total_earned + NEW.cashback_amount;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_resets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `token` varchar(100) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_resets`
--

LOCK TABLES `password_resets` WRITE;
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_resets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_categories`
--

DROP TABLE IF EXISTS `product_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `parent_id` int DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `product_categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `product_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_categories`
--

LOCK TABLES `product_categories` WRITE;
/*!40000 ALTER TABLE `product_categories` DISABLE KEYS */;
INSERT INTO `product_categories` VALUES (1,'Fashion',NULL,'/images/categories/fashion.jpg','2025-04-19 10:59:17','2025-04-19 10:59:17'),(2,'Electronics',NULL,'/images/categories/electronics.jpg','2025-04-19 10:59:17','2025-04-19 10:59:17'),(3,'Beauty',NULL,'/images/categories/beauty.jpg','2025-04-19 10:59:17','2025-04-19 10:59:17'),(4,'Home & Living',NULL,'/images/categories/home.jpg','2025-04-19 10:59:17','2025-04-19 10:59:17'),(5,'Accessories',NULL,'/images/categories/accessories.jpg','2025-04-19 10:59:17','2025-04-19 10:59:17'),(6,'Men\'s Fashion',1,'/images/categories/mens-fashion.jpg','2025-04-19 10:59:17','2025-04-19 10:59:17'),(7,'Women\'s Fashion',1,'/images/categories/womens-fashion.jpg','2025-04-19 10:59:17','2025-04-19 10:59:17'),(8,'Smartphones',2,'/images/categories/smartphones.jpg','2025-04-19 10:59:17','2025-04-19 10:59:17'),(9,'Laptops',2,'/images/categories/laptops.jpg','2025-04-19 10:59:17','2025-04-19 10:59:17'),(10,'Skincare',3,'/images/categories/skincare.jpg','2025-04-19 10:59:17','2025-04-19 10:59:17'),(11,'Makeup',3,'/images/categories/makeup.jpg','2025-04-19 10:59:17','2025-04-19 10:59:17');
/*!40000 ALTER TABLE `product_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_category_mapping`
--

DROP TABLE IF EXISTS `product_category_mapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_category_mapping` (
  `product_id` int NOT NULL,
  `category_id` int NOT NULL,
  PRIMARY KEY (`product_id`,`category_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `product_category_mapping_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_category_mapping_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_category_mapping`
--

LOCK TABLES `product_category_mapping` WRITE;
/*!40000 ALTER TABLE `product_category_mapping` DISABLE KEYS */;
INSERT INTO `product_category_mapping` VALUES (4,1),(5,1),(6,1),(7,1),(8,1),(9,2),(10,2),(1,3),(2,3),(3,3),(1,5),(2,5),(4,7),(5,7),(6,7),(7,7),(8,7),(9,9),(10,9);
/*!40000 ALTER TABLE `product_category_mapping` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `cashback_percentage` decimal(5,2) DEFAULT '0.00',
  `category` varchar(50) DEFAULT NULL,
  `brand` varchar(50) DEFAULT NULL,
  `stock` int DEFAULT '0',
  `featured` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Dove Deodorant Serum','Dove deodorant serum with 1% Niacinamide + 10% Vit C&E for long-lasting protection and skin brightening.',209000.00,'/images/products/dove-deodorant.jpg',10.00,'Person','Unilever Indonesia',100,1,'2025-04-19 10:59:17','2025-04-20 15:51:34'),(2,'Vaseline Lip Therapy 1','New Vaseline Color & Care 3g with SPF15 for soft, moisturized lips with a hint of color.',22000.00,'/images/products/vaseline.jpg',11.10,'Personal Care','Unilever Indonesia',150,0,'2025-04-19 10:59:17','2025-04-20 13:18:51'),(3,'Dove Creambath','Dove Hair Growth Creambath 30g with keratin and vitamin E for strong, healthy hair.',38600.00,'/images/products/dove-creambath.jpg',11.53,'Personal Care','Unilever Indonesia',80,0,'2025-04-19 10:59:17','2025-04-19 10:59:17'),(4,'Erigo T-Shirt Kanji','New arrival casual t-shirt with Japanese Kanji design, made of premium cotton for comfort all day.',169000.00,'/images/products/erigo-tshirt.jpg',7.21,'Fashion','ERIGO Official Shop',50,1,'2025-04-19 10:59:17','2025-04-19 10:59:17'),(5,'Erigo Winter Jacket','Premium winter jacket with waterproof material and thermal insulation, perfect for cold weather.',243000.00,'/images/products/erigo-jacket.jpg',7.21,'Fashion','ERIGO Official Shop',30,1,'2025-04-19 10:59:17','2025-04-19 10:59:17'),(6,'Erigo Graphic Tee Urban','Graphic print t-shirt with urban design and soft cotton material for everyday wear.',74000.00,'/images/products/erigo-graphic.jpg',7.21,'Fashion','ERIGO Official Shop',65,0,'2025-04-19 10:59:17','2025-04-19 10:59:17'),(7,'JINISO Casual Shirt','Comfortable casual shirt for daily use with wrinkle-resistant fabric and modern cut.',129000.00,'/images/products/jiniso-shirt.jpg',4.32,'Fashion','JINISO Official Shop',40,0,'2025-04-19 10:59:17','2025-04-19 10:59:17'),(8,'JINISO Denim Pants','High quality denim pants with stretch material for comfort and style, available in multiple washes.',259000.00,'/images/products/jiniso-pants.jpg',4.32,'Fashion','JINISO Official Shop',25,1,'2025-04-19 10:59:17','2025-04-19 10:59:17'),(9,'Samsung Galaxy S22','Latest Samsung flagship smartphone with 6.1\" Dynamic AMOLED display, 8GB RAM, and powerful camera system.',9999000.00,'/images/products/samsung-s22.jpg',5.50,'Electronics','Samsung Official',15,1,'2025-04-19 10:59:17','2025-04-19 10:59:17'),(10,'Xiaomi Redmi Note 11','Affordable smartphone with 6.43\" AMOLED display, Snapdragon 680 processor, and 50MP quad camera.',2799000.00,'/images/products/xiaomi-redmi.jpg',6.75,'Electronics','Xiaomi Official Store',30,1,'2025-04-19 10:59:17','2025-04-19 10:59:17'),(11,'Smartphone X','The latest smartphone with amazing features',2499000.00,'/images/products/smartphone-x.jpg',2.50,'Electronics','Shopee',0,0,'2025-04-19 11:18:37','2025-04-19 11:18:37'),(12,'Wireless Earbuds','High-quality wireless earbuds with noise cancellation',899000.00,'/images/products/wireless-earbuds.jpg',3.00,'Electronics','TikTok',0,0,'2025-04-19 11:18:37','2025-04-19 11:18:37'),(13,'Men\'s Casual Shirt','Comfortable casual shirt for everyday wear',199000.00,'/images/products/mens-shirt.jpg',4.00,'Fashion','Tokopedia',0,0,'2025-04-19 11:18:37','2025-04-19 11:18:37'),(14,'Vitamin C Serum','Brightening serum for radiant skin',159000.00,'/images/products/vitamin-c-serum.jpg',3.50,'Beauty','Shopee',0,0,'2025-04-19 11:18:37','2025-04-19 11:18:37'),(15,'Smart Watch','Track your fitness and stay connected',1299000.00,'/images/products/smart-watch.jpg',2.00,'Electronics','Lazada',0,0,'2025-04-19 11:18:37','2025-04-19 11:18:37'),(16,'Organic Coffee Beans','Premium organic coffee beans from Indonesia',89000.00,'/images/products/coffee-beans.jpg',2.50,'Groceries','Tokopedia',0,0,'2025-04-19 11:18:37','2025-04-19 11:18:37'),(17,'Gaming Headset','Immersive gaming experience with surround sound',799000.00,'/images/products/gaming-headset.jpg',3.00,'Electronics','TikTok',0,0,'2025-04-19 11:18:37','2025-04-19 11:18:37'),(18,'Yoga Mat','Non-slip yoga mat for comfortable workout',129000.00,'/images/products/yoga-mat.jpg',4.50,'Sports','Zalora',0,0,'2025-04-19 11:18:37','2025-04-19 11:18:37'),(19,'Kitchen Blender','Powerful blender for smoothies and food preparation',349000.00,'/images/products/blender.jpg',2.00,'Home','Lazada',0,0,'2025-04-19 11:18:37','2025-04-19 11:18:37'),(20,'Women\'s Running Shoes','Comfortable shoes for running and workout',599000.00,'/images/products/running-shoes.jpg',3.50,'Fashion','Zalora',0,0,'2025-04-19 11:18:37','2025-04-19 11:18:37'),(21,'Stainless Steel Water Bottle','Keep your drinks hot or cold for hours',100000.00,'/images/products/water-bottle.jpg',2.00,'Home','Shopee',0,0,'2025-04-19 11:18:37','2025-04-20 16:34:31'),(22,'Wireless Mouse','Ergonomic wireless mouse for comfortable use',199000.00,'/images/products/wireless-mouse.jpg',2.50,'Electronics','Lazada',0,0,'2025-04-19 11:18:37','2025-04-19 11:18:37'),(23,'Test Product UI Baru','loremipsumsitdoloramet',88888.00,'/images/products/product-1745165628222-516876175.webp',7.00,'test','Unilever Indonesia',0,0,'2025-04-20 16:13:48','2025-04-20 16:13:48');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_product_insert` AFTER INSERT ON `products` FOR EACH ROW BEGIN
    UPDATE brands 
    SET products_count = products_count + 1 
    WHERE name = NEW.brand;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_product_update` AFTER UPDATE ON `products` FOR EACH ROW BEGIN
    IF OLD.brand != NEW.brand THEN
        -- Decrement count for old brand
        UPDATE brands SET products_count = products_count - 1 
        WHERE name = OLD.brand;

        -- Increment count for new brand
        UPDATE brands SET products_count = products_count + 1 
        WHERE name = NEW.brand;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_product_delete` AFTER DELETE ON `products` FOR EACH ROW BEGIN
    UPDATE brands 
    SET products_count = products_count - 1 
    WHERE name = OLD.brand;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `search_history`
--

DROP TABLE IF EXISTS `search_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `search_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `search_term` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `search_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `search_history`
--

LOCK TABLES `search_history` WRITE;
/*!40000 ALTER TABLE `search_history` DISABLE KEYS */;
INSERT INTO `search_history` VALUES (1,1,'t-shirt','2025-04-19 10:59:19'),(2,1,'skincare','2025-04-19 10:59:19'),(3,1,'phone case','2025-04-19 10:59:19'),(4,1,'shoes','2025-04-19 10:59:19'),(5,1,'laptop','2025-04-19 10:59:19');
/*!40000 ALTER TABLE `search_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text,
  `setting_group` varchar(50) DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES (1,'site_name','MOVA','general',1,'2025-04-20 05:43:29','2025-04-20 05:43:29'),(2,'site_description','Belanja Sambil Cuan','general',1,'2025-04-20 05:43:29','2025-04-20 05:43:29'),(3,'contact_email','contact@mova.app','contact',1,'2025-04-20 05:43:29','2025-04-20 05:43:29'),(4,'support_email','support@mova.app','contact',1,'2025-04-20 05:43:29','2025-04-20 05:43:29'),(5,'minimum_withdrawal','10000','transaction',1,'2025-04-20 05:43:29','2025-04-20 05:43:29'),(6,'default_cashback_percentage','5','transaction',1,'2025-04-20 05:43:29','2025-04-20 05:43:29'),(7,'enable_registration','true','users',1,'2025-04-20 05:43:29','2025-04-20 05:43:29'),(8,'require_email_verification','true','users',1,'2025-04-20 05:43:29','2025-04-20 05:43:29');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_activities`
--

DROP TABLE IF EXISTS `user_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_activities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `device_info` text,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_activities_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_activities`
--

LOCK TABLES `user_activities` WRITE;
/*!40000 ALTER TABLE `user_activities` DISABLE KEYS */;
INSERT INTO `user_activities` VALUES (1,9,'login','User logged into the system','127.0.0.1',NULL,'2025-04-20 10:36:32'),(2,9,'password_change','User updated their profile information','127.0.0.1',NULL,'2025-04-14 10:36:32'),(3,9,'order_placed','User updated their profile information','127.0.0.1',NULL,'2025-04-14 10:36:32'),(5,9,'profile_update','User removed item from cart','127.0.0.1',NULL,'2025-04-04 10:36:32'),(7,9,'profile_update','User logged into the system','127.0.0.1',NULL,'2025-04-07 10:36:32'),(8,9,'password_change','User added product to wishlist','127.0.0.1',NULL,'2025-04-14 10:36:32'),(9,9,'logout','User viewed product details','127.0.0.1',NULL,'2025-04-08 10:36:32'),(10,9,'logout','User updated their profile information','127.0.0.1',NULL,'2025-04-13 10:36:32'),(13,9,'logout','User added item to cart','127.0.0.1',NULL,'2025-04-01 10:36:32'),(14,9,'password_change','User removed product from wishlist','127.0.0.1',NULL,'2025-04-20 10:36:32'),(15,9,'profile_update','User placed a new order #ORD-12345678','127.0.0.1',NULL,'2025-04-10 10:36:32'),(17,9,'order_placed','User added item to cart','127.0.0.1',NULL,'2025-04-07 10:36:32'),(19,9,'login','User viewed product details','127.0.0.1',NULL,'2025-04-02 10:36:32'),(23,10,'order_placed','User logged into the system','127.0.0.1',NULL,'2025-04-09 10:38:21'),(24,10,'login','User viewed product details','127.0.0.1',NULL,'2025-03-31 10:38:21'),(25,10,'logout','User logged out of the system','127.0.0.1',NULL,'2025-04-01 10:38:21'),(26,10,'logout','User viewed product details','127.0.0.1',NULL,'2025-04-03 10:38:21'),(27,10,'login','User updated their profile information','127.0.0.1',NULL,'2025-04-04 10:38:21'),(30,10,'logout','User added item to cart','127.0.0.1',NULL,'2025-04-16 10:38:21'),(31,10,'password_change','User updated their profile information','127.0.0.1',NULL,'2025-04-04 10:38:21'),(32,10,'login','User removed product from wishlist','127.0.0.1',NULL,'2025-04-07 10:38:21'),(34,10,'login','User viewed product details','127.0.0.1',NULL,'2025-04-06 10:38:21'),(35,10,'profile_update','User logged out of the system','127.0.0.1',NULL,'2025-04-08 10:38:21'),(37,10,'profile_update','User viewed product details','127.0.0.1',NULL,'2025-04-12 10:38:21'),(39,10,'logout','User logged into the system','127.0.0.1',NULL,'2025-04-14 10:38:21'),(40,10,'password_change','User updated their profile information','127.0.0.1',NULL,'2025-04-08 10:38:21');
/*!40000 ALTER TABLE `user_activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_balances`
--

DROP TABLE IF EXISTS `user_balances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_balances` (
  `user_id` int NOT NULL,
  `available_balance` decimal(10,2) NOT NULL DEFAULT '0.00',
  `pending_balance` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_earned` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_withdrawn` decimal(10,2) NOT NULL DEFAULT '0.00',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `user_balances_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_balances`
--

LOCK TABLES `user_balances` WRITE;
/*!40000 ALTER TABLE `user_balances` DISABLE KEYS */;
INSERT INTO `user_balances` VALUES (1,45000.00,0.00,45000.00,0.00,'2025-04-21 04:27:43'),(2,50000.00,0.00,75000.00,25000.00,'2025-04-21 04:28:44'),(3,45000.00,15000.00,60000.00,0.00,'2025-04-21 04:28:44'),(4,45000.00,0.00,45000.00,0.00,'2025-04-21 04:27:43'),(5,35000.00,0.00,35000.00,0.00,'2025-04-21 04:27:43'),(9,5000.00,5000.00,15000.00,0.00,'2025-04-21 04:28:44'),(10,20000.00,0.00,20000.00,0.00,'2025-04-21 04:27:43');
/*!40000 ALTER TABLE `user_balances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_device_tokens`
--

DROP TABLE IF EXISTS `user_device_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_device_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `device_token` varchar(255) NOT NULL,
  `device_type` enum('ios','android','web') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_device_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_device_tokens`
--

LOCK TABLES `user_device_tokens` WRITE;
/*!40000 ALTER TABLE `user_device_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_device_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `device_info` text,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_sessions`
--

LOCK TABLES `user_sessions` WRITE;
/*!40000 ALTER TABLE `user_sessions` DISABLE KEYS */;
INSERT INTO `user_sessions` VALUES (1,1,'d6f4cdc2-f466-49c0-a202-d9df5ae5c4ce','Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1','2025-05-19 18:54:08','2025-04-19 11:54:08'),(2,1,'667598c8-966a-4e62-a0b2-4ac65d542c94','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36','2025-05-19 19:18:29','2025-04-19 12:18:28'),(3,1,'e083f5df-4a86-42eb-afb3-00cd82790ca1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36','2025-05-19 22:48:04','2025-04-19 15:48:04'),(4,1,'b00c6db6-06ad-4ea7-a66c-deced423bcd3','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36','2025-05-19 23:13:51','2025-04-19 16:13:50'),(5,1,'0941d0d3-7f80-4c14-98f2-12efd2030a8c','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36','2025-05-19 23:52:48','2025-04-19 16:52:47'),(6,1,'b8115199-5522-4417-81b4-828b49d6a91e','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36','2025-05-19 23:58:53','2025-04-19 16:58:53'),(7,1,'57753713-33a4-4541-bc62-cb2ca9d52c9a','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36','2025-05-20 00:00:04','2025-04-19 17:00:03');
/*!40000 ALTER TABLE `user_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_transactions`
--

DROP TABLE IF EXISTS `user_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `transaction_type` enum('cashback','referral_bonus','withdrawal','adjustment','order_refund') NOT NULL,
  `status` enum('pending','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
  `reference_id` varchar(100) DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `description` text,
  `balance_before` decimal(10,2) DEFAULT NULL,
  `balance_after` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `status` (`status`),
  KEY `transaction_type` (`transaction_type`),
  CONSTRAINT `user_transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_transactions`
--

LOCK TABLES `user_transactions` WRITE;
/*!40000 ALTER TABLE `user_transactions` DISABLE KEYS */;
INSERT INTO `user_transactions` VALUES (1,1,15000.00,'cashback','completed','ORD-12345','order','Cashback from order #ORD-12345',30000.00,45000.00,'2025-04-21 04:28:18','2025-04-21 04:28:18'),(2,1,5000.00,'referral_bonus','completed','REF-12345','referral','Referral bonus from user testuser2',25000.00,30000.00,'2025-04-21 04:28:18','2025-04-21 04:28:18'),(3,2,25000.00,'cashback','completed','ORD-23456','order','Cashback from order #ORD-23456',50000.00,75000.00,'2025-04-21 04:28:18','2025-04-21 04:28:18'),(4,3,60000.00,'cashback','completed','ORD-34567','order','Cashback from order #ORD-34567',0.00,60000.00,'2025-04-21 04:28:18','2025-04-21 04:28:18'),(5,9,10000.00,'cashback','completed','ORD-12346','order','Cashback from order #ORD-12346',0.00,10000.00,'2025-04-21 04:28:18','2025-04-21 04:28:18'),(6,9,5000.00,'cashback','pending','ORD-12347','order','Pending cashback from order #ORD-12347',10000.00,15000.00,'2025-04-21 04:28:18','2025-04-21 04:28:18'),(7,10,20000.00,'cashback','completed','ORD-12348','order','Cashback from order #ORD-12348',0.00,20000.00,'2025-04-21 04:28:18','2025-04-21 04:28:18'),(8,2,-25000.00,'withdrawal','completed','WDR-123456','withdrawal','Withdrawal to Mandiri (9876543210)',75000.00,50000.00,'2025-04-21 04:28:33','2025-04-21 04:28:33'),(9,3,-15000.00,'withdrawal','pending','WDR-123457','withdrawal','Withdrawal request processing',60000.00,45000.00,'2025-04-21 04:28:33','2025-04-21 04:28:33'),(10,9,-5000.00,'withdrawal','pending','WDR-123458','withdrawal','Withdrawal request processing',10000.00,5000.00,'2025-04-21 04:28:33','2025-04-21 04:28:33');
/*!40000 ALTER TABLE `user_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_wishlists`
--

DROP TABLE IF EXISTS `user_wishlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_wishlists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `user_wishlists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_wishlists_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_wishlists`
--

LOCK TABLES `user_wishlists` WRITE;
/*!40000 ALTER TABLE `user_wishlists` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_wishlists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_withdrawal_methods`
--

DROP TABLE IF EXISTS `user_withdrawal_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_withdrawal_methods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `method_type` enum('bank_transfer','e_wallet') NOT NULL,
  `account_name` varchar(100) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `bank_name` varchar(50) DEFAULT NULL,
  `ewallet_provider` varchar(50) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_withdrawal_methods_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_withdrawal_methods`
--

LOCK TABLES `user_withdrawal_methods` WRITE;
/*!40000 ALTER TABLE `user_withdrawal_methods` DISABLE KEYS */;
INSERT INTO `user_withdrawal_methods` VALUES (1,1,'bank_transfer','Test User','1234567890','BCA',NULL,NULL,1,'2025-04-19 10:59:19','2025-04-19 10:59:19'),(2,1,'e_wallet','Test User',NULL,NULL,'GoPay','081234567890',0,'2025-04-19 10:59:19','2025-04-19 10:59:19'),(3,2,'bank_transfer','Top User 1','9876543210','Mandiri',NULL,NULL,1,'2025-04-21 04:28:23','2025-04-21 04:28:23'),(4,3,'bank_transfer','Top User 2','8765432109','BNI',NULL,NULL,1,'2025-04-21 04:28:23','2025-04-21 04:28:23'),(5,3,'e_wallet','Top User 2',NULL,NULL,'OVO','081234567891',0,'2025-04-21 04:28:23','2025-04-21 04:28:23'),(6,9,'bank_transfer','Test User 1','7654321098','BCA',NULL,NULL,0,'2025-04-21 04:28:23','2025-04-21 04:28:23'),(7,9,'e_wallet','Test User 1',NULL,NULL,'Dana','081234567892',1,'2025-04-21 04:28:23','2025-04-21 04:28:23');
/*!40000 ALTER TABLE `user_withdrawal_methods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_withdrawals`
--

DROP TABLE IF EXISTS `user_withdrawals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_withdrawals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `withdrawal_method_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `fee` decimal(10,2) DEFAULT '0.00',
  `status` enum('pending','processing','completed','failed') DEFAULT 'pending',
  `reference_id` varchar(100) DEFAULT NULL,
  `transaction_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `withdrawal_method_id` (`withdrawal_method_id`),
  KEY `user_withdrawals_transaction_fk` (`transaction_id`),
  CONSTRAINT `user_withdrawals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_withdrawals_ibfk_2` FOREIGN KEY (`withdrawal_method_id`) REFERENCES `user_withdrawal_methods` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_withdrawals_transaction_fk` FOREIGN KEY (`transaction_id`) REFERENCES `user_transactions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_withdrawals`
--

LOCK TABLES `user_withdrawals` WRITE;
/*!40000 ALTER TABLE `user_withdrawals` DISABLE KEYS */;
INSERT INTO `user_withdrawals` VALUES (1,2,1,25000.00,1000.00,'completed','WDR-123456',8,'2025-04-21 04:28:28','2025-04-21 04:28:37'),(2,3,2,15000.00,1000.00,'processing','WDR-123457',9,'2025-04-21 04:28:28','2025-04-21 04:28:37'),(3,9,5,5000.00,500.00,'pending','WDR-123458',10,'2025-04-21 04:28:28','2025-04-21 04:28:37');
/*!40000 ALTER TABLE `user_withdrawals` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_withdrawal_status_change` AFTER UPDATE ON `user_withdrawals` FOR EACH ROW BEGIN
    DECLARE transaction_id INT;
    
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Create a withdrawal transaction if not already exists
        IF NEW.transaction_id IS NULL THEN
            INSERT INTO `user_transactions`
                (user_id, amount, transaction_type, status, reference_id, reference_type, description)
            VALUES
                (NEW.user_id, -NEW.amount, 'withdrawal', 'completed',
                 CONCAT('WDR-', NEW.id), 'withdrawal',
                 CONCAT('Withdrawal to ', 
                    (SELECT 
                        CASE 
                            WHEN method_type = 'bank_transfer' THEN CONCAT(bank_name, ' (', account_number, ')')
                            ELSE CONCAT(ewallet_provider, ' (', phone_number, ')')
                        END
                    FROM user_withdrawal_methods WHERE id = NEW.withdrawal_method_id)));
                    
            -- Get the newly created transaction ID
            SET transaction_id = LAST_INSERT_ID();
            
            -- Update the withdrawal with the transaction ID
            UPDATE `user_withdrawals` SET transaction_id = transaction_id WHERE id = NEW.id;
        ELSE
            -- Update existing transaction to completed
            UPDATE `user_transactions` 
            SET status = 'completed', updated_at = NOW()
            WHERE id = NEW.transaction_id;
        END IF;
        
        -- Update user balance
        UPDATE `user_balances` 
        SET available_balance = available_balance - NEW.amount,
            total_withdrawn = total_withdrawn + NEW.amount
        WHERE user_id = NEW.user_id;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `verification_token` varchar(100) DEFAULT NULL,
  `verification_expires` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'testuser','test@example.com','$2b$10$U2AywT5wxy/q1L.vpAvsNO3hRSkW5rGZw4ukbMigUHryszC0/QABO','Test User',NULL,1,NULL,NULL,'2025-04-19 10:59:18','2025-04-19 17:00:29'),(2,'topuser1','top1@example.com','$2b$10$vjMWnhehzhpFa0agzw/A7.cuk4Dzli.YuGgQfSZdlDkFcP.iDxcEe','Top User 1',NULL,0,NULL,NULL,'2025-04-19 10:59:18','2025-04-19 10:59:18'),(3,'topuser2','top2@example.com','$2b$10$vjMWnhehzhpFa0agzw/A7.cuk4Dzli.YuGgQfSZdlDkFcP.iDxcEe','Top User 2',NULL,0,NULL,NULL,'2025-04-19 10:59:18','2025-04-19 10:59:18'),(4,'topuser3','top3@example.com','$2b$10$vjMWnhehzhpFa0agzw/A7.cuk4Dzli.YuGgQfSZdlDkFcP.iDxcEe','Top User 3',NULL,0,NULL,NULL,'2025-04-19 10:59:18','2025-04-19 10:59:18'),(5,'topuser4','top4@example.com','$2b$10$vjMWnhehzhpFa0agzw/A7.cuk4Dzli.YuGgQfSZdlDkFcP.iDxcEe','Top User 4',NULL,0,NULL,NULL,'2025-04-19 10:59:19','2025-04-19 10:59:19'),(9,'testuser1','testuser1@example.com','$2b$10$zeIvnwgk95x224uOW5p5RObzRi4AjWNxXsvW9q6sRpZGUPiFczxxy','Test User',NULL,1,NULL,NULL,'2025-04-20 17:36:31','2025-04-20 17:36:31'),(10,'adminuser1','adminuser1@example.com','$2b$10$lm7l8fl9X.cCGOZEbk.68eAT5b3/IVdgZGP2H.DgpwoDFXXv7686O','Admin User',NULL,1,NULL,NULL,'2025-04-20 17:36:32','2025-04-20 17:36:32');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'sijagolinkshare_app_db'
--
/*!50003 DROP PROCEDURE IF EXISTS `cleanup_expired_sessions` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `cleanup_expired_sessions`()
BEGIN
                DELETE FROM user_sessions WHERE expires_at < NOW();
                DELETE FROM admin_sessions WHERE expires_at < NOW();
                DELETE FROM password_resets WHERE expires_at < NOW();
            END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `initialize_user_balances` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `initialize_user_balances`()
BEGIN
    -- Create balances for all users
    INSERT INTO user_balances (user_id, available_balance, pending_balance, total_earned, total_withdrawn)
    SELECT 
        u.id,
        COALESCE(SUM(CASE 
            WHEN t.type = 'successful' THEN t.amount
            ELSE 0
        END), 0) as available_balance,
        COALESCE(SUM(CASE 
            WHEN t.type = 'pending' THEN t.amount
            ELSE 0
        END), 0) as pending_balance,
        COALESCE(SUM(CASE 
            WHEN t.type = 'successful' THEN t.amount
            ELSE 0
        END), 0) as total_earned,
        0 as total_withdrawn
    FROM 
        users u
    LEFT JOIN 
        (SELECT * FROM user_transactions WHERE id > 0) t ON u.id = t.user_id
    GROUP BY 
        u.id
    ON DUPLICATE KEY UPDATE
        available_balance = VALUES(available_balance),
        pending_balance = VALUES(pending_balance),
        total_earned = VALUES(total_earned);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `migrate_orders_to_order_items` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `migrate_orders_to_order_items`()
BEGIN
    -- This assumes most orders were for single products
    -- In real migration, you'd need more complex logic based on your data
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, cashback_amount)
    SELECT 
        o.id, 
        -- Use a default product ID for existing orders (adjust as needed)
        COALESCE((SELECT id FROM products ORDER BY id LIMIT 1), 1) as product_id, 
        1, 
        o.total_amount, 
        o.cashback_amount
    FROM 
        orders o
    LEFT JOIN
        order_items oi ON o.id = oi.order_id
    WHERE
        oi.id IS NULL;
        
    -- Create initial status history
    INSERT INTO order_status_history (order_id, old_status, new_status)
    SELECT 
        id, 
        NULL, 
        status
    FROM 
        orders o
    WHERE 
        NOT EXISTS (SELECT 1 FROM order_status_history h WHERE h.order_id = o.id);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `process_withdrawal_request` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `process_withdrawal_request`(
    IN p_withdrawal_id INT,
    IN p_status ENUM('pending', 'processing', 'completed', 'failed'),
    IN p_notes TEXT
)
BEGIN
    DECLARE v_user_id INT;
    DECLARE v_amount DECIMAL(10,2);
    DECLARE v_current_status ENUM('pending', 'processing', 'completed', 'failed');
    DECLARE v_transaction_id INT DEFAULT NULL;
    DECLARE v_current_balance DECIMAL(10,2);
    
    -- Get withdrawal information
    SELECT user_id, amount, status, transaction_id
    INTO v_user_id, v_amount, v_current_status, v_transaction_id
    FROM user_withdrawals
    WHERE id = p_withdrawal_id;
    
    -- Check if user has sufficient balance for pending withdrawals
    IF p_status = 'processing' AND v_current_status = 'pending' THEN
        SELECT available_balance INTO v_current_balance
        FROM user_balances
        WHERE user_id = v_user_id;
        
        IF v_current_balance < v_amount THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Insufficient balance to process withdrawal';
        END IF;
    END IF;
    
    -- If new withdrawal request is being processed, create transaction and reserve funds
    IF p_status = 'processing' AND v_current_status = 'pending' THEN
        -- Create transaction for the withdrawal request
        INSERT INTO user_transactions
            (user_id, amount, transaction_type, status, reference_id, reference_type, description)
        VALUES
            (v_user_id, -v_amount, 'withdrawal', 'pending',
             CONCAT('WDR-', p_withdrawal_id), 'withdrawal',
             'Withdrawal request processing');
             
        -- Get the newly created transaction ID
        SET v_transaction_id = LAST_INSERT_ID();
        
        -- Update withdrawal with transaction ID
        UPDATE user_withdrawals 
        SET status = p_status, 
            transaction_id = v_transaction_id,
            updated_at = NOW()
        WHERE id = p_withdrawal_id;
        
        -- Reserve the funds from available balance
        UPDATE user_balances
        SET available_balance = available_balance - v_amount,
            pending_balance = pending_balance + v_amount
        WHERE user_id = v_user_id;
    ELSE
        -- Just update the status
        UPDATE user_withdrawals 
        SET status = p_status, updated_at = NOW()
        WHERE id = p_withdrawal_id;
    END IF;
    
    -- Handle completed withdrawals
    IF p_status = 'completed' AND v_current_status = 'processing' THEN
        -- Update transaction to completed
        UPDATE user_transactions
        SET status = 'completed', updated_at = NOW()
        WHERE id = v_transaction_id;
        
        -- Move from pending to withdrawn
        UPDATE user_balances
        SET pending_balance = pending_balance - v_amount,
            total_withdrawn = total_withdrawn + v_amount
        WHERE user_id = v_user_id;
    END IF;
    
    -- Handle failed withdrawals
    IF p_status = 'failed' AND (v_current_status = 'pending' OR v_current_status = 'processing') THEN
        -- Update transaction to failed
        IF v_transaction_id IS NOT NULL THEN
            UPDATE user_transactions
            SET status = 'failed', updated_at = NOW()
            WHERE id = v_transaction_id;
        END IF;
        
        -- Return funds to available balance if was processing
        IF v_current_status = 'processing' THEN
            UPDATE user_balances
            SET pending_balance = pending_balance - v_amount,
                available_balance = available_balance + v_amount
            WHERE user_id = v_user_id;
        END IF;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sync_product_counts` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sync_product_counts`()
BEGIN
                UPDATE brands b
                SET products_count = (
                    SELECT COUNT(*) FROM products p WHERE p.brand = b.name
                );
            END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-30 19:50:55
