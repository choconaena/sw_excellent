// src/ws/reliable/useReliableRoomBus.js
import { useEffect, useMemo, useRef } from "react";
import { useRoomBus } from "../useRoomBus";

/**
 * 신뢰 채널 래퍼 훅
 * - 전역 단조 증가 seq (web 송신자)
 * - ACK/RESYNC
 * - 미ACK 재전송
 * - tablet 측은 순서/중복 제어 및 갭 감지
 *
 * @param {string|null} room
 * @param {"web"|"tablet"} who
 * @param {(ev: {seq:number, ts:number, type:string, payload:any, source:string}) => void} onApply
 */
export function useReliableRoomBus(room, who, onApply) {
  const storageKeySeq = room ? `room:${room}:nextSeq` : null;
  const storageKeyLastApplied = room ? `room:${room}:lastApplied` : null;

  // nextSeq (web 송신자만 사용)
  const nextSeqRef = useRef(null);
  if (nextSeqRef.current === null) {
    if (who === "web") {
      const s = storageKeySeq ? Number(localStorage.getItem(storageKeySeq) || "1") : 1;
      nextSeqRef.current = Number.isFinite(s) && s > 0 ? s : 1;
    } else {
      nextSeqRef.current = -1; // tablet은 seq 증가 안 함
    }
  }

  // 미ACK 큐(메모리)
  const outboundQueueRef = useRef(new Map());

  // tablet 수신자: 마지막 적용 seq
  const lastAppliedRef = useRef(null);
  if (lastAppliedRef.current === null) {
    const s = storageKeyLastApplied ? Number(localStorage.getItem(storageKeyLastApplied) || "0") : 0;
    lastAppliedRef.current = Number.isFinite(s) && s >= 0 ? s : 0;
  }

  const { send, connectionState } = useRoomBus(room, {
    onMessage: (raw) => {
      // 1) ACK
      if (raw?.msg_type === "ack" && typeof raw?.content?.seq === "number") {
        outboundQueueRef.current.delete(raw.content.seq);
        return;
      }

      // 2) RESYNC 요청
      if (raw?.msg_type === "resync" && typeof raw?.content?.fromSeq === "number") {
        const from = raw.content.fromSeq;
        for (const [seq, ev] of outboundQueueRef.current) {
          if (seq > from) send({ msg: ev });
        }
        return;
      }

      // 3) bus_event 수신
      const ev = normalizeEvent(raw);
      if (!ev) return;

      // tablet 측: 순서 적용
      const expected = lastAppliedRef.current + 1;
      if (ev.seq === expected) {
        onApply && onApply(ev);
        lastAppliedRef.current = ev.seq;
        if (storageKeyLastApplied) localStorage.setItem(storageKeyLastApplied, String(ev.seq));
        send({ msg: { msg_type: "ack", content: { seq: ev.seq } } });
      } else if (ev.seq <= lastAppliedRef.current) {
        // 중복
        send({ msg: { msg_type: "ack", content: { seq: ev.seq } } });
      } else {
        // 갭
        send({ msg: { msg_type: "resync", content: { fromSeq: lastAppliedRef.current } } });
      }
    },
  });

  // 재전송 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      if (connectionState !== "open") return;
      for (const [, ev] of outboundQueueRef.current) send({ msg: ev });
    }, 1500);
    return () => clearInterval(timer);
  }, [connectionState, send]);

  /** 신뢰 송신 */
  const reliableSend = (type, payload) => {
    if (!room) return;
    let seq = -1;

    if (who === "web") {
      seq = nextSeqRef.current++;
      if (storageKeySeq) localStorage.setItem(storageKeySeq, String(nextSeqRef.current));
    }

    const ev = {
      msg_type: "bus_event",
      content: {
        seq,                      // web은 증가, tablet은 -1
        ts: Date.now(),
        type,
        payload,
        ackId: `${seq}-${Math.random().toString(36).slice(2, 8)}`,
        source: who,
      },
    };

    if (who === "web") outboundQueueRef.current.set(seq, ev);
    send({ msg: ev });
  };

  return useMemo(
    () => ({
      reliableSend,
      lastAppliedSeq: lastAppliedRef.current,
    }),
    []
  );
}

function normalizeEvent(raw) {
  if (raw?.msg_type === "bus_event" && raw?.content) return raw.content;
  const c = raw?.content ?? raw?.msg ?? raw;
  if (c && typeof c.seq === "number" && c.type) return c;
  return null;
}
