// src/ws/useRoomChannel.js
import { useEffect, useRef, useCallback, useMemo } from "react";
import { getSocket, connectIfNeeded } from "./socket";

export function useRoomChannel(room, nickname, handlers = {}, options = {}) {
  const { persistJoin = true } = options;
  const s = getSocket();

  const joinedRef = useRef(false);
  const roomRef = useRef(room || null);
  const nickRef = useRef(nickname);

  // 최신값 유지
  useEffect(() => {
    roomRef.current = room || null;
  }, [room]);
  useEffect(() => {
    nickRef.current = nickname;
  }, [nickname]);

  // 핸들러는 ref로
  const onMessageRef = useRef(handlers.onMessage);
  useEffect(() => {
    onMessageRef.current = handlers.onMessage;
  }, [handlers.onMessage]);

  // 리스너는 최초 한 번
  useEffect(() => {
    const onJoined = (p) => {
      joinedRef.current = true;
      console.log("✅ [room:joined]", p);
    };
    const onMessage = (p) => onMessageRef.current?.(p);

    s.on("room:joined", onJoined);
    s.on("room:message", onMessage);

    return () => {
      s.off("room:joined", onJoined);
      s.off("room:message", onMessage);
      if (!persistJoin && joinedRef.current && roomRef.current) {
        s.emit("room:leave", { room: roomRef.current });
        joinedRef.current = false;
      }
    };
  }, [s, persistJoin]);

  // 연결 & 최초 join
  useEffect(() => {
    connectIfNeeded();
    const tryJoin = () => {
      if (!roomRef.current || joinedRef.current) return;
      s.emit("room:join", { room: roomRef.current, nickname: nickRef.current });
    };
    if (s.connected) tryJoin();
    else {
      const once = () => tryJoin();
      s.once("connect", once);
      return () => s.off("connect", once);
    }
  }, [s, room, nickname]);

  // ✅ send는 ref를 읽는 stable 함수
  const send = useCallback(
    (msg) => {
      const r = roomRef.current;
      if (!r) return;
      const payload =
        typeof msg === "string" ? { room: r, msg } : { room: r, ...msg };
      s.emit("room:message", payload);
    },
    [s]
  );

  return useMemo(() => ({ send }), [send]);
}
