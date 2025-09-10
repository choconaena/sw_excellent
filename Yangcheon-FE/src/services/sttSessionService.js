// src/services/sttSessionService.js
import { createWebSocketClient } from "../ws/client";
import { createSttChannel } from "../ws/channels/sttChannel";
import { initiateSTTupload /*, finishSTTupload*/ } from "../api/stt";
import { useReportStore } from "../store/useReportStore"; // ✅ 추가
import { setSttStopper } from "../utils/sttController";

export async function startSttSession({ email, onText }) {
  const res = await initiateSTTupload(email);

  // 서버 반환 형태 가정: { status: true/false, reportid: number, msg: string }
  if (!res?.status) throw new Error(res?.msg || "STT 준비 실패");

  const { reportid, status, msg } = res;

  // ✅ 여기서 전역 상태에 저장 (다음 단계/다른 페이지에서 사용)
  useReportStore.getState().setReportMeta({
    reportId: reportid,
    status,
    msg,
  });

  const client = createWebSocketClient({
    onError: (e) => console.error("WS error", e),
    onClose: () => console.log("WS closed"),
  });

  const unbind = createSttChannel(client, { reportid, email, onText });

  const stop = async () => {
    // finishSTTupload(reportid) 호출은 필요 시 복구
    unbind();
    client.close();
  };
  setSttStopper(stop); // ✅ 전역 STT 종료 함수 등록
  return { stop, reportid };
}
