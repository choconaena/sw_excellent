// src/hooks/useSocketDisconnectNotice.jsx
import { useEffect, useState, useRef } from "react";
import { getSocket } from "../ws/socket";

export function useSocketDisconnectNotice({
  warnAfterMs = 0, // 모달 사용 안 함
  autoReloadAfterMs = 2000, // 2초 뒤 자동 새로고침
} = {}) {
  const [open, setOpen] = useState(false); // API 호환 유지 (실제 모달 미사용)
  const disconnectedAtRef = useRef(null);
  const autoReloadTimer = useRef(null);
  const warnTimer = useRef(null);

  useEffect(() => {
    const s = getSocket();

    const clearTimers = () => {
      clearTimeout(warnTimer.current);
      clearTimeout(autoReloadTimer.current);
      warnTimer.current = null;
      autoReloadTimer.current = null;
    };

    const startTimers = () => {
      clearTimers();
      // 모달 타이머는 유지하되 Prompt가 null이므로 UI는 뜨지 않음
      if (warnAfterMs > 0) {
        warnTimer.current = setTimeout(() => setOpen(true), warnAfterMs);
      }
      if (autoReloadAfterMs > 0) {
        autoReloadTimer.current = setTimeout(() => {
          window.location.reload();
        }, autoReloadAfterMs);
      }
    };

    const onConnect = () => {
      disconnectedAtRef.current = null;
      setOpen(false);
      clearTimers();
    };

    const onDisconnect = () => {
      disconnectedAtRef.current = Date.now();
      startTimers();
    };

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);

    // 현재 상태 반영
    if (!s.connected) onDisconnect();

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      clearTimers();
    };
  }, [warnAfterMs, autoReloadAfterMs]);

  const tryReconnect = () => {
    const s = getSocket();
    try {
      s.connect?.();
    } catch (e) {
      void e;
    }
  };

  function Prompt() {
    return null; // 🔕 모달 비활성화

    /*
    // ⛔ 아래 모달 UI는 비활성화(주석 처리)
    if (!open) return null;
    return (
      <div style={{ ... }}>
        <div style={{ ... }}>
          <h3 style={{ margin: "0 0 .5rem" }}>연결이 종료되었습니다</h3>
          <p style={{ margin: "0 0 1rem", color: "#555", lineHeight: 1.5 }}>
            페이지를 새로고침하면 다시 이용하실 수 있습니다.
            <br />
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button
              onClick={() => window.location.reload()}
              style={{ ... }}
            >
              새로고침
            </button>
          </div>
        </div>
      </div>
    );
    */
  }

  return { open, Prompt, tryReconnect };
}
