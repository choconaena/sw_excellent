// src/services/consultationService.js
import {
  uploadApplicant,
  uploadReceiveMethodChecklist,
  uploadSignImage,
  uploadReceiveMethodChecklistWeb,
  uploadFeeExempt,
  uploadApplicantEdit,
  uploadSttAbstractEdit,
  insertGovResultList,
} from "../api/consultation";

import { getSttAbstract } from "../api/stt";
import { useReportStore } from "../store/useReportStore";

export function submitApplicantData(applicantData) {
  return uploadApplicant(applicantData);
}

// 성공/메시지 공통 판정 유틸
const isServerOk = (res) => res?.status === true || res?.success === true;
const pickServerMsg = (res) => res?.msg ?? res?.message ?? "";

// ✅ 청구인 정보 전송 (edit 엔드포인트 사용 + reportid 포함)
export async function submitApplicantDataWeb(form) {
  const reportId = useReportStore.getState().reportId;
  if (!reportId)
    throw new Error("reportId가 없습니다. STT 세션을 먼저 시작해 주세요.");

  const payload = {
    reportid: Number(reportId),
    name: form.name?.trim() || "",
    birthDate: form.birthDate || "",
    address: form.address?.trim() || "",
    passport: form.passport?.trim() || "",
    phone: form.phone?.trim() || "",
    email: form.email?.trim() || "",
    fax: form.fax?.trim() || "",
    businessNumber: form.businessNumber?.trim() || "",
    gender: Number.isInteger(form.gender) ? Number(form.gender) : 0,
  };

  if (!payload.name || !payload.birthDate || !payload.address) {
    throw new Error("성명/생년월일/주소는 반드시 필요합니다.");
  }

  console.groupCollapsed("🧾 [APPLICANT edit] payload");
  console.table(payload);
  console.groupEnd();

  const res = await uploadApplicantEdit(payload);
  console.log("📥 [APPLICANT edit] server res:", res);

  if (!isServerOk(res)) {
    throw new Error(pickServerMsg(res) || "청구인 정보 전송에 실패했습니다.");
  }

  // 호출부에서 일관되게 쓸 수 있도록 표준화해서 반환
  return {
    success: true,
    message: pickServerMsg(res) || "신청 정보가 저장되었습니다.",
    data: res?.data ?? null,
    raw: res,
  };
}

export async function generateSummary(reportId = 501) {
  try {
    const result = await getSttAbstract(reportId);
    console.log("요약 결과:", result);

    const items = result.items;
    if (items && items.length > 0) {
      const { abstract, detail, subject } = items[0];
      return {
        abstract,
        detail,
        subject,
        success: true,
      };
    } else {
      console.warn("요약 항목이 없습니다.");
      return { success: false, message: "요약 항목이 없습니다." };
    }
  } catch (err) {
    console.error("요약 요청 에러:", err);
    return { success: false, message: err.message };
  }
}

/** (Tablet) 공개/수령 방법 체크리스트 전송 */
export function submitAppReceiveMethodChecklist({
  disclosureMethods,
  receiveMethods,
}) {
  const disclosureIds = ["view", "copy", "electronic", "copy-print", "other"];
  const receiveIds = ["direct", "mail", "fax", "notification", "email"];

  const toBinary = (ids, selected) =>
    ids.reduce((acc, id) => {
      acc[id] = selected.includes(id) ? 1 : 0; // 1=선택, 0=비선택
      return acc;
    }, {});

  const payload = {
    items: [
      toBinary(disclosureIds, disclosureMethods),
      toBinary(receiveIds, receiveMethods),
    ],
  };

  return uploadReceiveMethodChecklist(payload);
}

