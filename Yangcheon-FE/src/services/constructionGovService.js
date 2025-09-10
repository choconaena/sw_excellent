// src/services/constructionGovService.js
import {
  getGovResultList,
  postLicenseInfo,
  uploadConstructionSign,
} from "../api/constructionGov";
import { useReportStore } from "../store/useReportStore";
import { useAuthStore } from "../store/authStore";
import { getSocket } from "../ws/socket";

/** 내부: 현재 로그인 사용자의 room 문자열 */
function getRoom() {
  const u = useAuthStore.getState().user;
  const email = u?.email ?? u?.user_email ?? u?.mail ?? null;
  return email ? String(email) : null;
}

/** 내부: 같은 룸에 data 메시지로 payload 브로드캐스트 */
function sendRoomData(payload) {
  try {
    const room = getRoom();
    if (!room) return;
    const s = getSocket();
    s.emit("room:message", {
      room,
      msg: { msg_type: "data", content: payload },
    });
  } catch (e) {
    console.warn("WS data broadcast 실패:", e);
  }
}

/**
 * 서버 결과를 테이블용 형태로 정규화해서 반환
 * [{ id, date, time, type, content, hasAttachment, attachment, email, raw }]
 */
export async function fetchGovResults() {
  const res = await getGovResultList();
  const list = Array.isArray(res) ? res : res?.items || [];

  const mapped = list.map((r) => {
    const time = (r.report_time || "").slice(0, 5);
    return {
      id: Number(r.reportid),
      date: r.report_date ?? "",
      time,
      type: r.request_type ?? "",
      content: r.content ?? "",
      administrator: r.administrator ?? "",
      hasAttachment: !!r.file_path,
      attachment: r.file_path ?? null,
      email: r.email ?? null,
      raw: r,
    };
  });

  mapped.sort((a, b) => {
    const da = new Date(`${a.date}T${a.time || "00:00"}`);
    const db = new Date(`${b.date}T${b.time || "00:00"}`);
    return db - da;
  });

  return mapped;
}

/** 서버 포맷으로 변환 (isreissue는 boolean) */
export function buildLicensePayload(form) {
  return {
    qualificationType: form.qualificationType || "",
    registrationNumber: form.registrationNumber || "",
    licenseNumber: form.licenseNumber || "",
    issueDate: form.issueDate || "",
    name: form.name || "",
    residentNumber: form.residentNumber || "",
    address: form.address || "",
    phone: form.phone || "",
    licenseType: form.licenseType || "",
    isreissue:
      form.isreissue === true ||
      form.isreissue === "reissue" ||
      form.isreissue === 1 ||
      form.isreissue === "1",
    reissueReason: form.reissueReason || "",
    gender: form.gender,
  };
}

/** 전송: 성공 시 store에 reportId 저장 + 태블릿으로 WS 브로드캐스트 */
export async function submitLicenseInfo(formData, signal) {
  const body = buildLicensePayload(formData);
  const res = await postLicenseInfo(body, signal);

  if (res?.status && res?.reportid) {
    const rid = Number(res.reportid);

    // 1) 웹 전역 store 저장
    useReportStore.getState().setReportMeta({
      reportId: rid,
      status: true,
      msg: res.msg ?? "",
    });

    // 2) 같은 room의 태블릿에 WS로 reportid 전달
    sendRoomData({ reportid: rid });
  }

  return res;
}

/**
 * (Tablet) 건설기계 전자서명 업로드 서비스 래퍼
 * params: { blob, reportId, num = 1 }
 * reportId 미지정 시 store에서 자동 사용
 */
export async function submitConstructionSignature({ blob, reportId, num = 1 }) {
  const rid = Number(reportId ?? useReportStore.getState().reportId ?? 0);
  if (!rid) throw new Error("reportId가 없습니다.");

  const res = await uploadConstructionSign({
    reportid: rid,
    num: Number(num) || 1,
    blob,
  });

  const ok = res?.status === true || res?.success === true;
  if (!ok) {
    throw new Error(res?.msg || res?.message || "서명 업로드에 실패했습니다.");
  }

  return {
    success: true,
    message: res?.msg || res?.message || "서명 업로드에 성공했습니다.",
    reportid: res?.reportid ?? rid,
    raw: res,
  };
}
