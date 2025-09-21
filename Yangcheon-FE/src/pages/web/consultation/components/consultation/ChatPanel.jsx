import { useEffect, useRef, useLayoutEffect, useState } from "react";
import * as S from "./ConsultationComponentStyles";
import Toggle from "./TogglePanel";

const ChatPanel = ({ messages, isTabletPublic, onToggleChange }) => {
  const chatListRef = useRef(null);
  const headerRef = useRef(null);
  const [headerH, setHeaderH] = useState(0);

  useLayoutEffect(() => {
    if (!headerRef.current) return;
    const update = () =>
      setHeaderH(headerRef.current.getBoundingClientRect().height);

    update();
    const ro = new ResizeObserver(update);
    ro.observe(headerRef.current);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const el = chatListRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages?.length]);

  return (
    // CSS 변수 --chat-header-h 로 헤더 높이 전달
    <S.ChatSection style={{ "--chat-header-h": `${headerH}px` }}>
      <S.ChatHeader ref={headerRef}>
        <S.ChatTitle>실시간 민원 상담</S.ChatTitle>
        <Toggle
          label="태블릿 공개 여부"
          isOn={isTabletPublic}
          onToggle={onToggleChange}
        />
      </S.ChatHeader>

      <S.ChatMessages ref={chatListRef}>
        {messages.map((m) => (
          <S.Message key={m.id} $isUser={m.isUser}>
            {m.content}
          </S.Message>
        ))}
      </S.ChatMessages>
    </S.ChatSection>
  );
};

export default ChatPanel;
