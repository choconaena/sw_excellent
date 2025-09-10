// Node 18+ 이상: fetch 내장, Node 16 이하는 node-fetch 필요
import fs from "fs";
import path from "path";
import fetch from "node-fetch"; // Node 18+에서는 불필요
import FormData from "form-data"; // npm install form-data

// Node 18+ 또는 브라우저 모두 동작 (Node 16 이하는 node-fetch 필요)
const ENDPOINT = "http://127.0.0.1:8090/"; // 필요 시 경로 변경 예: "/api/information_open"

const payload = {
  reportType: "information_open",
  file_name: "report_1_202508152155.hwp",
  items: {
    applicantData: {
      name: "이준학",
      birthDate: "2000.11.03",
      address: "대전시 서구 계룡로 279번길 11 205호",
      passport: "MQ123456",
      phone: "010-6557-0010",
      email: "junhak1103@Naver.com",
      fax: "02-3421-1720",
      businessNumber: "12345-12525",
      gender: "남" // 남 여
    },
    summaryData: {
      content: "[데이터 청구] 6월 28일 발생한 선릉역 앞 CCTV 정보공개청구",
      isPublic: true,
    },
    methodData: {
      disclosureMethods: [0, 1, 1, 0, 0],
      receiveMethods: [1, 0, 0, 0, 1],
      otherDisclosureMethod: "이메일로 보내주세요",
      otherReceiveMethod: "기발한 방법으로 보내주세요",
    },
    feeData: {
      exemptionType: "exempt", // "exempt" | "non-exempt"
      exemptionReason: "연구목적 또는 행정감시",
    },
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

  console.log("final payload : ",formData)
  
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
  console.error("❌ 요청 실패 in send_hwp_req.js:", err.message);
});