// src/api/endpoints.js
export const ENDPOINTS = {
  login: "/db/login",
  profile: "/db/users", // 토큰으로 프로필 조회 (권장)
  userById: "/db/users", // 사용자 ID로 프로필 조회

  // 정보 공개 청구
  uploadApplicant: "/db/yangchun_idcard_info_upload",
  uploadApplicantEdit: "/db/yangchun_idcard_info_upload_edit",
  sttInitiate: "/db/yangchun_stt_upload_policy",
  sttAbstract: "/db/yangchun_stt_abstract",
  sttAbstractEdit: "/db/yangchun_stt_abstract_edit",
  sttFinish: "/db/finish_stt_upload",
  receiveMethodChecklist: "/db/yangchun_receive_method_checklist",
  receiveMethodChecklistWeb: "/db/yangchun_receive_method_checklist_edit",
  uploadSign: "/db/uploadSign",
  feeExempt: "/db/yangchun_exempt",
  insertGovResultList: "/db/yangchun_insert_gov_ResultList",

  // 건설 기계
  license_info: "/db/yangchun_license_info_edit",
  uploadConstructionSign: "/db/uploadConstructionSign",

  // 업무 기록
  govResultList: "/db/yangchun_get_gov_ResultList",
  reportResultDownload: "/db/yangcheon_report_result_download",
};
