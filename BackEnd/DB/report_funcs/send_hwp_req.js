// hwpClient.js
import fs from "fs";
import path from "path";
import fetch from "node-fetch"; // Node 18+ 이상이면 필요 없음
import FormData from "form-data"; // npm install form-data

const ENDPOINT = "http://127.0.0.1:28090/"; // 필요 시 경로 변경

/**
 * HWP 요청 후 다운로드
 * @param {string} imagePath - 이미지 파일 경로
 * @param {Object} applicantData - 신청인 정보
 * @param {Object} summaryData - 요약 데이터
 * @param {Object} methodData - 방법 데이터
 * @param {Object} feeData - 수수료 데이터
 * @param {string} file_name - 저장될 파일명 (예: "report_20250815.hwp")
 */
export async function postAndDownloadHWP(
  imagePath,
  applicantData,
  summaryData,
  methodData,
  feeData,
  file_name
) {
  const payload = {
    reportType: "information_open", // 고정값
    file_name,
    items: {
      applicantData,
      summaryData,
      methodData,
      feeData,
    },
  };

  const formData = new FormData();
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
    headers: formData.getHeaders(),
  }).catch((e) => {
    throw new Error(`Request failed: ${e.message}`);
  });

  clearTimeout(timeout);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} :: ${text}`);
  }

  // 서버가 HWP 파일을 보내줄 경우 저장
  const fileStream = fs.createWriteStream(file_name);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", resolve);
  });

  console.log(`✅ 파일 저장 완료: ${file_name}`);
}
