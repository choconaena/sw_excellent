// src/api/consultation.js
import { http } from "./httpClient";
import { ENDPOINTS } from "./endpoints";

// APP
/**
 * 청구인 정보 업로드
 * @param {{ phone: string; email: string; fax?: string; businessNumber?: string }} payload
 */
export function uploadApplicant(payload) {
  return http(ENDPOINTS.uploadApplicant, {
    method: "POST",
    body: {
      phone: payload.phone ?? "",
      email: payload.email ?? "",
      fax: payload.fax ?? "",
      businessNumber: payload.businessNumber ?? "",
    },
  });
}

export function uploadApplicantEdit(payload) {
  // payload 예:
  // { reportid, name, birthDate, address, passport, phone, email, fax, businessNumber }
  return http(ENDPOINTS.uploadApplicantEdit, {
    method: "POST",
    body: payload,
  });
}

/** STT 요약 조회: GET /db/yangchun_stt_abstract/:id */
export function getSttAbstract(reportId) {
  return http(`${ENDPOINTS.sttAbstract}/${encodeURIComponent(reportId)}`, {
    method: "GET",
  });
}

/**
 * STT 요약 수정본 업로드 (Web)
 * @param {{ reportid: number, items: Array<{subject: string, abstract: string, detail: string}> }} payload
 */
export function uploadSttAbstractEdit(payload) {
  return http(ENDPOINTS.sttAbstractEdit, {
    method: "POST",
    body: payload,
  });
}

/** (App) 공개/수령 방법 체크리스트 업로드 */
export function uploadReceiveMethodChecklist(payload) {
  // payload 예:
  // { items: [ {view:0/1, copy:0/1, electronic:0/1, "copy-print":0/1, other:0/1},
  //            {direct:0/1, mail:0/1, fax:0/1, notification:0/1, email:0/1} ] }
  return http(ENDPOINTS.receiveMethodChecklist, {
    method: "POST",
    body: payload,
  });
}

/** (Web) 공개/수령 방법 체크리스트 업로드 */
export function uploadReceiveMethodChecklistWeb(payload) {
  return http(ENDPOINTS.receiveMethodChecklistWeb, {
    method: "POST",
    body: payload,
  });
}

export async function uploadSignImage({ reportId, blob }) {
  const form = new FormData();
  form.append("reportid", String(reportId));
  form.append(
    "imgfile",
    new File([blob], "signature.png", { type: "image/png" })
  );

  return http(ENDPOINTS.uploadSign, {
    method: "POST",
    body: form,
  });
}

// ✅ 수수료 감면 전송
export function uploadFeeExempt({ reportid, isexempt, content }) {
  return http(ENDPOINTS.feeExempt, {
    method: "POST",
    body: { reportid, isexempt, content },
  });
}

/** 최종 레포트 전송 */
export function insertGovResultList({
  reportid,
  request_type,
  content = "민원처리",
}) {
  return http(ENDPOINTS.insertGovResultList, {
    method: "POST",
    body: { reportid, request_type, content },
  });
}
