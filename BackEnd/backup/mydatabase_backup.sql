-- MySQL dump 10.13  Distrib 8.0.39, for Linux (x86_64)
--
-- Host: localhost    Database: ConsultantDB
-- ------------------------------------------------------
-- Server version	8.0.39-0ubuntu0.20.04.1

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
  CONSTRAINT `Appointments_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `Client` (`client_id`),
  CONSTRAINT `Appointments_ibfk_2` FOREIGN KEY (`consultant_id`) REFERENCES `Users` (`user_id`)
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
  CONSTRAINT `Checklist_ibfk_2` FOREIGN KEY (`consultant_id`) REFERENCES `Users` (`user_id`),
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
  CONSTRAINT `ConsultationComments_ibfk_1` FOREIGN KEY (`consultant_id`) REFERENCES `Users` (`user_id`),
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
INSERT INTO `ConversationLogs` VALUES (1,6,6,'2024-11-01','[{\"title\": \"사회적 고립 상태 평가\", \"content\": [\"사회적 관계: 고객은 최근에 새로운 사람들과의 만남을 시도했지만 여전히 어색함을 느끼고 있습니다.\", \"외로움 및 고립감: 고립감을 줄이기 위해 주말에 취미 활동을 계획하고 있습니다.\"]}, {\"title\": \"정신적 및 감정적 건강 상태 평가\", \"content\": [\"스트레스: 고객은 직장 내 프로젝트 마감으로 인해 스트레스를 많이 받고 있습니다.\", \"수면 장애: 수면의 질은 개선되었지만 여전히 피로감을 느끼고 있습니다.\"]}]'),(2,7,7,'2024-11-02','[{\"title\": \"경제적 안정성 평가\", \"content\": [\"경제 상태: 고객은 최근 승진으로 인해 소득이 증가하였으나 재정 관리를 어떻게 해야 할지 고민하고 있습니다.\", \"재정 계획: 장기적인 저축 계획의 필요성이 다시 강조되었습니다.\"]}, {\"title\": \"생활 패턴 및 건강 관리 상태 평가\", \"content\": [\"운동 습관: 고객은 매주 3회 운동을 시작했고, 건강 개선을 느끼고 있습니다.\", \"식사 패턴: 신선한 식재료를 활용한 식사 비중이 증가했습니다.\"]}]'),(3,8,8,'2024-11-03','[{\"title\": \"정신적 및 감정적 건강 상태 평가\", \"content\": [\"스트레스 관리: 고객은 새로운 스트레스 관리 기법을 배우기 위해 상담을 받기 시작했습니다.\", \"심리적 변화: 감정의 기복이 있지만 개선되고 있는 징후를 보입니다.\"]}, {\"title\": \"사회적 관계 개선\", \"content\": [\"친구와의 소통: 고객은 정기적인 모임에 참석하여 새로운 사람들과의 관계를 형성하고 있습니다.\", \"의욕 증진: 최근 운동 및 취미 활동이 의욕을 증진시키고 있습니다.\"]}]'),(4,9,9,'2024-11-04','[{\"title\": \"건강 상태 평가\", \"content\": [\"신체 건강: 고객은 최근 건강검진에서 혈압이 조금 높게 나왔습니다.\", \"운동 계획: 고객은 요가 수업을 등록하여 스트레칭과 명상으로 건강을 관리하기로 했습니다.\"]}, {\"title\": \"식사 관리\", \"content\": [\"식사 습관: 고객은 식단 개선을 위해 영양사를 고용하였습니다.\", \"수분 섭취: 매일 물을 충분히 마시기 위해 노력 중입니다.\"]}]'),(5,10,10,'2024-11-05','[{\"title\": \"경제적 안정성 평가\", \"content\": [\"소득 증대: 고객은 새로운 부업을 통해 추가 수입을 얻고 있습니다.\", \"지출 관리: 필수 지출 항목을 재정비하고 예산 계획을 수정했습니다.\"]}, {\"title\": \"취미와 여가 활동\", \"content\": [\"취미 생활: 고객은 새로운 악기를 배우며 스트레스를 해소하고 있습니다.\", \"여가 활용: 정기적인 야외 활동을 통해 심신의 균형을 유지하고 있습니다.\"]}]');
/*!40000 ALTER TABLE `ConversationLogs` ENABLE KEYS */;
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
INSERT INTO `Questions` VALUES (1,'아버님 요즘도 ‘6시 내고향’ 즐겨보세요? 어떤 지역 나오면 제일 반가우세요?,프로그램 보시면 고향 생각도 많이 나시겠어요. 아버님 고향 얘기 좀 해주실 수 있으세요?,‘6시 내고향’ 보면 옛날 친구들 생각도 나시죠? 가끔 연락하는 친구분도 계세요?',3),(2,'아버님 요즘 무릎은 좀 어떠세요? 날씨 바뀌면 더 아프실 때도 있나요?,무릎 때문에 걷는 게 힘드시다고 하셨는데 특히 언제가 제일 불편하세요?,요즘 무릎 상태는 어떠세요? 혹시 운동이나 스트레칭 같은 거 조금씩 해보시나요?',3),(3,'아버님 복지관에서 점심 무료로 제공한다던데 혹시 알고 계셨어요?,가끔 복지관에 가시면 다른 어르신들과도 이야기 나누실 수 있는데 가보실 생각 있으세요?,아버님 복지관 점심 프로그램에 가시면 어떨까요? 식사도 드시고 산책도 할 수 있어서 좋을 것 같아요.',3),(4,'요즘 자녀분들이랑은 자주 연락하시나요? 잘 안 된다고 하셔서 걱정되네요.,자녀분들도 바쁘시지만 아버님이 먼저 연락하면 좋아할 것 같은데 어떠세요?,자녀분들과 통화하면 힘도 나실 것 같은데 요즘은 가끔 연락 주고받으세요?',3),(5,'얼마 전에 보육원 친구들이랑 만났다고 했잖아. 오랜만에 보니까 어떤 얘기 많이 했어?,친구들이랑 자주 보기 힘들어서 아쉽지? 또 만나기로 했어?,오랜만에 친구들 만나고 나니까 기분이 좀 풀렸어?',3),(6,'밤에 잠드는 게 쉽지 않다고 했잖아. 요즘도 잠 잘 못 자?,잠이 안 와서 혼자 술 마시는 일이 잦아졌다고 했는데, 조금 줄여볼까 싶기도 해?,밤에 혼자 있을 때 잠 안 오면 마음이 더 복잡해지지? 요즘엔 어떻게 지내?',3),(7,'몸이 힘들어도 어떻게든 일하고 싶다고 했잖아. 요즘에도 일자리 알아보고 있어?,생활비가 걱정돼서 일하고 싶다고 했었지? 혹시 지금 생각 중인 일 같은 게 있어?,이전에는 어떤 일 했었어? 가지고 있는 자격증 같은거 있어?',3),(8,'사고 이후에 병원비 부담돼서 진료 못 받고 있다고 했잖아. 요 상태는 좀 어때?,병원비가 부담돼서 약도 자주 못 먹고 있다고 했는데, 혹시 필요한 약 있어?,재활 치료가 도움이 되는데 병원비 때문에 미루고 있다고 했지?',3),(10,'요즘도 ‘런닝맨’ 챙겨 보신다고 하셨죠? 따님들과 함께 보셨던 기억도 나실 것 같아요.,저번주 \'런닝맨\'에 이효리가 나오던데, 저번주도 챙겨보셨어요?,따님들이 좋아하던 예능을 보니까, 가족 생각이 더 나실 것 같아요. 요즘도 재미있게 보고 계세요?',3),(11,'따님께서 전공하시는 바이올린 배우는 걸 고민 중이시라고 하셨죠?,바이올린 배우시면 따님이랑 이야기 나눌 거리도 많아지겠어요. 아직 고민 중이세요?,복지관에서 악기 강습 프로그램을 많이 하던데, 알아봐드릴까요?',3),(12,'고혈압 때문에 걱정된다고 하셨는데, 요즘 식사나 생활 관리는 좀 어떠세요?,보건소에서 고혈압 관리 프로그램도 있던데, 참여해보시는 건 어떠세요?,최근에 건강 검진이나 혈압 체크는 해보셨나요?',3),(13,'가족들과 영상통화가 큰 위로가 된다고 하셨는데, 요즘 통화는 자주 하고 계세요?,따님분들 자랑 좀 해주세요. 둘다 유학을 간거 보니 공부를 엄청 잘했나봐요.,둘째딸은 어떤 공부 중이에요? 공부는 잘 되고 있다던가요?',3),(14,'태현이 교육비가 부담된다고 하셨는데, 요즘도 많이 고민되세요?,생활비 마련이 걱정되신다고 하셨죠. 요즘 어떻게 감당하고 계세요?,양육비 지원 같은 것도 있던데, 필요하시면 한번 알아봐드릴까요?',3),(15,'허리 아프신거는 좀 어때요? 계속 통증이 심한가요?,집안일이나 손자 돌보는 게 힘드실 것 같은데, 어떻게 지내고 계세요?,가사나 간병 지원 서비스도 있는데, 도움을 받아보시는 건 어떠세요?',3),(16,'이제 전세 계약이 얼마 남지 않아서 걱정되신다고 하셨죠?,전세 자금 마련이 어려우실 것 같아요. 요즘 주거 문제로 고민이 많으시겠어요.,전세 자금 대출도 있는데, 필요하시면 도움받으실 수 있는지 알아봐 드릴까요?',3),(17,'태현이가 친구랑 어울리는 걸 좋아하나요? 요즘은 또래 친구들과 잘 지내고 있나요?,태현이 키가 볼때마다 쑥쑥 크는거 같아요. 밥은 잘 먹나요?,내년이면 태현이도 초등학교 들어가는데, 준비는 잘 되고 계신가요?',3);
/*!40000 ALTER TABLE `Questions` ENABLE KEYS */;
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
INSERT INTO `TempChecklist` VALUES (1,1,4),(2,2,2),(3,3,2),(4,4,1),(5,5,5);
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
INSERT INTO `TempQuestions` VALUES (1,1,4),(2,2,6),(3,3,10),(4,4,13),(5,5,5);
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
  `name` varchar(100) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `permission` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'Alice Kim','010-1234-5678','alice@example.com','1990-05-21','Female','Consultant'),(2,'Bob Lee','010-2345-6789','bob@example.com','1985-08-13','Male','Consultant'),(3,'Charlie Park','010-3456-7890','charlie@example.com','1992-11-02','Male','Admin'),(4,'David Choi','010-4567-8901','david@example.com','1987-03-15','Male','Consultant'),(5,'Eva Han','010-5678-9012','eva@example.com','1995-07-30','Female','Consultant');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `WelfarePolicies`
--

DROP TABLE IF EXISTS `WelfarePolicies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `WelfarePolicies` (
  `policy_id` int NOT NULL AUTO_INCREMENT,
  `id` int DEFAULT NULL,
  `age` int DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `non_duplicative_policies` text,
  `policy_name` varchar(255) DEFAULT NULL,
  `short_description` text,
  `detailed_conditions` text,
  `link` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`policy_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `WelfarePolicies`
--

LOCK TABLES `WelfarePolicies` WRITE;
/*!40000 ALTER TABLE `WelfarePolicies` DISABLE KEYS */;
INSERT INTO `WelfarePolicies` VALUES (1,1,25,'서울','서울시 복지 정책, 청년 1인가구 정책','노인 의료비 지원','무릎통증 및 기타 건강 문제로 병원 방문 필요시 의료비 부담 경감 가능','외과 관련 진료기록 확인서, 건강보험 납부 확인서','https://www.naver.com/'),(2,1,25,'서울','서울시 복지 정책, 청년 1인가구 정책','청년 주거 지원','주거 비용 부담을 줄이기 위한 임대료 지원 프로그램','주거비 지원 대상 확인서','https://www.naver.com/'),(3,1,25,'서울','서울시 복지 정책, 청년 1인가구 정책','청년 교육비 지원','학비 부담을 줄이기 위한 교육비 지원 프로그램','교육비 지원 대상 확인서','https://www.naver.com/'),(4,2,30,'부산','부산시 복지 정책','노인 장기 요양 보험','취약노인에게 맞춤형 예방적 돌봄서비스 제공','외과 관련 진료기록 확인서, 가족관계 증명서','https://www.naver.com/'),(5,2,30,'부산','부산시 복지 정책','노인 생활 지원','일상 생활에 필요한 생활 용품 제공','생활 지원 대상 확인서','https://www.naver.com/'),(6,3,40,'인천','인천시 복지 정책','어르신 건강 지원','어르신의 건강 상태를 위한 무료 건강 검진 제공','건강 검진 대상 확인서','https://www.naver.com/'),(7,3,40,'인천','인천시 복지 정책','어르신 주거 지원','어르신을 위한 주거 안정 지원 프로그램','주거 지원 대상 확인서','https://www.naver.com/'),(8,4,28,'대전','대전시 복지 정책','청년 창업 지원','창업을 시작하는 청년에게 초기 자금 및 교육 제공','사업 계획서, 청년 지원 대상 확인서','https://www.naver.com/'),(9,4,28,'대전','대전시 복지 정책','청년 생활비 지원','생활비 지원을 통해 청년들의 경제적 부담 완화','생활비 지원 대상 확인서','https://www.naver.com/'),(10,5,35,'대구','대구시 복지 정책','장애인 생활 지원','장애인을 위한 생활 보조금 제공','장애인 등록 확인서','https://www.naver.com/'),(11,5,35,'대구','대구시 복지 정책','장애인 주거 지원','장애인의 주거 안정성을 위한 임대료 지원','주거비 지원 대상 확인서','https://www.naver.com/');
/*!40000 ALTER TABLE `WelfarePolicies` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-11-10 19:25:15
