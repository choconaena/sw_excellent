// src/ws/client.js
import { WS_BASE_URL } from "../config/env";

export function createWebSocketClient({
  url = WS_BASE_URL,
  onOpen,
  onMessage,
  onError,
  onClose,
  protocols,
}) {
  let ws;
  let heartbeatTimer;
  let closedByUser = false;

  const connect = () => {
    console.log("connect! ws");
    ws = new WebSocket(url, protocols);

    ws.onopen = (e) => {
      onOpen?.(e, ws);
    };

    ws.onmessage = (e) => onMessage?.(e);

    ws.onerror = (e) => onError?.(e);

    ws.onclose = (e) => {
      onClose?.(e);
    };
  };

  connect();

  return {
    send: (data) => {
      if (ws?.readyState === WebSocket.OPEN) ws.send(data);
    },
    close: () => {
      closedByUser = true;
      clearInterval(heartbeatTimer);
      ws?.close();
    },
    get instance() {
      return ws;
    },
  };
}
