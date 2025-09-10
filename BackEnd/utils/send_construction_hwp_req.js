// Node 18+ 이상: fetch 내장, Node 16 이하는 node-fetch 필요
import fs from "fs";
import path from "path";
import fetch from "node-fetch"; // Node 18+에서는 불필요
import FormData from "form-data"; // npm install form-data

// Node 18+ 또는 브라우저 모두 동작 (Node 16 이하는 node-fetch 필요)
const ENDPOINT = "http://127.0.0.1:8090/"; // 필요 시 경로 변경 예: "/api/information_open"

// const payload = {
//     reportType: "construction_machinery_license",
//     file_name: "report_1_202508152235.hwp",
//     items: {
// 	   qualificationType : "~~등급", 
// 	   registrationNumber : "124124",
// 	   licenseNumber : "01-123-123", 
// 	   issueDate : "2024-3-3",
// 	   name : "홍길동", 
// 	   residentNumber : "001234-12412414",
// 	   address : "대전시 서구 ~~", 
// 	   phone : "010-1234-5678", 
// 	   licenseType : "테스트타입", 
// 	   isreissue : true,
// 	   reissueReason : "그그뭐였더라"
//     },
// };
// 발급
const payload = {
    reportType: "construction_machinery_license",
    file_name: "report_1_202508152235.hwp",
    items: {
	   qualificationType : "~~등급", 
	   registrationNumber : "124124",
	   licenseNumber : "01-123-123", 
	   issueDate : "2024-3-3",
	   name : "홍길동", 
	   residentNumber : "001234-12412414",
	   address : "대전시 서구 ~~", 
	   phone : "010-1234-5678", 
	   licenseType : "테스트타입", 
	   isreissue : false,
	   reissueReason : null
    },
};

// 이미지 경로
const imagePath = "/home/BackEnd/uploads/wav/reportID-501-imgfile-1755012875902-964112609.png";

async function postAndDownloadHWP() {
  const formData = new FormData();

  // JSON 데이터를 문자열로 넣기
  formData.append("data", JSON.stringify(payload));

  // 이미지 파일 추가
  formData.append("image", fs.createReadStream(imagePath), path.basename(imagePath));

  // 요청
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  const res = await fetch(ENDPOINT, {
    method: "POST",
    body: formData,
    signal: controller.signal,
    headers: formData.getHeaders(), // multipart 헤더 자동 설정
  }).catch((e) => {
    throw new Error(`Request failed: ${e.message}`);
  });

  clearTimeout(timeout);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} :: ${text}`);
  }

  // 서버가 HWP 파일을 보내줄 경우 저장
  const fileStream = fs.createWriteStream("OUTPUT_FILENAME.hwp");
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", resolve);
  });

  console.log("✅ 파일 저장 완료: OUTPUT_FILENAME.hwp");
}

// 실행
postAndDownloadHWP().catch((err) => {
  console.error("❌ 요청 실패:", err.message);
});