// wsHub.js
import { EventEmitter } from "node:events";
import { connectWebSocketClient } from "./socket_client.js";

// reportid => { socket, emitter }
const wsRegistry = new Map();

/**
 * ensureWs(reportid, serverUrl, nickname):
 * - 이미 연결되어 있으면 그대로 반환
 * - 없으면 새로 connect 하고 이벤트 파이프 구성
 */
export function ensureWs(reportid, serverUrl, nickname) {
  if (wsRegistry.has(reportid)) return wsRegistry.get(reportid);

  const emitter = new EventEmitter();
  const socket = connectWebSocketClient(serverUrl, String(reportid), nickname);

  // 외부 WS에서 들어오는 이벤트를 emitter로 팬아웃
  socket.on("room:message", (payload) => {
    emitter.emit("message", payload);
  });
  socket.on("room:user-joined", (payload) => {
    emitter.emit("user-joined", payload);
  });
  socket.on("room:user-left", (payload) => {
    emitter.emit("user-left", payload);
  });
  socket.on("disconnect", (reason) => {
    emitter.emit("disconnect", { reason });
  });

  const entry = { socket, emitter };
  wsRegistry.set(reportid, entry);

  // 소켓이 영구종료되면 레지스트리 정리
  socket.on("disconnect", () => {
    // 필요 시 재연결 로직을 넣을 수도 있음
    // 여기서는 단순 정리
    // wsRegistry.delete(reportid);
  });

  return entry;
}

/** 읽기용: emitter 가져오기 */
export function getEmitter(reportid) {
  return wsRegistry.get(reportid)?.emitter || null;
}

/** 소켓 직접 접근 */
export function getSocket(reportid) {
  return wsRegistry.get(reportid)?.socket || null;
}

/** 정리 */
export function dispose(reportid) {
  const ent = wsRegistry.get(reportid);
  if (!ent) return;
  try { ent.socket.disconnect(); } catch {}
  wsRegistry.delete(reportid);
}
