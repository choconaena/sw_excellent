// src/components/consultation/IdentityRequest.jsx
import * as S from "./ConsultationComponentStyles";
import { useEffect, useState } from "react";

import styled from "styled-components";
import { useAuthStore } from "../../../../../store/authStore";
import { useRoomChannel } from "../../../../../ws/useRoomChannel";
import { useRoomBus } from "../../../../../ws/useRoomBus";

// --- 안내 배너 UI (동일) ---
const InfoBanner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 18px;
  border: 1px solid #e9eef5;
  border-radius: 14px;
  background: #fff1f2;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02) inset;
`;
const BannerStep = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  line-height: 1.6;
  color: #2a2f38;
  font-size: 1rem;
  b {
    font-weight: 700;
  }
`;
const StepNumber = styled.span`
  flex-shrink: 0;
  font-weight: 700;
  color: #a93946;
`;
const Pill = styled.span`
  align-self: flex-end;
  margin-top: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  color: ${(p) => (p.$ok ? "#0f7a3b" : "#7a5b00")};
  background: ${(p) => (p.$ok ? "#e7fff0" : "#fff7df")};
  border: 1px solid ${(p) => (p.$ok ? "#bff0d2" : "#ffe9b6")};
`;
const ArrowDown = styled.div`
  text-align: center;
  font-size: 2rem;
  color: #a93946;
  margin: 1rem 0 1rem;
`;

function normalize(p) {
  let m = p?.msg;
  if (typeof m === "string") {
    try {
      m = JSON.parse(m);
    } catch {
      m = { msg_type: "text", content: { text: p.msg } };
    }
  }
  if (!m && (p?.msg_type || p?.content))
    m = { msg_type: p.msg_type, content: p.content };
  return m && typeof m === "object" ? m : null;
}

const IdentityRequest = ({
  onNext,
  onPrev,
  sendToRoom,
  dst = "/tablet/consultation?view=form&step=applicant",
}) => {
  const [nextEnabled, setNextEnabled] = useState(false);

  const email = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = email ? String(email) : "kiosk";

  // 1) 웹 채널 join 유지
  useRoomChannel(room, "web", {}, { persistJoin: true });

  // 2) 송신 전용 버스 (태그 자유)
  const { send } = useRoomBus(room, {}, { tag: "web-identity-send" });

  // 3) 수신 전용 버스: tapAll 로 전체 메시지 탭 + 안정적으로 구독 등록
  useRoomBus(
    room,
    {
      onMessage: (packet) => {
        const m = normalize(packet);
        const t = m?.msg_type ?? m?.type;
        // 태블릿에서 완료 신호
        if (t === "consentsign_done" || t === "sign_done") {
          setNextEnabled(true);
        }
        // 상태 응답(뒤늦게 들어온 경우 복구)
        if (t === "consentsign_status" && m?.content?.submitted === true) {
          setNextEnabled(true);
        }
      },
    },
    { tag: "web-identity-recv", tapAll: true }
  );

  // 4) 웹이 늦게 켜졌을 때 현재 상태 요청
  useEffect(() => {
    send?.({ msg: { msg_type: "consentsign_status_req", content: null } });
  }, [send]);

  const handleNext = () => {
    if (!nextEnabled) return;
    try {
      // 태블릿도 함께 이동시키고 싶을 때
      (sendToRoom ?? send)?.({
        msg: { msg_type: "page_move", content: { dst } },
      });
      console.log("[web] page_move ->", dst);
    } catch (e) {
      console.warn("[web] page_move 전송 실패:", e);
    } finally {
      onNext?.();
    }
  };

  return (
    <S.RightPanel>
      <S.StepHeader>
        <S.StepNavigation>
          <S.BackButton onClick={onPrev}>← 이전</S.BackButton>
          <S.StepTitle>정보공개청구_1. 신분증 요청</S.StepTitle>
        </S.StepNavigation>
      </S.StepHeader>

      <S.StepContent>
        <InfoBanner>
          <div>
            <b>1.</b> 테블릿에{" "}
            <b>「개인정보 수집·이용 및 제3자 제공 동의서」</b>가 표시됩니다.
          </div>
          <div>
            <b>2.</b> 민원인이 <b>[모두 동의]</b>를 누르면 <b>전자서명 화면</b>
            으로 전환됩니다.
          </div>
          <div>
            <b>3.</b> <b>서명이 완료되면</b> 이 화면의 <b>[다음]</b> 버튼이 자동
            활성화됩니다.
          </div>
          <Pill $ok={nextEnabled}>
            {nextEnabled ? "서명 완료" : "서명 대기"}
          </Pill>
        </InfoBanner>

        <div
          style={{
            textAlign: "center",
            fontSize: "2rem",
            color: "#a93946",
            margin: "1rem 0",
          }}
        >
          ▼
        </div>

        <div style={{ marginBottom: 16 }}>
          <S.RequestMessage>민원인께 신분증을 요청해주세요!</S.RequestMessage>
        </div>

        <S.NextButton onClick={handleNext} disabled={!nextEnabled}>
          {nextEnabled ? "다음" : "서명 대기 중…"}
        </S.NextButton>
      </S.StepContent>
    </S.RightPanel>
  );
};

export default IdentityRequest;
