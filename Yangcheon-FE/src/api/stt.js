// src/api/stt.js
import { http } from "./httpClient";
import { ENDPOINTS } from "./endpoints";

export function initiateSTTupload(email) {
  // 📅 timestamp 생성
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:]/g, "")
    .replace("T", "_")
    .slice(0, 15); // YYYYMMDD_HHmmss

  const stt_file_name = `정보공개청구-${timestamp}.wav`;

  return http(ENDPOINTS.sttInitiate, {
    method: "POST",
    body: {
      stt_file_name: stt_file_name,
      user_email: email,
    },
  });
}

export function getSttAbstract(reportId) {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    throw new Error("토큰이 없습니다.");
  }

  return http(`${ENDPOINTS.sttAbstract}/${reportId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function finishSTTupload(reportid) {
  return http(ENDPOINTS.sttFinish, { method: "POST", body: { reportid } });
}
