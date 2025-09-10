// src/ws/parseWs.js
function normalizeMsgPacket(p) {
  let m = p?.msg;
  if (typeof m === "string") {
    try {
      m = JSON.parse(m);
    } catch {
      m = { msg_type: "text", content: { text: m } };
    }
  }
  if (!m && (p?.msg_type || p?.content)) {
    m = { msg_type: p.msg_type, content: p.content };
  }
  return m && typeof m === "object" ? m : null;
}

// A) 폼 패치 추출(그대로 사용)
export function extractDataPayload(p) {
  if (p?.msg_type === "data" && p?.content && typeof p.content === "object") {
    return p.content.content ?? p.content;
  }
  if (p?.msg) {
    let m = p.msg;
    if (typeof m === "string") {
      try {
        m = JSON.parse(m);
      } catch (e) {
        void e;
      }
    }
    if (m && typeof m === "object") {
      if (m.msg_type === "data" && m.content && typeof m.content === "object") {
        return m.content.content ?? m.content;
      }
      if (m.type === "data" && m.payload && typeof m.payload === "object") {
        return m.payload;
      }
    }
  }
  return null;
}

// B) 채팅 텍스트만 추출(시스템/로그/이벤트는 숨김)
export function extractChatText(p) {
  // 0) data류는 채팅 제외
  const data = extractDataPayload(p);
  if (data) return null;

  // 1) msg 정규화
  const m = normalizeMsgPacket(p);
  if (!m) {
    // 과거 포맷: top-level 문자열만 채팅으로 허용
    if (typeof p?.msg === "string") return p.msg.trim();
    return null;
  }

  // 2) 시스템/로그/네비게이션 컷
  const t = m.msg_type ?? m.type;
  if (t === "log" || t === "page_move" || t === "data") return null;
  if (m?.content && typeof m.content === "object" && "dst" in m.content)
    return null; // page_move 휴리스틱

  // 3) 채팅으로 인정할 최소 요건만 통과
  if (typeof m.content === "string") return m.content.trim();
  if (m.content && typeof m.content.text === "string")
    return m.content.text.trim();

  // 4) 과거 포맷: top-level 순수 문자열도 허용
  if (typeof p?.msg === "string") return p.msg.trim();

  return null;
}
