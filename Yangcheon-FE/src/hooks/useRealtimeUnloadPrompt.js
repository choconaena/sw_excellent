// src/hooks/useRealtimeUnloadPrompt.js
import { useEffect } from "react";
import { isRealtimeActive } from "../ws/realtimeState";

/**
 * 새로고침/창 닫기 시 경고 — 실시간 연결이 있을 때만 동작
 * 브라우저 정책상 커스텀 문구는 표시되지 않을 수 있음(기본 경고 UI 노출)
 */
export function useRealtimeUnloadPrompt(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const onBeforeUnload = (e) => {
      if (!isRealtimeActive()) return;
      e.preventDefault();
      e.returnValue = ""; // 크롬 등은 이 값이 있어야 기본 confirm 뜸
      return "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [enabled]);
}
