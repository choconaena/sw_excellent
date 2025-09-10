// src/ws/useRoomBus.js
import { useEffect, useRef, useCallback } from "react";
import { getSocket } from "./socket";

let SUB_ID_SEQ = 0;

/**
 * 메시지 버스 훅
 * options:
 *  - verbose: 콘솔 로그
 *  - tag: 로그 태그
 *  - tapAll: 룸 불일치여도 원시 패킷을 항상 찍기
 *  - allowNoRoom: room이 비어있을 때 필터를 적용하지 않음
 *  - parse: (p) => any  // 파싱 함수(extractDataPayload) 넘기면 parsed까지 찍어줌
 */
export function useRoomBus(room, { onMessage } = {}, options = {}) {
  const {
    verbose = true,
    tag = "bus",
    tapAll = false,
    allowNoRoom = false,
    parse, // 예: extractDataPayload
  } = options;

  const s = getSocket();
  const roomRef = useRef(room);
  const onMsgRef = useRef(onMessage);
  const subIdRef = useRef(++SUB_ID_SEQ);

  useEffect(() => {
    roomRef.current = room;
  }, [room]);
  useEffect(() => {
    onMsgRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    const handleMsg = (p) => {
      // 0) 항상 탭(필요 시)
      if (tapAll && verbose) {
        console.groupCollapsed(
          `%c[WS][${tag}#${subIdRef.current}] TAP <- ${
            p?.room ?? "(no room)"
          } ${new Date().toLocaleTimeString()}`,
          "color:#6f42c1"
        );
        console.log("raw:", p);
        if (parse) {
          try {
            console.log("parsed:", parse(p));
          } catch (e) {
            console.log("parse error:", e);
          }
        }
        console.groupEnd();
      }

      // 1) 룸 필터 (room이 정해졌을 때만 엄격히 비교)
      const cur = roomRef.current;
      if ((!allowNoRoom || cur) && p?.room && String(p.room) !== String(cur)) {
        if (verbose) {
          console.log(
            `[WS][${tag}#${subIdRef.current}] ignore (other room) cur=`,
            cur,
            " incoming=",
            p.room
          );
        }
        return;
      }

      // 2) 정상 수신 로그
      if (verbose) {
        console.groupCollapsed(
          `%c[WS][${tag}#${subIdRef.current}] RECV <- ${
            p?.room ?? "(no room)"
          } ${new Date().toLocaleTimeString()}`,
          "color:#1f6feb"
        );
        console.log("raw:", p);
        if (parse) {
          try {
            console.log("parsed:", parse(p));
          } catch (e) {
            console.log("parse error:", e);
          }
        }
        console.groupEnd();
      }

      // 3) 핸들러 호출
      onMsgRef.current?.(p);
    };

    if (verbose) {
      console.log(
        `[WS][${tag}#${subIdRef.current}] mount (room=${roomRef.current}) socket.id=${s.id}`
      );
    }
    s.on("room:message", handleMsg);

    return () => {
      s.off("room:message", handleMsg);
      if (verbose) console.log(`[WS][${tag}#${subIdRef.current}] unmount`);
    };
  }, [s, verbose, tag, tapAll, allowNoRoom, parse]);

  const send = useCallback(
    (payload) => {
      const r = roomRef.current;
      if (!r) {
        if (verbose) {
          console.warn(
            `[WS][${tag}#${subIdRef.current}] send blocked: no room`,
            payload
          );
        }
        return;
      }
      const data =
        typeof payload === "string"
          ? { room: r, msg: payload }
          : { room: r, ...payload };
      if (verbose) {
        console.groupCollapsed(
          `%c[WS][${tag}#${
            subIdRef.current
          }] SEND -> ${r} ${new Date().toLocaleTimeString()}`,
          "color:#9a6700"
        );
        console.log("outgoing:", data);
        console.groupEnd();
      }
      s.emit("room:message", data);
    },
    [s, verbose, tag]
  );

  if (verbose && typeof window !== "undefined") {
    window.__wsSend = send;
    window.__socket = s;
  }

  return { send };
}