/** (Web) 공개/수령 방법 체크리스트 전송 */
export function submitWebReceiveMethodChecklist({
  disclosureMethods,
  receiveMethods,
  // ⬇️ 추가: 기타/전자우편 상세 문자열 (없으면 빈 문자열)
  disclosureOtherText = "",
  receiveEmailText = "",
}) {
  const disclosureIds = ["view", "copy", "electronic", "copy-print", "other"];
  const receiveIds = ["direct", "mail", "fax", "notification", "email"];

  const toBinary = (ids, selected) =>
    ids.reduce((acc, id) => {
      acc[id] = selected.includes(id) ? 1 : 0;
      return acc;
    }, {});

  const base0 = toBinary(disclosureIds, disclosureMethods);
  // 하이픈/스네이크 둘 다 동봉(백엔드 호환)
  const item0 = {
    ...base0,
    copy_print: base0["copy-print"],
    // ✅ 항상 키 포함, 'other' 미선택이면 빈 문자열
    etcContent: base0.other === 1 ? disclosureOtherText.trim() : "",
  };

  const item1Flags = toBinary(receiveIds, receiveMethods);
  const item1 = {
    ...item1Flags,
    // ✅ 항상 키 포함, 'email' 미선택이면 빈 문자열
    emailContent: item1Flags.email === 1 ? receiveEmailText.trim() : "",
  };

  const { reportId } = useReportStore.getState();
  const rid = reportId ?? 501; // 없으면 테스트용 501

  const payload = {
    reportid: rid, // 서버 계약 키
    items: [item0, item1], // [{...etcContent}, {...emailContent}]
  };

  console.log("[웹 체크리스트 payload]", payload);
  return uploadReceiveMethodChecklistWeb(payload);
}

export function submitAppSignature({ blob, reportId }) {
  return uploadSignImage({ reportId, blob });
}

// ✅ (Web) 수수료 감면 전송
export async function submitFeeExemptionWeb({
  exemptionType,
  exemptionReason,
}) {
  const reportId = useReportStore.getState().reportId;
  if (!reportId)
    throw new Error("reportId가 없습니다. STT 세션을 먼저 시작해 주세요.");

  const isexempt = exemptionType === "exempt" ? 1 : 0;
  const content = (exemptionReason || "").trim();

  return uploadFeeExempt({ reportid: reportId, isexempt, content });
}

/**
 * (Web) 요약 결과 수정본 전송
 * items 예:
 * [{ subject: "건강", abstract: "소화관련 불편", detail: "자세한 ~~내용" }]
 */
export async function submitSummaryEditWeb({ items }) {
  const reportId = useReportStore.getState().reportId;
  if (!reportId)
    throw new Error("reportId가 없습니다. STT 세션을 먼저 시작해 주세요.");

  // 최소한의 sanitize
  const safeItems = (Array.isArray(items) ? items : []).map((it) => ({
    subject: (it?.subject ?? "").toString(),
    abstract: (it?.abstract ?? "").toString(),
    detail: (it?.detail ?? "").toString(),
  }));

  if (safeItems.length === 0) {
    throw new Error("전송할 요약 항목이 없습니다.");
  }

  const res = await uploadSttAbstractEdit({
    reportid: Number(reportId),
    items: safeItems,
  });

  if (!isServerOk(res)) {
    throw new Error(pickServerMsg(res) || "요약결과 전송에 실패했습니다.");
  }

  return {
    success: true,
    message: pickServerMsg(res) || "요약결과 수정 전송에 성공했습니다.",
    data: res?.data ?? null,
    raw: res,
  };
}

/** (Web) 최종 레포트 전송 */
export async function submitFinalReportWeb({ requestType }) {
  const reportId = useReportStore.getState().reportId;
  if (!reportId)
    throw new Error("reportId가 없습니다. 처음부터 다시 시작해 주세요.");

  const res = await insertGovResultList({
    reportid: Number(reportId),
    request_type: requestType || "정보공개청구",
    content: "민원처리", // 하드코딩
  });

  if (!res?.status) {
    throw new Error(pickServerMsg(res) || "최종 레포트 전송에 실패했습니다.");
  }

  return {
    success: true,
    message: pickServerMsg(res) || "최종 레포트 전송에 성공했습니다.",
    raw: res,
  };
}
