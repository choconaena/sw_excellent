// src/hooks/useWebSocket.js
import { useEffect, useRef } from "react";
import { createWebSocketClient } from "../ws/client";

export function useWebSocket({
  onMessage,
  onOpen,
  onClose,
  onError,
  deps = [],
}) {
  const clientRef = useRef(null);

  useEffect(() => {
    clientRef.current = createWebSocketClient({
      onOpen,
      onMessage,
      onError,
      onClose,
    });
    return () => clientRef.current?.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return clientRef;
}
