-- MySQL dump 10.13  Distrib 8.0.41, for Linux (x86_64)
--
-- Host: localhost    Database: safe_hi
-- ------------------------------------------------------
-- Server version	8.0.41-0ubuntu0.20.04.1

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
-- Table structure for table `Appointments`
--

DROP TABLE IF EXISTS `Appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Appointments` (
  `appointment_id` int NOT NULL AUTO_INCREMENT,
  `client_id` int DEFAULT NULL,
  `consultant_id` int DEFAULT NULL,
  `scheduled_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`appointment_id`),
  KEY `client_id` (`client_id`),
  KEY `consultant_id` (`consultant_id`),
  CONSTRAINT `Appointments_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `Client` (`client_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Appointments`
--

LOCK TABLES `Appointments` WRITE;
/*!40000 ALTER TABLE `Appointments` DISABLE KEYS */;
INSERT INTO `Appointments` VALUES (1,1,1,'2024-10-10','Scheduled'),(2,2,2,'2024-10-12','Scheduled'),(3,3,3,'2024-10-15','Completed'),(4,4,4,'2024-10-18','Cancelled'),(5,5,5,'2024-10-20','Scheduled');
/*!40000 ALTER TABLE `Appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Checklist`
--

DROP TABLE IF EXISTS `Checklist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Checklist` (
  `checklist_id` int NOT NULL AUTO_INCREMENT,
  `comment_id` int DEFAULT NULL,
  `consultant_id` int DEFAULT NULL,
  `client_id` int DEFAULT NULL,
  `data` date DEFAULT NULL,
  `question` text,
  `answer1` varchar(255) DEFAULT NULL,
  `answer2` varchar(255) DEFAULT NULL,
  `answer3` varchar(255) DEFAULT NULL,
  `answer4` varchar(255) DEFAULT NULL,
  `selected_answer` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`checklist_id`),
  KEY `comment_id` (`comment_id`),
  KEY `consultant_id` (`consultant_id`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `Checklist_ibfk_1` FOREIGN KEY (`comment_id`) REFERENCES `ConsultationComments` (`comment_id`),
  CONSTRAINT `Checklist_ibfk_3` FOREIGN KEY (`client_id`) REFERENCES `Client` (`client_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Checklist`
--

LOCK TABLES `Checklist` WRITE;
/*!40000 ALTER TABLE `Checklist` DISABLE KEYS */;
INSERT INTO `Checklist` VALUES (1,1,1,1,'2024-10-01','Do you have a stable income?','6시 내고향','무릎건강','무료급식','자식이야기','Updated Answer Text'),(2,2,2,2,'2024-10-02','Are you planning any major purchases?','보육원 친구들','불면증, 음주','일자리','병원비 부담','No'),(3,3,3,3,'2024-10-03','Do you have existing health coverage?','런닝맨','바이올린 배우기','고혈압, 건강관리','가족','Yes'),(4,4,4,4,'2024-10-04','Are you looking into retirement plans?','생활비','일상생활의 어려움','전세 계약, 주거','손자','Yes'),(5,5,5,5,'2024-10-05','Do you want investment options?','6시 내고향 5','무릎건강 5','무료급식 5','자식이야기 5','Yes');
/*!40000 ALTER TABLE `Checklist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Client`
--

DROP TABLE IF EXISTS `Client`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Client` (
  `client_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`client_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Client`
--

LOCK TABLES `Client` WRITE;
/*!40000 ALTER TABLE `Client` DISABLE KEYS */;
INSERT INTO `Client` VALUES (1,'Client A','123 Seoul St','010-1111-2222','Active'),(2,'Client B','456 Busan Ave','010-2222-3333','Active'),(3,'Client C','789 Incheon Rd','010-3333-4444','Inactive'),(4,'Client D','101 Daejeon Blvd','010-4444-5555','Active'),(5,'Client E','202 Gwangju Ln','010-5555-6666','Pending');
/*!40000 ALTER TABLE `Client` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ConsultationComments`
--

DROP TABLE IF EXISTS `ConsultationComments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ConsultationComments` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `consultant_id` int DEFAULT NULL,
  `client_id` int DEFAULT NULL,
  `comment` text,
  `date_written` date DEFAULT NULL,
  PRIMARY KEY (`comment_id`),
  KEY `consultant_id` (`consultant_id`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `ConsultationComments_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `Client` (`client_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ConsultationComments`
--

LOCK TABLES `ConsultationComments` WRITE;
/*!40000 ALTER TABLE `ConsultationComments` DISABLE KEYS */;
INSERT INTO `ConsultationComments` VALUES (1,1,1,'Initial consultation','2024-10-01'),(2,2,2,'Discussed financial goals','2024-10-02'),(3,3,3,'Provided health policy options','2024-10-03'),(4,4,4,'Explained retirement plans','2024-10-04'),(5,5,5,'Discussed investment strategies','2024-10-05');
/*!40000 ALTER TABLE `ConsultationComments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ConversationLogs`
--

DROP TABLE IF EXISTS `ConversationLogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ConversationLogs` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `client_id` int DEFAULT NULL,
  `consultant_id` int DEFAULT NULL,
  `log_time` date DEFAULT NULL,
  `conversation_summary` json DEFAULT NULL,
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ConversationLogs`
--

LOCK TABLES `ConversationLogs` WRITE;
/*!40000 ALTER TABLE `ConversationLogs` DISABLE KEYS */;
INSERT INTO `ConversationLogs` VALUES (1,6,6,'2024-11-01','[{\"title\": \"사회적 고립 상태 평가\", \"content\": [\"사회적 관계: 김영수 님은 친구나 가족과의 소통이 줄어들며 외로움을 자주 느끼고 있습니다. \'6시 내고향\' 시청을 통해 고향과 친구들을 그리워하고 있는 상태입니다.\", \"고독감: 자녀와의 연락도 드물어 외로움을 느끼지만, 자녀들에게 부담이 될까 봐 연락을 자제하고 있는 상태입니다.\"]}, {\"title\": \"정서적 및 감정적 건강 상태 평가\", \"content\": [\"우울감: 혼자 지내는 시간이 많아지며, 앞으로의 생활에 대한 막연한 불안감을 느끼고 있습니다. 외로움과 불안이 쌓여 심리적 지원이 필요한 상태입니다.\", \"안정감: 누군가에게 자신의 이야기를 들어주고 도움을 받을 수 있기를 희망하고 있는 상태입니다.\"]}, {\"title\": \"생활 패턴 및 건강 관리 상태 평가\", \"content\": [\"신체 건강: 무릎 통증이 심하고 혈압 관리가 필요한 상황이지만, 병원비 부담 때문에 정기적인 진료를 꺼리고 있는 상태입니다.\", \"생활 패턴: 관절 문제로 외출이 어려워 주로 집에서 시간을 보내고 있으며, 식사와 약값 등으로 생활비 걱정이 큰 상태입니다.\"]}, {\"title\": \"경제적 안정성 평가\", \"content\": [\"재정 상황: 기초연금으로 생활비를 충당하고 있으나, 식비와 약값으로 생활비가 빠듯하여 추가적인 경제적 지원이 필요한 상태입니다.\"]}, {\"title\": \"위기 대처 능력 및 지원망 평가\", \"content\": [\"지원망: 자녀들과의 연락이 뜸하고, 외부와의 소통이 거의 없어 혼자 지내는 생활로 고립감이 커져가며, 응급 상황 발생 시 대처가 어려운 상태입니다.\"]}]'),(2,7,7,'2024-11-02','[{\"title\": \"사회적 고립 상태 평가\", \"content\": [\"사회적 관계: 이정민 님은 보육원 친구들과 오랜만에 연락이 닿아 만나게 되었으나, 바빠서 자주 만나는 것은 어렵다고 느끼고 있는 상태입니다.\", \"외로움: 오랜 친구들과의 만남 후 잠시 위로를 받았으나, 여전히 혼자 생활하면서 외로움을 자주 느끼고 있는 상태입니다.\"]}, {\"title\": \"정서적 및 감정적 건강 상태 평가\", \"content\": [\"불안감: 혼자 생활하며 불면증과 불안감을 자주 경험하고 있으며, 마음을 달래기 위해 혼자 술을 마시는 일이 잦아지고 있는 상태입니다.\", \"정신적 피로: 미래에 대한 불안과 막막함으로 인해 정신적으로 지친 상태이며, 심리적 지원이 필요한 상황입니다.\"]}, {\"title\": \"생활 패턴 및 건강 관리 상태 평가\", \"content\": [\"신체 건강: 큰 사고 이후 몸이 불편해 병원비 부담 때문에 정기적인 진료와 재활 치료를 받지 못하고 있는 상태입니다.\", \"생활 패턴: 식사 준비가 힘들어 간편식으로 끼니를 때우는 경우가 많으며, 건강 관리가 어려운 상태입니다.\"]}, {\"title\": \"경제적 안정성 평가\", \"content\": [\"재정 상황: 생활비 부담이 커서 경제적 어려움이 심화되고 있으며, 가능하다면 일을 하고 싶지만 신체적 한계로 인해 일자리 찾기가 힘든 상태입니다.\"]}, {\"title\": \"위기 대처 능력 및 지원망 평가\", \"content\": [\"지원망: 도움을 요청할 가족이나 지인이 없으며, 사회적 고립감이 커지고 있는 상태입니다. 갑작스러운 위기 상황에서 대처가 어려운 상태입니다.\"]}]'),(3,8,8,'2024-11-03','[{\"title\": \"사회적 고립 상태 평가\", \"content\": [\"사회적 관계: 박성호 님은 가족과 떨어져 지내면서 혼자 있는 시간이 많아 외로움을 자주 느끼고 있습니다. 가족들과의 영상통화가 큰 위로가 되고 있는 상태입니다.\", \"고독감: 퇴근 후 집에 오면 텅 빈 집이 기다리고 있어 고독감을 느끼고 있는 상태입니다.\"]}, {\"title\": \"정서적 및 감정적 건강 상태 평가\", \"content\": [\"우울감: 가족이 없는 생활에서 외로움이 커지고 있으며, 스트레스를 해소하기 위해 혼자 술을 마시는 일이 잦아지고 있는 상태입니다.\", \"불안감: 나이가 들면서 건강에 대한 걱정이 커지고 있으며, 미래에 대한 막연한 불안감을 느끼고 있는 상태입니다.\"]}, {\"title\": \"생활 패턴 및 건강 관리 상태 평가\", \"content\": [\"신체 건강: 고혈압이 있어 건강 관리가 중요한 상황이지만, 혼자 생활하면서 식습관이나 생활 관리를 꾸준히 하기 어려운 상태입니다.\", \"생활 패턴: 운동이나 활동이 부족하고, 건강에 부담이 되는 생활을 하고 있는 상태입니다.\"]}, {\"title\": \"경제적 안정성 평가\", \"content\": [\"재정 상황: 가족의 유학비와 생활비를 충당하기 위해 더 열심히 일하려 하지만, 나이가 들며 체력적으로 한계를 느끼고 있는 상태입니다.\"]}, {\"title\": \"위기 대처 능력 및 지원망 평가\", \"content\": [\"지원망: 가족들과 떨어져 지내며 외부와의 소통이 거의 없고, 알코올 의존으로 인해 스트레스 해소에 어려움을 겪고 있는 상태입니다.\"]}]'),(4,9,9,'2024-11-04','[{\"title\": \"사회적 고립 상태 평가\", \"content\": [\"사회적 관계: 김순자 님은 손자 외에는 함께 지내는 가족이 없어 외로움을 자주 느끼고 있으며, 손자의 사회성 발달이 걱정되는 상태입니다.\", \"고독감: 손자와의 관계가 유일한 위로이지만, 자신이 없을 때 손자가 어떻게 될지에 대한 불안감이 큰 상태입니다.\"]}, {\"title\": \"정서적 및 감정적 건강 상태 평가\", \"content\": [\"스트레스: 손자의 미래에 대한 걱정으로 스트레스가 심해지고 있으며, 건강 악화로 인한 정신적 부담이 가중된 상태입니다.\", \"안정감: 손자에게 최선을 다하고 있지만, 앞으로의 돌봄에 대한 불안으로 마음이 안정되지 않은 상태입니다.\"]}, {\"title\": \"생활 패턴 및 건강 관리 상태 평가\", \"content\": [\"신체 건강: 허리와 관절 통증이 심해 손자 돌보기와 집안일을 수행하는 데 어려움을 겪고 있는 상태입니다.\", \"생활 패턴: 외출이 힘들어 주로 집에서 시간을 보내며, 몸이 불편해 식사를 준비하는 것도 점점 힘들어진 상태입니다.\"]}, {\"title\": \"경제적 안정성 평가\", \"content\": [\"재정 상황: 손자의 교육비와 생활비 부담이 커지고 있으며, 주거 문제로 인해 경제적 불안이 큰 상태입니다. 추가적인 경제적 지원이 필요한 상황입니다.\"]}, {\"title\": \"위기 대처 능력 및 지원망 평가\", \"content\": [\"지원망: 외부와의 소통이 거의 없고, 건강 문제로 인해 손자를 돌보는 데 한계가 있어 갑작스러운 위기 상황에서 대처가 어려운 상태입니다.\"]}]'),(5,10,10,'2024-11-05','[{\"title\": \"경제적 안정성 평가\", \"content\": [\"소득 증대: 고객은 새로운 부업을 통해 추가 수입을 얻고 있습니다.\", \"지출 관리: 필수 지출 항목을 재정비하고 예산 계획을 수정했습니다.\"]}, {\"title\": \"취미와 여가 활동\", \"content\": [\"취미 생활: 고객은 새로운 악기를 배우며 스트레스를 해소하고 있습니다.\", \"여가 활용: 정기적인 야외 활동을 통해 심신의 균형을 유지하고 있습니다.\"]}]');
/*!40000 ALTER TABLE `ConversationLogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `LastVisit`
--

DROP TABLE IF EXISTS `LastVisit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `LastVisit` (
  `id` int NOT NULL AUTO_INCREMENT,
  `target_id` int NOT NULL,
  `visit_date` date NOT NULL,
  `abstract` text,
  PRIMARY KEY (`id`),
  KEY `target_id` (`target_id`),
  CONSTRAINT `LastVisit_ibfk_1` FOREIGN KEY (`target_id`) REFERENCES `Target` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LastVisit`
--

LOCK TABLES `LastVisit` WRITE;
/*!40000 ALTER TABLE `LastVisit` DISABLE KEYS */;
INSERT INTO `LastVisit` VALUES (1,1,'2025-04-07','할머니께서는 최근 날짜가 갑자기 쌀쌀해져 컨디션이 저하되셨다고 하셨음.'),(2,1,'2025-03-31','혈압이 다소 높게 측정되어 약 복용 여부 확인 필요.'),(3,2,'2025-04-05','식사는 잘 챙기고 계시고 특별한 이상 없음. 병원 동행 요청 예정.'),(4,2,'2025-03-29','감기 기운이 있다고 하여 체온 측정 및 약 권장함.'),(5,3,'2025-04-01','최근 입맛이 없으셔서 식사량이 줄었다고 하심. 원인 파악 필요.');
/*!40000 ALTER TABLE `LastVisit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PolicyInfo`
--

DROP TABLE IF EXISTS `PolicyInfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PolicyInfo` (
  `policy_id` int NOT NULL AUTO_INCREMENT,
  `age` int DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `assets` decimal(15,2) DEFAULT NULL,
  `annual_income` decimal(15,2) DEFAULT NULL,
  `vulnerable_group` varchar(50) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`policy_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PolicyInfo`
--

LOCK TABLES `PolicyInfo` WRITE;
/*!40000 ALTER TABLE `PolicyInfo` DISABLE KEYS */;
INSERT INTO `PolicyInfo` VALUES (1,25,'Seoul',50000.00,35000.00,'Youth','Basic policy for young adults'),(2,40,'Busan',120000.00,75000.00,'Middle-aged','Middle age income protection'),(3,30,'Incheon',90000.00,45000.00,'Young adults','Health-focused policy'),(4,50,'Daejeon',200000.00,95000.00,'Senior','Retirement planning'),(5,60,'Gwangju',300000.00,105000.00,'Senior','Senior health insurance');
/*!40000 ALTER TABLE `PolicyInfo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Questions`
--

DROP TABLE IF EXISTS `Questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Questions` (
  `question_id` int NOT NULL AUTO_INCREMENT,
  `questions` text,
  `question_count` int DEFAULT NULL,
  PRIMARY KEY (`question_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Questions`
--

LOCK TABLES `Questions` WRITE;
/*!40000 ALTER TABLE `Questions` DISABLE KEYS */;
INSERT INTO `Questions` VALUES (1,'아버님 요즘도 ‘6시 내고향’ 즐겨보세요? 어떤 지역 나오면 제일 반가우세요?,프로그램 보시면 고향 생각도 많이 나시겠어요. 아버님 고향 얘기 좀 해주실 수 있으세요?,‘6시 내고향’ 보면 옛날 친구들 생각도 나시죠? 가끔 연락하는 친구분도 계세요?',3),(2,'아버님 요즘 무릎은 좀 어떠세요? 날씨 바뀌면 더 아프실 때도 있나요?,무릎 때문에 걷는 게 힘드시다고 하셨는데 특히 언제가 제일 불편하세요?,요즘 무릎 상태는 어떠세요? 혹시 운동이나 스트레칭 같은 거 조금씩 해보시나요?',3),(3,'아버님 복지관에서 점심 무료로 제공한다던데 혹시 알고 계셨어요?,가끔 복지관에 가시면 다른 어르신들과도 이야기 나누실 수 있는데 가보실 생각 있으세요?,아버님 복지관 점심 프로그램에 가시면 어떨까요? 식사도 드시고 산책도 할 수 있어서 좋을 것 같아요.',3),(4,'요즘 자녀분들이랑은 자주 연락하시나요? 잘 안 된다고 하셔서 걱정되네요.,자녀분들도 바쁘시지만 아버님이 먼저 연락하면 좋아할 것 같은데 어떠세요?,자녀분들과 통화하면 힘도 나실 것 같은데 요즘은 가끔 연락 주고받으세요?',3),(5,'얼마 전에 보육원 친구들이랑 만났다고 했잖아. 오랜만에 보니까 어떤 얘기 많이 했어?,친구들이랑 자주 보기 힘들어서 아쉽지? 또 만나기로 했어?,오랜만에 친구들 만나고 나니까 기분이 좀 풀렸어?',3),(6,'밤에 잠드는 게 쉽지 않다고 했잖아. 요즘도 잠 잘 못 자?,잠이 안 와서 혼자 술 마시는 일이 잦아졌다고 했는데 조금 줄여볼까 싶기도 해?,밤에 혼자 있을 때 잠 안 오면 마음이 더 복잡해지지? 요즘엔 어떻게 지내?',3),(7,'몸이 힘들어도 어떻게든 일하고 싶다고 했잖아. 요즘에도 일자리 알아보고 있어?,생활비가 걱정돼서 일하고 싶다고 했었지? 혹시 지금 생각 중인 일 같은 게 있어?,이전에는 어떤 일 했었어? 가지고 있는 자격증 같은거 있어?',3),(8,'사고 이후에 병원비 부담돼서 진료 못 받고 있다고 했잖아. 요 상태는 좀 어때?,병원비가 부담돼서 약도 자주 못 먹고 있다고 했는데 혹시 필요한 약 있어?,재활 치료가 도움이 되는데 병원비 때문에 미루고 있다고 했지?',3),(9,'요즘도 ‘런닝맨’ 챙겨 보신다고 하셨죠? 따님들과 함께 보셨던 기억도 나실 것 같아요.,저번주 \'런닝맨\'에 이효리가 나오던데 저번주도 챙겨보셨어요?,따님들이 좋아하던 예능을 보니까 가족 생각이 더 나실 것 같아요. 요즘도 재미있게 보고 계세요?',3),(10,'따님께서 전공하시는 바이올린 배우는 걸 고민 중이시라고 하셨죠?,바이올린 배우시면 따님이랑 이야기 나눌 거리도 많아지겠어요. 아직 고민 중이세요?,복지관에서 악기 강습 프로그램을 많이 하던데 알아봐드릴까요?',3),(11,'고혈압 때문에 걱정된다고 하셨는데 요즘 식사나 생활 관리는 좀 어떠세요?,보건소에서 고혈압 관리 프로그램도 있던데 참여해보시는 건 어떠세요?,최근에 건강 검진이나 혈압 체크는 해보셨나요?',3),(12,'가족들과 영상통화가 큰 위로가 된다고 하셨는데 요즘 통화는 자주 하고 계세요?,따님분들 자랑 좀 해주세요. 둘다 유학을 간거 보니 공부를 엄청 잘했나봐요.,둘째딸은 어떤 공부 중이에요? 공부는 잘 되고 있다던가요?',3),(13,'태현이 교육비가 부담된다고 하셨는데 요즘도 많이 고민되세요?,생활비 마련이 걱정되신다고 하셨죠. 요즘 어떻게 감당하고 계세요?,양육비 지원 같은 것도 있던데 필요하시면 한번 알아봐드릴까요?',3),(14,'허리 아프신거는 좀 어때요? 계속 통증이 심한가요?,집안일이나 손자 돌보는 게 힘드실 것 같은데 어떻게 지내고 계세요?,가사나 간병 지원 서비스도 있는데 도움을 받아보시는 건 어떠세요?',3),(15,'이제 전세 계약이 얼마 남지 않아서 걱정되신다고 하셨죠?,전세 자금 마련이 어려우실 것 같아요. 요즘 주거 문제로 고민이 많으시겠어요.,전세 자금 대출도 있는데 필요하시면 도움받으실 수 있는지 알아봐 드릴까요?',3),(16,'태현이가 친구랑 어울리는 걸 좋아하나요? 요즘은 또래 친구들과 잘 지내고 있나요?,태현이 키가 볼때마다 쑥쑥 크는거 같아요. 밥은 잘 먹나요?,내년이면 태현이도 초등학교 들어가는데 준비는 잘 되고 계신가요?',3);
/*!40000 ALTER TABLE `Questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Target`
--

DROP TABLE IF EXISTS `Target`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Target` (
  `id` int NOT NULL AUTO_INCREMENT,
  `targetid` int NOT NULL,
  `targetname` varchar(50) NOT NULL,
  `targetcallnum` varchar(20) DEFAULT NULL,
  `visittime` time NOT NULL,
  `address1` varchar(100) NOT NULL,
  `address2` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Target`
--

LOCK TABLES `Target` WRITE;
/*!40000 ALTER TABLE `Target` DISABLE KEYS */;
INSERT INTO `Target` VALUES (1,1,'이유진','010-1010-2020','10:00:00','대전 서구 대덕대로 150','경성 큰마을아파트 102동 103호'),(2,2,'김연우','010-2020-3030','11:00:00','대전 서구 대덕대로 150','경성 큰마을아파트 102동 104호'),(3,3,'박수빈','010-3030-4040','13:30:00','대전 유성구 대학로 291','KAIST 창의관 5층 501호');
/*!40000 ALTER TABLE `Target` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Targets`
--

DROP TABLE IF EXISTS `Targets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Targets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `targetid` int DEFAULT NULL,
  `targetname` varchar(50) NOT NULL,
  `address1` varchar(100) NOT NULL,
  `address2` varchar(100) NOT NULL,
  `callnum` varchar(20) DEFAULT NULL,
  `gender` tinyint DEFAULT NULL,
  `age` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Targets`
--

LOCK TABLES `Targets` WRITE;
/*!40000 ALTER TABLE `Targets` DISABLE KEYS */;
INSERT INTO `Targets` VALUES (1,1,'이유진','대전 서구 대덕대로 150','경성 큰마을아파트 102동 103호','010-3889-3501',1,77),(2,2,'김연우','대전 서구 대덕대로 150','경성 큰마을아파트 102동 103호','010-4567-8901',1,80),(3,3,'이유진','대전 서구 대덕대로 150','경성 큰마을아파트 102동 103호','010-3889-3501',1,77),(4,10,'이준학','가나다라 103호','101동 202호','010-6557-0101',1,22),(5,5,'이준수','가나다라','101호','010-1234-1234',1,123),(6,6,'이준수','가나다라','101호','010-1234-1234',1,123),(7,7,'이준수','가나다라','101호','010-1234-1234',1,123),(8,8,'테스트','가나','121호','010-1231-1231',1,23),(9,9,'가나다','가나다','123호','010-4324-2342',1,10),(10,10,'가나다','고고고','123호','010-1234-1244',1,23),(11,11,'가나다','고고고','123호','010-1234-1244',1,23),(12,12,'가나다','고고고','123호','010-1234-1244',1,23),(13,13,'가나다','고고고','123호','010-1234-1244',1,23),(14,14,'adsf','asdf','123호','010-4525-23525',1,34),(15,15,'adsf','asdf','123호','010-4525-23525',1,34),(16,16,'이휘성','서울시 중구 어딘가','205호','010-6585-9191',1,34);
/*!40000 ALTER TABLE `Targets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TempChecklist`
--

DROP TABLE IF EXISTS `TempChecklist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TempChecklist` (
  `temp_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `checklist_id` int NOT NULL,
  PRIMARY KEY (`temp_id`),
  KEY `checklist_id` (`checklist_id`),
  CONSTRAINT `TempChecklist_ibfk_1` FOREIGN KEY (`checklist_id`) REFERENCES `Checklist` (`checklist_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TempChecklist`
--

LOCK TABLES `TempChecklist` WRITE;
/*!40000 ALTER TABLE `TempChecklist` DISABLE KEYS */;
INSERT INTO `TempChecklist` VALUES (1,1,4),(2,2,3),(3,3,2),(4,4,3),(5,5,5);
/*!40000 ALTER TABLE `TempChecklist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TempQuestions`
--

DROP TABLE IF EXISTS `TempQuestions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TempQuestions` (
  `temp_question_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `question_id` int NOT NULL,
  PRIMARY KEY (`temp_question_id`),
  KEY `TempQuestions_ibfk_1` (`question_id`),
  CONSTRAINT `TempQuestions_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `Questions` (`question_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TempQuestions`
--

LOCK TABLES `TempQuestions` WRITE;
/*!40000 ALTER TABLE `TempQuestions` DISABLE KEYS */;
INSERT INTO `TempQuestions` VALUES (1,1,4),(2,2,7),(3,3,10),(4,4,15),(5,5,5);
/*!40000 ALTER TABLE `TempQuestions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `birthdate` date DEFAULT NULL,
  `gender` tinyint NOT NULL,
  `password` varchar(255) NOT NULL,
  `etc` varchar(255) DEFAULT NULL,
  `role` tinyint DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'John Doe','01012345678','johndoe@example.com','1995-08-15',0,'$2b$10$2kZGXEIy40T4gGVxaPu/zuoUU7cfzPsLo9KCZQqGtlGzvhxjVpd3G','대전 서부 담당자',NULL),(3,'John Doe','01012345678','johndoe2@example.com','1995-08-15',0,'$2b$10$GIeBnxSL2wGxnu3AJ38sBO1vpjf3hDJ/0D/wsKAXgmFQbPkv1RbyG','대전 서부 담당자',NULL),(4,'yujin','01043830203','jenny7732@naver.com','2002-02-03',0,'$2b$10$K8Y6a26AOGvbeAH3bH1U7er5Po079Csx9b9a4yJPcJ5Rwd/SQppxe','대전 서부 담당자',NULL),(8,'123','01012341234','123@naver.com','2005-01-18',1,'$2b$10$o27S.kmO4.TtX/uZXP84regxi7vl3oaLY9zth3NWKjosydb9N/SBa','대전 서부 담당자',NULL),(9,'123','01012341234','1234@naver.com','2005-01-18',1,'$2b$10$zLMlsk0wIC9wIWVoLzry.ujlzfi4SVDXaq19iBPpASXIDkPlMD8JC','대전 서부 담당자',NULL),(10,'qw','01012341234','qw@naver.com','2005-01-17',1,'$2b$10$dfsKGYVDQ33b8mMgelCoyOPrBPk8QVm/uUeyi/icz1SLXMvqMcrC.','대전 서부 담당자',NULL),(11,'이유진','01012341234','jenny@naver.com','2005-01-01',0,'$2b$10$0LwWThmZ3mGQXnmYE5PSgOGG0KH3SZwsPldue6kzhsmvC5uRSQIYe','대전 서부 담당자',1),(12,'유진','01043830203','yujin0203@naver.com','2005-01-01',0,'$2b$10$GM8ItB7tQzpSLyzUy/kMfebkGPj7YUHKLRSekveBMP/LxZZzu107C','대전 서부 담당자',NULL),(13,'hi123','01012341234','hi123@naver.com','2005-01-01',0,'$2b$10$UdHn635HamC.2Cn5Lk7bYOFKPd/yYOMPajR1YfEBkkBHVeYYAccAa','대전 서부 담당자',NULL),(14,'hi123123','01012312312','hi123123@naver.com','2005-01-01',1,'$2b$10$ZnBDaCGNP9msJEGN9McqhO/3/CbTGkWVayLcb46ToI.U1hFqrbPUK','대전 서부 담당자',NULL),(15,'이준학','010-6557-0010','junhak1103@naver.com','2000-11-03',1,'$2b$10$llnjaxF/swtfbpCpV9hwGujpLzzHmx/xn2leqNI.dD5o5j6CEiC6u','대전 서부 담당자',1),(16,'이준학','010-1234-1231','jun@naver.com','2025-05-01',1,'$2b$10$1dRB.DMNRnDQMLG8Jz8UIO2LxTKfCmaOB.erl2LPosFhNuOKXAKWW','대전 서부 담당자',1),(17,'minsu1234','01045687564','minsu1234@naver.com','2005-01-01',0,'$2b$10$NtCJmasgO8TohSlHsxNj2ea9Qiev1AiE31R//QdlcNT3Q1qDXflqG','대전 서부 담당자',NULL),(18,'전원우','01045667899','wonwoo@naver.com','2005-01-01',1,'$2b$10$8Z/zDCX/esrdoNjmvmCnQ.XGtBmt.T2K30/BekmGjnThfvQVHxevK','대전 서부 담당자',NULL),(19,'한민우','01040561754','minwoo@naver.com','2005-01-01',1,'$2b$10$NINJM4nqMebuIQ1cW9SSdu2lWS339fLwB0zBuyw6voxSpW08dPWIq','대전 서부 담당자',NULL),(20,'전원우2','01012341234','wonwoo2@naver.com','2005-01-01',1,'$2b$10$2E7xdnPiemMx5owXRkfPOeQnsqqm5LjgNtyqnZ4CyiG61jSY0Fy2O','대전 서부 담당자',NULL),(21,'전원우3','01012341234','wonwoo3@naver.com','2005-01-01',1,'$2b$10$Gw6arMaf/UKz2Fj65.wizu8ZbFRvuomPwlhMCQ.6fBX7v0mgZYmQi','대전 서부 담당자',NULL),(22,'전원우4','01012341234','wonwoo4@naver.com','2005-01-01',1,'$2b$10$W5CxJbnul4v9OrAA7nyXwODhAfYS/sR/QagMIHh/2.HAgIg6PkCNy','대전 서부 담당자',NULL),(23,'유진','01046464646','jenny1234@naver.com','2005-01-01',0,'$2b$10$3o/McyKzdHGCfTQ9kPKI4O6.hzri97zAfwctcTHaP0OpXUPrS6MKe','대전 서부 담당자',NULL);
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `VisitCategory`
--

DROP TABLE IF EXISTS `VisitCategory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `VisitCategory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `visit_id` int NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `category_title` varchar(50) NOT NULL,
  `summary_text` text NOT NULL,
  `detail_text` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_visit_category` (`visit_id`,`category_title`)
) ENGINE=InnoDB AUTO_INCREMENT=159 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `VisitCategory`
--

LOCK TABLES `VisitCategory` WRITE;
/*!40000 ALTER TABLE `VisitCategory` DISABLE KEYS */;
INSERT INTO `VisitCategory` VALUES (1,1,'alice@example.com','건강','소화 불편 호소','하루 종일 속 쓰림 지속됨'),(2,1,NULL,'경제','22공과금 부담, 경제적 스트레스 존재','전기/수도요금 미납 상태 및 긴급지원 필요사항'),(3,1,NULL,'생활','외출 빈도 급감, 활동량 저하 및 무기력감','최근 외출 기록 없음, 식사 준비도 소홀'),(4,1,NULL,'기타','가족과의 거리감, 사회활동 회피','전화 연락도 거의 없음, 이웃과 접촉도 줄어듦'),(147,8,'jenny@naver.com','건강','소화 불편 호소','하루 종일 속 쓰림 지속됨'),(148,19,'wonwoo@naver.com','건강','소화 불편 호소','하루 종일 속 쓰림 지속됨'),(149,20,'wonwoo@naver.com','건강','소화 불편 호소','하루 종일 속 쓰림 지속됨'),(150,21,'wonwoo@naver.com','건강','소화 불편 호소','하루 종일 속 쓰림 지속됨'),(151,22,'wonwoo@naver.com','건강','소화 불편 호소','하루 종일 속 쓰림 지속됨'),(152,23,'wonwoo@naver.com','건강','소화 불편 호소','하루 종일 속 쓰림 지속됨'),(153,24,'wonwoo@naver.com','건강','소화 불편 호소','하루 종일 속 쓰림 지속됨'),(154,25,'wonwoo@naver.com','건강','소화 불편 호소','하루 종일 속 쓰림 지속됨'),(155,26,'wonwoo@naver.com','건강','소화 불편 호소','하루 종일 속 쓰림 지속됨'),(156,27,'wonwoo@naver.com','건강','소화 불편 호소','하루 종일 속 쓰림 지속됨'),(157,28,'wonwoo3@naver.com','건강','소화 불편 호소','하루 종일 속 쓰림 지속됨'),(158,29,'wonwoo4@naver.com','건강','소화 불편 호소','하루 종일 속 쓰림 지속됨');
/*!40000 ALTER TABLE `VisitCategory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `VisitReport`
--

DROP TABLE IF EXISTS `VisitReport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `VisitReport` (
  `reportid` int NOT NULL AUTO_INCREMENT,
  `reportstatus` int DEFAULT NULL,
  `visittime` datetime NOT NULL,
  `targetid` int NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `stt_transcript_path` text,
  PRIMARY KEY (`reportid`),
  KEY `targetid` (`targetid`),
  CONSTRAINT `VisitReport_ibfk_1` FOREIGN KEY (`targetid`) REFERENCES `Targets` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `VisitReport`
--

LOCK TABLES `VisitReport` WRITE;
/*!40000 ALTER TABLE `VisitReport` DISABLE KEYS */;
INSERT INTO `VisitReport` VALUES (1,1,'2025-04-03 10:00:00',1,'junhak1103@naver.com','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_210.94.220.229_45560_20250417_160328.txt'),(2,1,'2025-04-03 11:00:00',2,'junhak1103@naver.com',NULL),(3,2,'2025-04-03 13:00:00',3,'jenny@naver.com',NULL),(4,1,'2025-04-03 14:00:00',1,'jenny@naver.com',NULL),(5,1,'2025-04-03 15:00:00',2,'junhak1103@naver.com',NULL),(6,1,'2025-04-03 16:00:00',2,'jenny@naver.com',NULL),(7,1,'2025-04-03 17:00:00',3,NULL,NULL),(8,2,'2025-04-03 18:00:00',1,'jenny@naver.com',NULL),(9,2,'2025-04-03 19:00:00',3,'junhak1103@naver.com',NULL),(10,0,'2025-05-22 20:30:00',15,'junhak1103@naver.com',NULL),(11,0,'2025-05-21 16:10:00',9,'jun@naver.com',NULL),(12,0,'2025-05-21 16:10:00',9,'jun@naver.com',NULL),(13,0,'2025-05-21 20:14:00',3,'junhak1103@naver.com',NULL),(14,0,'2025-05-21 17:42:00',16,'jenny@naver.com',NULL);
/*!40000 ALTER TABLE `VisitReport` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `WelfareData`
--

DROP TABLE IF EXISTS `WelfareData`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `WelfareData` (
  `id` int NOT NULL AUTO_INCREMENT,
  `age` int NOT NULL,
  `region` varchar(255) NOT NULL,
  `non_duplicative_policies` text NOT NULL,
  `policy` json NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `WelfareData`
--

LOCK TABLES `WelfareData` WRITE;
/*!40000 ALTER TABLE `WelfareData` DISABLE KEYS */;
INSERT INTO `WelfareData` VALUES (1,25,'서울','서울시 복지 정책, 청년 1인가구 정책','[{\"link\": \"https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00000457&wlfareInfoReldBztpCd=02\", \"policy_name\": \"영상통화는 사랑과 행복을 싣고\", \"short_description\": \"월2회 안부 동영상 촬영 후 타지의 자녀(보호자)에게 SNS전송  및 영상 통화 실시\", \"detailed_conditions\": [\"노인맞춤돌봄서비스 대상자 선정기준(만 65세 이상 국민기초생활수급자, 차상위 계층 또는 기초연금수급자로서 유사중복사업 자격에 해당하지 않는 자)\"]}, {\"link\": \"https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00000342&wlfareInfoReldBztpCd=02\", \"policy_name\": \"시각장애인 사물놀이교실\", \"short_description\": \"1) 지원내용- 시각장애인에게 주1회 사물놀이 교실 실시\", \"detailed_conditions\": [\"- 시각장애인 이용자의 신청을 원칙으로 하고 이용자가 많을 경우에는 자체 심사를 거침\"]}, {\"link\": \"https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00003297&wlfareInfoReldBztpCd=02\", \"policy_name\": \"영상전화기 사용료지원\", \"short_description\": \"의사소통이 어려운 청각장애인들에게 인터넷 영상전화기 사용을 통해 수화통역서비스를 제공하고 생활의 불편함을 없애고 편리한 민원업무 수행\", \"detailed_conditions\": [\"관내 장애인\"]}]');
/*!40000 ALTER TABLE `WelfareData` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `WelfarePolicies`
--

DROP TABLE IF EXISTS `WelfarePolicies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `WelfarePolicies` (
  `policy_id` int NOT NULL AUTO_INCREMENT,
  `reportid` int NOT NULL,
  `age` int DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `non_duplicative_policies` text,
  `policy_name` varchar(255) DEFAULT NULL,
  `short_description` text,
  `detailed_conditions` text,
  `link` varchar(255) DEFAULT NULL,
  `check_status` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`policy_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `WelfarePolicies`
--

LOCK TABLES `WelfarePolicies` WRITE;
/*!40000 ALTER TABLE `WelfarePolicies` DISABLE KEYS */;
INSERT INTO `WelfarePolicies` VALUES (1,1,25,'서울','서울시 복지 정책, 청년 1인가구 정책','노인맞춤 돌봄서비스','일상생활 영위가 어려운 취약노인에게 적절한 돌봄서비스를 제공하여 안정적인 노후생활 보장. 노인의 기능·건강 유지 및 악화 예방을 지원합니다.','돌봄서비스가 필요한 65세 이상, 국민기초생활 수급자, 차상위 계층 또는 기초연금수급자, 유사 중복사업 자격에 해당되지 않은 자, 대상자 선정 조사지를 통한 사회-신체-정신영역의 돌봄필요도에 따른 대상자 군','https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00003191&wlfareInfoReldBztpCd=01',1),(2,1,25,'서울','서울시 복지 정책, 청년 1인가구 정책','독거노인·장애인 응급안전안심서비스','안전의 사각지대에 있는 노인과 장애인이 응급상황을 인지하고 응급상황에 대처할 수 있도록 안전대책을 마련하여 지역사회 예방적 돌봄을 지원합니다.','상시 보호가 필요한 노인 가구 및 장애인 가구, 주민등록상 거주지와 동거자 유무와 관계없이 실제로 혼자 살고있는 만 65세 이상의 노인, 기초생활수급자 인증서류, 기초연금수급자 인증서류','https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00001093&wlfareInfoReldBztpCd=01',1),(3,1,25,'서울','서울시 복지 정책, 청년 1인가구 정책','저소득 노인 보행보조차 지원','신체기능 약화로 보행에 불편을 겪고 있는 저소득 노인에게 보행보조차를 지원','65세 이상 저소득 노인 중 보행보조차가 도움이 되는 자, 기초생활보장 수급자 및 차상위 계층 등 저소득 노인, 보행보조차 작동 능력이 가능한 자','https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00000696&wlfareInfoReldBztpCd=02',0),(4,2,30,'부산','부산시 복지 정책','청년마음건강지원사업','청년의 심리 건강 회복을 통해 삶의 질을 높이고 건강한 사회구성원이 되도록 돕습니다.','자립준비청년 인증서류, 정신건강복지센터 연계자','https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00004671&wlfareInfoReldBztpCd=01',1),(5,2,30,'부산','부산시 복지 정책','장애수당','생활이 어려운 장애인에게 장애수당을 지급하여 생활의 안정을 돕습니다.','18세 이상의 등록한 장애인 중 ⌈장애인 연금법⌋상 중증장애인이 아닌 국민기초생활수급자 및 차상위 계층, 국민기초생활보장 수급자 인증서류, 차상위계층 인증서류','https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00003265&wlfareInfoReldBztpCd=01',1),(6,3,40,'인천','인천시 복지 정책','전국민 마음투자 지원사업','우울·불안 등 정서적 어려움으로 인해 심리상담이 필요한 국민에게 전문적인 심리상담 서비스 바우처를 제공합니다.','우울·불안 등 정서적 어려움으로 심리상담이 필요한 자, 국가 일반건강검진 결과서, 보호종료확인서, 시설재원증명서 또는 가정위탁보호확인서','https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00005567&wlfareInfoReldBztpCd=01',1),(7,3,40,'인천','인천시 복지 정책','장애수당','생활이 어려운 장애인에게 장애수당을 지급하여 생활의 안정을 돕습니다.','⌈장애인 연금법⌋상 중증장애인이 아닌 국민기초생활수급자 및 차상위 계층, 국민기초생활보장수급자 증명서, 차상위 계층 증명서','https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00003265&wlfareInfoReldBztpCd=01',1),(8,4,28,'대전','대전시 복지 정책','한부모가족자녀 교육비 지원','저소득 한부모가족 및 조손가족의 교육비(학비)를 지원합니다.','초중고에 재학중인 한부모가족의 자녀와 조손가족의 손자녀, 소득인정액이 중위소득의 60% 이하인 한부모가족(모자가족, 부자가족) 및 조손가족, 소득재산 신고서, 사회보장급여 신청서','https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00001104&wlfareInfoReldBztpCd=01',1),(9,4,28,'대전','대전시 복지 정책','한부모가족 아동양육비 지원','저소득 한부모가족 및 조손가족이 가족의 기능을 유지하고 안정된 생활을 할 수 있도록 아동 양육비를 지원합니다.','기준 중위소득 63% 이하 한부모 및 조손가족, 한부모가족증명서, 사회보장급여 신청서, 소득재산 신고서','https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00001068&wlfareInfoReldBztpCd=01',1),(10,5,35,'대구','대구시 복지 정책','장애인 생활 지원','장애인을 위한 생활 보조금 제공','장애인 등록 확인서','https://www.naver.com/',1),(11,5,35,'대구','대구시 복지 정책','장애인 주거 지원','장애인의 주거 안정성을 위한 임대료 지원','주거비 지원 대상 확인서','https://www.naver.com/',1),(12,4,60,'서울','서울시 복지 정책','가사, 간병 방문 지원사업','일상생활이 어려운 저소득층 가정에 간병·가사 서비스를 지원하여 취약계층의 생활 안정을 도모하고 가사·간병 방문 제공인력의 사회적 일자리를 창출합니다.','만 65세 미만의 기준중위소득 70% 이하, 소년소녀가정, 조손가정, 한부모가정, 사회보장급여 신청서, 사회서비스 전용 국민행복카드 발급신청서, 국민행복카드 상담전화를 위한 개인정보 제공동의서','https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00001087&wlfareInfoReldBztpCd=01',1),(13,3,45,'부산','부산시 복지 정책','알코올중독자 사례관리 사업','중독관리통합지원센터를 통해 알코올 사용장애가 있는 국민의 자활을 위한 상담, 치료, 재활 지원 서비스를 제공합니다.','특이 필요 서류 없음.','https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00001160&wlfareInfoReldBztpCd=01',1),(14,2,35,'대구','대구시 복지 정책','장애인일자리지원','18세 이상 미취업 장애인에게 공공형 일자리를 제공하여 사회참여 확대와 소득보장을 도모합니다.','⌈장애인복지법⌋ 상 등록된 미취업 장애인, 국민건강보험직장가입서류, 장애 등급 판정 인증 서류','https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00000025&wlfareInfoReldBztpCd=01',1),(15,2,40,'광주','광주시 복지 정책','상병수당 시범사업','근로자가 업무 외 질병·부상으로 경제활동이 어려운 경우 치료에 집중할 수 있도록 소득을 보전합니다.','상병수당 시범사업 지역 거주 취업자 및 근로자, 건강보험료 인증서류, 상병수당 지급 신청서, 의료이용 증비서','https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00004997&wlfareInfoReldBztpCd=01',1);
/*!40000 ALTER TABLE `WelfarePolicies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `YangChun_VisitReport`
--

DROP TABLE IF EXISTS `YangChun_VisitReport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `YangChun_VisitReport` (
  `reportid` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `stt_file_name` varchar(255) NOT NULL,
  `stt_transcript_path` text,
  `visittime` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`reportid`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `YangChun_VisitReport`
--

LOCK TABLES `YangChun_VisitReport` WRITE;
/*!40000 ALTER TABLE `YangChun_VisitReport` DISABLE KEYS */;
INSERT INTO `YangChun_VisitReport` VALUES (1,'alice@example.com','2025년 4월 3일 회의록','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_127.0.0.1_37470_20250527_220322.txt','2025-04-03 10:00:00'),(2,'bob@example.com','상반기 사업 계획 발표','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_210.94.220.229_45560_20250417_160328.txt','2025-04-05 14:30:00'),(3,'charlie@example.com','보안 정책 점검 회의','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_210.94.220.229_45560_20250417_160328.txt','2025-04-10 09:45:00'),(4,'alice@example.com','4월 마케팅 회의','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_210.94.220.229_45560_20250417_160328.txt','2025-04-15 11:00:00'),(5,'dana@example.com','기술 세미나 녹취','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_210.94.220.229_45560_20250417_160328.txt','2025-04-18 16:15:00'),(6,'wonwoo@naver.com','2025년 4월 3일 회의록','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_210.94.220.229_45560_20250417_160328.txt','2025-04-03 10:00:00'),(7,'wonwoo@naver.com','상반기 사업 계획 발표','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_210.94.220.229_45560_20250417_160328.txt','2025-04-05 14:30:00'),(8,'wonwoo@naver.com','보안 정책 점검 회의','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_210.94.220.229_45560_20250417_160328.txt','2025-04-10 09:45:00'),(9,'wonwoo@naver.com','4월 마케팅 회의','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_210.94.220.229_45560_20250417_160328.txt','2025-04-15 11:00:00'),(10,'wonwoo@naver.com','기술 세미나 녹취','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_210.94.220.229_45560_20250417_160328.txt','2025-04-18 16:15:00'),(11,'wonwoo@naver.com','meta data test',NULL,'2025-05-26 23:08:56'),(12,'wonwoo@naver.com','meta data test 2','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_121.170.211.192_51257_20250526_231134.txt','2025-05-26 23:11:31'),(13,'wonwoo@naver.com','stttttttt!!!!!!','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_121.170.211.192_53000_20250526_232743.txt','2025-05-26 23:27:39'),(14,'wonwoo@naver.com','sttttt22222ttt!!!!!!','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_121.170.211.192_53260_20250526_233003.txt','2025-05-26 23:30:01'),(15,'wonwoo@naver.com','sttttttt!!!!!!3','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_121.170.211.192_53687_20250526_233422.txt','2025-05-26 23:34:20'),(16,'wonwoo@naver.com','sttttttt!!!!!!4','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_121.170.211.192_54488_20250526_234259.txt','2025-05-26 23:42:57'),(17,'wonwoo@naver.com','sttttttt!!!!!!5','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_121.170.211.192_55169_20250526_235050.txt','2025-05-26 23:50:48'),(18,'wonwoo@naver.com','stt test minwoo','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_121.170.211.192_56427_20250527_000241.txt','2025-05-27 00:02:39'),(19,'wonwoo@naver.com','wonwoo test 1','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_121.170.211.192_60368_20250527_221447.txt','2025-05-27 22:14:45'),(20,'wonwoo@naver.com','wonwoo test 2','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_121.170.211.192_61103_20250527_222157.txt','2025-05-27 22:21:55'),(21,'wonwoo@naver.com','wonwoo test 3','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_121.170.211.192_61860_20250527_222749.txt','2025-05-27 22:27:47'),(22,'wonwoo@naver.com','wonwoo test 4','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_121.170.211.192_62555_20250527_223315.txt','2025-05-27 22:33:13'),(23,'wonwoo@naver.com','wonwoo test 5','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_121.170.211.192_38472_20250527_224103.txt','2025-05-27 22:41:01'),(24,'wonwoo@naver.com','wonwoo test 6','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_121.170.211.192_64048_20250527_224633.txt','2025-05-27 22:46:30'),(25,'wonwoo@naver.com','wonwoo test 7','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_121.170.211.192_38492_20250527_224702.txt','2025-05-27 22:47:00'),(26,'wonwoo@naver.com','wonwoo test 7','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_121.170.211.192_64518_20250527_225336.txt','2025-05-27 22:53:32'),(27,'wonwoo@naver.com','기본 제목','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_121.170.211.192_65421_20250527_230447.txt','2025-05-27 23:04:45'),(28,'wonwoo3@naver.com','구청 민원 응대기록','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_121.170.211.192_38666_20250527_233118.txt','2025-05-27 23:31:16'),(29,'wonwoo4@naver.com','하이','/home/BackEnd/AI/funcs/stt_AI/upload/transcript_121.170.211.192_38706_20250528_000421.txt','2025-05-28 00:04:19');
/*!40000 ALTER TABLE `YangChun_VisitReport` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-31 22:21:18
