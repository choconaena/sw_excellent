// src/utils/errorMap.js
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "네트워크 연결을 확인해주세요.",
  AUTH_FAILED: "로그인에 실패했습니다.",
  TOKEN_EXPIRED: "세션이 만료되었습니다. 다시 로그인해주세요.",
  STT_INIT_FAILED: "음성 인식 초기화에 실패했습니다.",
  WEBSOCKET_ERROR: "실시간 연결에 문제가 발생했습니다.",
};

export function getErrorMessage(error) {
  if (error.message?.includes("401")) return ERROR_MESSAGES.TOKEN_EXPIRED;
  if (error.message?.includes("network")) return ERROR_MESSAGES.NETWORK_ERROR;
  return error.message || "알 수 없는 오류가 발생했습니다.";
}
