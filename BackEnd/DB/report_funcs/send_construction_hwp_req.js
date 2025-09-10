// hwpClient.js
import fs from "fs";
import path from "path";
import fetch from "node-fetch"; // Node 18+ 이상이면 필요 없음
import FormData from "form-data"; // npm install form-data

const ENDPOINT = "http://127.0.0.1:8090/"; // 필요 시 경로 변경

/**
 * HWP 요청 후 다운로드 (건설기계조종사면허증 발급/재발급)
 * @param {string|undefined} imagePath1 - 이미지1 경로
 * @param {string|undefined} imagePath2 - 이미지2 경로
 * @param {Object} licenseData - 면허 정보
 * @param {string} file_name - 저장될 파일명 (예: "report_20250815.hwp")
 */
export async function postAndDownloadHWPLicense(imagePaths, licenseData, file_name) {
  const payload = {
    reportType: "construction_machinery_license", // 고정값
    file_name,
    items: licenseData,
  };

  const formData = new FormData();
  formData.append("data", JSON.stringify(payload));

  console.log("imagePaths from postAndDownloadHWPLicense : ", imagePaths)
  console.log("imagePath1 : ", imagePaths.imagePath1)
  console.log("imagePath2 : ", imagePaths.imagePath2)
  
  // imagePath1: '/home/BackEnd/URIProcess/new_data/upload_sign/reportID-1375-imgfile-1755361200123-101010101.png',
  // imagePath2: '/home/BackEnd/URIProcess/new_data/upload_sign/reportID-1375-imgfile-1755361203456-202020202.png'
  // ---- 이미지 첨부 (최대 2장) ----
  const { imagePath1, imagePath2 } = Array.isArray(imagePaths)
    ? { imagePath1: imagePath1, imagePath2: imagePath2 }
    : (imagePaths || {});

    
  // ---- 이미지 첨부 (최대 2장) ----
  const attachments = [];
  const attachIfExists = (p, label) => {
    if (!p) return;
    if (fs.existsSync(p)) {
      const fname = path.basename(p);
      formData.append("images", fs.createReadStream(p), fname);
      attachments.push({ label, path: p, name: fname });
    } else {
      console.warn(`⚠️ ${label} not found: ${p}`);
    }
  };

  console.log("🧷 첨부 시도:", { imagePath1, imagePath2 });
  attachIfExists(imagePath1, "imagePath1");
  attachIfExists(imagePath2, "imagePath2");
  console.log("🖼️ 첨부 완료 목록:", attachments);

  // 요청
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  console.log("📤 최종 payload:", payload);

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
  const fileStream = fs.createWriteStream(file_name);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", resolve);
  });

  console.log(`✅ 파일 저장 완료: ${file_name}`);
}