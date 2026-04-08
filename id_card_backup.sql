-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: id_card_system
-- ------------------------------------------------------
-- Server version	8.0.43

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
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `admin_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES (1,'admin123','admin123','2026-04-08 12:46:56');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `dept_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`dept_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--

LOCK TABLES `department` WRITE;
/*!40000 ALTER TABLE `department` DISABLE KEYS */;
INSERT INTO `department` VALUES (1,'Computer Science','Department of Computer Science and Engineering'),(2,'Mechanical Engineering','Department of Mechanical Engineering'),(3,'Electrical Engineering','Department of Electrical Engineering'),(4,'Business Administration','School of Business and Management');
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `id_card`
--

DROP TABLE IF EXISTS `id_card`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `id_card` (
  `card_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `issue_date` date NOT NULL,
  `expiration_date` date NOT NULL,
  `status` enum('Active','Lost','Expired','Revoked') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`card_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `id_card_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `id_card`
--

LOCK TABLES `id_card` WRITE;
/*!40000 ALTER TABLE `id_card` DISABLE KEYS */;
INSERT INTO `id_card` VALUES (1,1,'2026-04-08','2030-04-08','Lost','2026-04-08 12:51:02'),(2,2,'2026-04-08','2030-04-08','Active','2026-04-08 13:41:26'),(3,3,'2026-04-08','2030-04-08','Active','2026-04-08 13:56:06'),(4,8,'2026-04-08','2030-04-08','Active','2026-04-08 15:00:43'),(5,8,'2026-04-08','2030-04-08','Active','2026-04-08 15:00:56');
/*!40000 ALTER TABLE `id_card` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lost_id_card`
--

DROP TABLE IF EXISTS `lost_id_card`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lost_id_card` (
  `lost_id` int NOT NULL AUTO_INCREMENT,
  `card_id` int NOT NULL,
  `report_date` date NOT NULL,
  `fine_amount` decimal(10,2) DEFAULT '50.00',
  `status` enum('Pending','Paid') DEFAULT 'Pending',
  PRIMARY KEY (`lost_id`),
  KEY `card_id` (`card_id`),
  CONSTRAINT `lost_id_card_ibfk_1` FOREIGN KEY (`card_id`) REFERENCES `id_card` (`card_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lost_id_card`
--

LOCK TABLES `lost_id_card` WRITE;
/*!40000 ALTER TABLE `lost_id_card` DISABLE KEYS */;
INSERT INTO `lost_id_card` VALUES (1,1,'2026-04-08',50.00,'Paid');
/*!40000 ALTER TABLE `lost_id_card` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student` (
  `student_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `dob` date NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `dept_id` int DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `password_hash` varchar(255) DEFAULT 'student123',
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `email` (`email`),
  KEY `dept_id` (`dept_id`),
  CONSTRAINT `student_ibfk_1` FOREIGN KEY (`dept_id`) REFERENCES `department` (`dept_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student`
--

LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
INSERT INTO `student` VALUES (1,'Test','User','2000-01-01','test@user.com',NULL,NULL,1,NULL,'2026-04-08 12:50:22','123'),(2,'vinit6','Student','2000-01-01','vinit6',NULL,NULL,NULL,NULL,'2026-04-08 13:40:55','123'),(3,'vinit633','Student','2000-01-01','vinit633',NULL,NULL,NULL,NULL,'2026-04-08 13:55:01','0603'),(4,'vinit67777','Student','2000-01-01','vinit67777',NULL,NULL,NULL,NULL,'2026-04-08 14:52:11','06'),(5,'vinit609','Student','2000-01-01','vinit609',NULL,NULL,NULL,NULL,'2026-04-08 14:52:27','609'),(6,'TestUser123','Student','2000-01-01','TestUser123',NULL,NULL,NULL,NULL,'2026-04-08 14:54:38','password123'),(7,'TestUser1234','Student','2000-01-01','TestUser1234',NULL,NULL,NULL,NULL,'2026-04-08 14:55:28','password1234'),(8,'vinit637','','2000-01-01','vinit637',NULL,NULL,NULL,NULL,'2026-04-08 14:57:06','637'),(9,'vinit638','Student','2000-01-01','vinit638',NULL,NULL,NULL,NULL,'2026-04-08 15:05:35','638');
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-08 21:36:09
