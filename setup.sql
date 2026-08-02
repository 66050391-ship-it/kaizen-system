-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: kaizen_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `kaizen_requests`
--

DROP TABLE IF EXISTS `kaizen_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kaizen_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reporter_name` varchar(100) NOT NULL COMMENT 'ชื่อผู้แจ้ง หรือรหัสพนักงาน',
  `department` varchar(100) NOT NULL COMMENT 'แผนกที่แจ้ง',
  `location` varchar(100) NOT NULL COMMENT 'พื้นที่/เครื่องจักรที่ต้องการปรับปรุง',
  `job_type` varchar(50) DEFAULT NULL,
  `title` varchar(200) NOT NULL COMMENT 'หัวข้อเรื่องที่ขอปรับปรุง',
  `description` text COMMENT 'รายละเอียดปัญหา',
  `admin_comment` text,
  `before_image` varchar(255) DEFAULT NULL COMMENT 'พาธรูปถ่ายก่อนปรับปรุง',
  `status` varchar(30) DEFAULT 'Pending_Approval',
  `foreman_name` varchar(100) DEFAULT NULL COMMENT 'ชื่อ Foreman ที่ตรวจงาน',
  `reject_reason` text COMMENT 'เหตุผลกรณีปฏิเสธงาน',
  `approved_at` datetime DEFAULT NULL COMMENT 'เวลาที่ Foreman อนุมัติ',
  `after_image` varchar(255) DEFAULT NULL COMMENT 'พาธรูปถ่ายหลังปรับปรุงเสร็จ',
  `closed_at` datetime DEFAULT NULL COMMENT 'เวลาที่ปิดงานเรียบร้อย',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `action_date` date DEFAULT NULL,
  `operator_name` varchar(255) DEFAULT NULL,
  `action_details` text,
  `is_urgent` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kaizen_requests`
--

LOCK TABLES `kaizen_requests` WRITE;
/*!40000 ALTER TABLE `kaizen_requests` DISABLE KEYS */;
INSERT INTO `kaizen_requests` VALUES (1,'ฟ่าง','Production','Line E',NULL,'Program','โปรแกรม Error',NULL,'/uploads/1784877284422-178570118.png','PENDING_FOREMAN',NULL,NULL,NULL,NULL,NULL,'2026-07-24 07:14:44',NULL,NULL,NULL,0),(2,'แนท','Planning','ไฟขาด','Equipment','ไฟขาด','เปลี่ยนหลอด',NULL,'/uploads/1784912768813-576024825.jpg','Completed',NULL,NULL,NULL,'/uploads/1785311695398.png',NULL,'2026-07-24 17:06:08','2026-07-29','เอฟ','ทำการเปลี่ยนหลอดไฟ',0),(3,'แนท','Production Engineering','ป้่ััดห','Program','ดาดเาีดะั','แดรดะีดเ่พ','ง่าย',NULL,'Approved',NULL,NULL,NULL,NULL,NULL,'2026-07-24 17:44:31',NULL,NULL,NULL,0),(4,'ภู','Production Engineering','เครื่องจักรมีปัญหา','Program','ปรับโปรแกรม','มาดูหน่อย','งานด่วน','/uploads/1785307850728.png','Completed',NULL,NULL,NULL,'/uploads/1785308779401.png',NULL,'2026-07-29 06:50:50','2026-07-29','เอฟ','ปรับโปรแกรม',0),(5,'สายฟ้า','Production Engineering','เครื่องจักรมีปัญหา','Tooling','เปลี่ยนดอกสว่าน','ดอกสว่านหักอยากให้มาเปลี่ยน',NULL,'/uploads/1785309601011.png','Completed',NULL,NULL,NULL,'/uploads/1785310510939.png',NULL,'2026-07-29 07:20:01','2026-07-29','เอฟ','ทำการเปลี่ยนดอกสว่าน',0),(6,'สายฟ้า','Engineering','เครื่องจักรมีปัญหา','Program','คอมพัง','เปลี่ยนคอม','ง่าย','/uploads/1785311970435.png','Approved',NULL,NULL,NULL,NULL,NULL,'2026-07-29 07:59:30',NULL,NULL,NULL,0),(7,'สายฟ้า','Quality Control','เครื่องจักรมีปัญหา','Program','ปรับโปรแกรม','ปรับโปรแกรมใหม่','รีบเลย','/uploads/1785312228934.jpg','Approved',NULL,NULL,NULL,NULL,NULL,'2026-07-29 08:03:48',NULL,NULL,NULL,0),(8,'สายฟ้า','Warehouse','เครื่องจักรมีปัญหา','Program','ทำใหม่','ทำใหม่','ด่วนสุด',NULL,'Approved',NULL,NULL,NULL,NULL,NULL,'2026-07-29 08:59:45',NULL,NULL,NULL,0),(9,'สายฟ้า','Quality Control','F-Line','Equipment','น้ำมันรั่ว','มีรูรั่วตรงท่อส่งน้ำมัน','รีบมาก',NULL,'Completed',NULL,NULL,NULL,'/uploads/1785319192377.png',NULL,'2026-07-29 09:29:00','2026-07-29','เอฟ','อุดรอยรั่ว',1),(10,'สายฟ้า','Maintenance','F-Line','Program','ทำขาตั้งวางงาน','ขาตั้งหักอยากให้ทำขาตั้งวางชิ้นงาน',NULL,NULL,'Approved',NULL,NULL,NULL,NULL,NULL,'2026-07-29 09:32:20',NULL,NULL,NULL,0),(11,'ฟ่าง','Production Engineering','F-Line','Tooling','มีปัญหา','',NULL,NULL,'Completed',NULL,NULL,NULL,'/uploads/1785375475018.png',NULL,'2026-07-29 10:01:57','2026-07-30','เอฟ','กพรเ่',0),(12,'สายฟ้า','Production Engineering','F-Line','Program','joiijoij','','\'ko','/uploads/1785333523959.png','Approved',NULL,NULL,NULL,NULL,NULL,'2026-07-29 13:58:44',NULL,NULL,NULL,1),(13,'hih','Production Engineering','hyuh7','Program','iuhyh7y','',NULL,NULL,'Pending_Approval',NULL,NULL,NULL,NULL,NULL,'2026-07-29 13:59:05',NULL,NULL,NULL,0),(14,'ฟ่าง','Engineering','โต๊ะทำงาน PE ','Equipment','sgsdrhdrd','srtdrdrgd',NULL,NULL,'Approved',NULL,NULL,NULL,NULL,NULL,'2026-07-30 09:40:28',NULL,NULL,NULL,0);
/*!40000 ALTER TABLE `kaizen_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','1234','หัวหน้าอนุมัติ (Admin)','admin'),(2,'shop','1234','ทีมงาน Kaizen Shop','shop');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-02 16:04:40
