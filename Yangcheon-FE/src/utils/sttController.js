// src/utils/sttController.js
let STOPPER = null;

export function setSttStopper(fn) {
  STOPPER = fn; // null 또는 함수
}

export function stopSttSession() {
  if (!STOPPER) return;
  try {
    STOPPER(); // useSttSession이 넘겨준 stop 함수 실행
  } catch (e) {
    console.error("[STT] stop failed:", e);
  } finally {
    STOPPER = null;
  }
}

export function hasSttSession() {
  return typeof STOPPER === "function";
}
