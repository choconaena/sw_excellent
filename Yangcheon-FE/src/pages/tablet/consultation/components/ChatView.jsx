// ChatView.jsx
import { useEffect, useRef, useState } from "react";
import * as S from "../style";
import { useAuthStore } from "../../../../store/authStore";
import { useRoomBus } from "../../../../ws/useRoomBus";

const ChatView = ({ messages: initialMessages = [] }) => {
  const [messages, setMessages] = useState(initialMessages);
  const bottomRef = useRef(null);

  // room join
  const email = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = email ? String(email) : null;

  // ws 수신: chat 패킷만 채팅으로 반영
  useRoomBus(
    room,
    {
      onMessage: (p) => {
        const m = p?.msg || p; // 서버 포맷에 따라 보정
        const t = m?.msg_type ?? m?.type;
        const c = m?.content ?? {};

        if (t === "chat" && c?.text) {
          // 보낸이가 tablet이면(혹은 자기 자신이면) 무시하고 싶으면 from 체크
          if (c.from === "app") return;

          setMessages((prev) => [
            ...prev,
            { content: c.text, isUser: !!c.isUser },
          ]);
        }
      },
    },
    { tag: "chat-tablet", persistJoin: true }
  );

  // 외부에서 초기 메시지 바뀌면 동기화(선택)
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  return (
    <S.ChatScreen>
      <S.ChatHeader>
        <S.ChatTitle>실시간 상담</S.ChatTitle>
      </S.ChatHeader>

      <S.ChatMessages>
        {messages.length === 0 ? (
          <S.Message $isUser={false}>
            반갑습니다. 무슨 일로 오셨을까요?
          </S.Message>
        ) : (
          messages.map((m, i) => (
            <S.Message key={i} $isUser={m.isUser}>
              {m.content}
            </S.Message>
          ))
        )}
        <div ref={bottomRef} />
      </S.ChatMessages>
    </S.ChatScreen>
  );
};

export default ChatView;
