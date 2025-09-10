// src/api/constructionGov.js
import { http } from "./httpClient";
import { ENDPOINTS } from "./endpoints";
import { API_BASE_URL } from "../config/env";

export function getGovResultList(signal) {
  return http(ENDPOINTS.govResultList, { method: "GET", signal });
}

export const reportDownloadPath = (reportid) =>
  `${ENDPOINTS.reportResultDownload}/${encodeURIComponent(reportid)}`;

// Content-Disposition에서 파일명 뽑기 (없을 수 있음)
const nameFromCD = (res) => {
  const cd = res.headers.get("content-disposition") || "";
  const mStar = cd.match(/filename\*=UTF-8''([^;]+)/i);
  const mBasic = cd.match(/filename="?([^";]+)"?/i);
  let name = (mStar && mStar[1]) || (mBasic && mBasic[1]) || "";
  try {
    name = decodeURIComponent(name);
  } catch (e) {
    void e;
  }
  return name;
};

/** 무조건 .hwp로 저장하는 다운로드 */
export async function downloadGovReport(
  reportid,
  filenameBase = `report_${reportid}`
) {
  const token = localStorage.getItem("jwtToken");
  const url = `${API_BASE_URL}${reportDownloadPath(reportid)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: token
      ? { Authorization: `Bearer ${token}`, Accept: "*/*" }
      : { Accept: "*/*" },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `다운로드 실패 (${res.status})`);
  }

  // 파일 아닌 응답(에러 JSON/텍스트) 방지
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  if (ct.includes("application/json") || ct.startsWith("text/")) {
    const txt = await res.text().catch(() => "");
    try {
      const j = JSON.parse(txt);
      throw new Error(
        j?.msg || j?.message || "서버가 파일 대신 메시지를 반환했습니다."
      );
    } catch {
      throw new Error(txt || "서버가 파일 대신 메시지를 반환했습니다.");
    }
  }

  // 파일명 결정: CD 우선, 없으면 base 사용 → 확장자 없으면 무조건 .hwp
  let filename = nameFromCD(res) || filenameBase;
  if (!/\.[a-z0-9]{2,5}$/i.test(filename)) filename += ".hwp";

  const blob = await res.blob();
  const a = document.createElement("a");
  const objectUrl = URL.createObjectURL(blob);
  a.href = objectUrl;
  a.download = filename; // ← 항상 .hwp 보장
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

/** 건설기계조종사 면허 발급 정보 전송 */
export function postLicenseInfo(payload, signal) {
  return http(ENDPOINTS.license_info, {
    method: "POST",
    body: payload, // httpClient가 JSON으로 직렬화
    signal,
  });
}

/**
 * 건설기계 전자서명 업로드 (multipart/form-data)
 * body:
 * - reportid: number
 * - num: number (1, 2 등)
 * - imgfile: file
 * 응답 예시: { status: true|false, reportid, msg }
 */
export async function uploadConstructionSign(
  { reportid, num = 1, blob },
  signal
) {
  const token = localStorage.getItem("jwtToken");
  const url = `${API_BASE_URL}${ENDPOINTS.uploadConstructionSign}`;

  const fd = new FormData();
  fd.append("reportid", String(reportid));
  fd.append("num", String(num));

  const file =
    blob instanceof Blob
      ? new File([blob], "signature.png", { type: blob.type || "image/png" })
      : null;

  if (!file) {
    throw new Error("서명 이미지(blob)가 없습니다.");
  }
  fd.append("imgfile", file);

  const res = await fetch(url, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: fd,
    signal,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `서명 업로드 실패 (${res.status})`);
  }

  if (!res.ok) {
    throw new Error(
      data?.msg || data?.message || `서명 업로드 실패 (${res.status})`
    );
  }

  return data;
}
