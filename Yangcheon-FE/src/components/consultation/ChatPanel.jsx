import { useEffect, useRef } from "react";
import * as S from "./ConsultationComponentStyles";
import Toggle from "./TogglePanel";

const ChatPanel = ({ messages, isTabletPublic, onToggleChange }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    // 새 메시지가 추가될 때 부드럽게 스크롤
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages?.length]);

  return (
    <S.ChatSection>
      <S.ChatHeader>
        <S.ChatTitle>실시간 민원 상담</S.ChatTitle>
        <Toggle
          label="태블릿 공개 여부"
          isOn={isTabletPublic}
          onToggle={onToggleChange}
        />
      </S.ChatHeader>

      {/* 추가: 스크롤 가능한 영역 보장 (스타일 파일에서 overflow-y:auto 권장) */}
      <S.ChatMessages>
        {messages.map((message) => (
          <S.Message key={message.id} $isUser={message.isUser}>
            {message.content}
          </S.Message>
        ))}
        {/* 맨 아래 앵커 */}
        <div ref={bottomRef} />
      </S.ChatMessages>
    </S.ChatSection>
  );
};

export default ChatPanel;
