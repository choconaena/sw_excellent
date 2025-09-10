// src/ws/realtimeState.js
import { hasSttSession } from "../utils/sttController";
import { getSocket } from "../ws/socket";

export function isRealtimeActive() {
  const s = getSocket?.();
  return hasSttSession() || !!(s && s.connected);
}
