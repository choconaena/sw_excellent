// src/ws/socket.js
import { io } from "socket.io-client";

// page_move, data
const WS_SERVER =
  import.meta.env.VITE_WS_SERVER || "https://yangcheon.ai.kr:28087";

let socket = null;
let listenersBound = false;

function bindCoreListeners(s) {
  if (listenersBound || !s) return;
  listenersBound = true;

  s.on("connect", () => {
    console.log("🔌 socket connected:", s.id);
  });

  s.on("disconnect", (reason) => {
    console.warn("❎ socket disconnected:", reason);
    // 서버가 명시적으로 끊은 경우는 자동재시도 안 되는 케이스 → 수동 재시작
    if (reason === "io server disconnect") {
      try {
        s.connect();
      } catch (e) {
        console.error(e);
      }
    }
  });

  s.on("connect_error", (e) => {
    console.log("🟥 socket connect_error:", e?.message || e);
  });

  // (선택) 재연결 이벤트 디버깅
  s.io?.on?.("reconnect_attempt", (n) =>
    console.log("🔁 reconnect attempt", n)
  );
  s.io?.on?.("reconnect", (n) => console.log("✅ reconnected", n));
  s.io?.on?.("reconnect_error", (e) =>
    console.log("🟥 reconnect error:", e?.message || e)
  );
}

export function getSocket() {
  if (!socket) {
    const token = localStorage.getItem("jwtToken") || undefined;
    socket = io(WS_SERVER, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
      randomizationFactor: 0.5,
      auth: token ? { token } : undefined,
    });
    bindCoreListeners(socket);
  }
  return socket;
}

// 기존 호출부 영향 없이 동일 인스턴스만 돌려주도록 변경
export function ensureSocket() {
  return getSocket();
}

export function connectIfNeeded() {
  const s = getSocket();
  if (!s.connected) s.connect();
}

export const leaveRoom = (room) => {
  const s = getSocket();
  if (s?.connected && room) s.emit("room:leave", { room });
};

export const disconnectSocket = () => {
  if (!socket) return;
  try {
    socket.removeAllListeners?.();
  } catch (e) {
    void e;
  }
  try {
    socket.disconnect?.();
  } catch (e) {
    void e;
  }
  socket = null;
  listenersBound = false;
};
