// src/ws/teardown.js
import { stopSttSession } from "../utils/sttController";
import { useAuthStore } from "../store/authStore";
import { getSocket } from "./socket";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 웹: STT 종료 + 룸 leave + 소켓 disconnect
 * 태블릿: stop_all 메시지 보내서 /tablet 이동 + 소켓 정리 트리거
 */
export async function stopRealtimeEverywhere() {
  // 1) STT(마이크/인식) 중지
  try {
    stopSttSession();
  } catch (e) {
    console.warn(e);
  }

  // 2) WS 처리
  const sock = getSocket?.();
  const u = useAuthStore.getState().user;
  const email = u?.email ?? u?.user_email ?? u?.mail ?? null;
  const room = email ? String(email) : null;

  try {
    // (1) 태블릿에 종료 지시
    if (sock && room && sock.connected) {
      sock.emit("room:message", {
        room,
        // 태블릿 훅에서 처리할 패킷
        msg: { msg_type: "stop_all", content: { goto: "/tablet" } },
      });
      // (2) 방 나가기
      sock.emit("room:leave", { room });
      // (3) flush 잠깐 대기 후 물리 연결 종료
      await sleep(150);
      if (typeof sock.disconnect === "function") sock.disconnect();
      else if (typeof sock.close === "function") sock.close();
    } else if (sock) {
      // 연결돼있지 않더라도 혹시 모를 잔여 연결 종료
      if (typeof sock.disconnect === "function") sock.disconnect();
      else if (typeof sock.close === "function") sock.close();
    }
  } catch (e) {
    console.warn("[WS teardown] error:", e);
    try {
      if (sock?.disconnect) sock.disconnect();
      else if (sock?.close) sock.close();
    } catch (e) {
      void e;
    }
  }
}
