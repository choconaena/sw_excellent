// src/views/web/consultation/CompletionScreen.jsx
import { useNavigate } from "react-router-dom";
import * as S from "./ComletionScreenStyles";
import MainLayout from "../../../layouts/MainLayout";
import { useReportStore } from "../../../store/useReportStore";
import { hasSttSession, stopSttSession } from "../../../utils/sttController";
import { useAuthStore } from "../../../store/authStore";
import { disconnectSocket, leaveRoom } from "../../../ws/socket";

const CompletionScreen = () => {
  const navigate = useNavigate();
  const userEmail = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );

  const handleGoHome = () => {
    try {
      // 1) STT 마이크/WS 완전 종료
      if (hasSttSession()) {
        console.log("[Completion] stop STT session");
        stopSttSession();
      }

      // 2) socket room 명시적 leave
      if (userEmail) {
        console.log("[Completion] leave room:", userEmail);
        leaveRoom(userEmail);
      }

      // 3) 필요하면 소켓 자체 연결도 종료(대화 전용이면 권장)
      disconnectSocket();

      // 4) report 메타 초기화(선택)
      try {
        const { clearReport } = useReportStore.getState?.() || {};
        clearReport?.();
      } catch (e) {
        void e;
      }
    } finally {
      navigate("/admin");
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <MainLayout>
      <S.Container>
        <S.Content>
          <S.SuccessIcon>
            <S.CheckMark>✓</S.CheckMark>
          </S.SuccessIcon>

          <S.CompletionMessage>모든 절차가 완료되었습니다.</S.CompletionMessage>

          <S.SummaryCard>
            <S.SummaryItem>
              <S.SummaryLabel>상담 일시</S.SummaryLabel>
              <S.SummaryValue>{getCurrentDateTime()}</S.SummaryValue>
            </S.SummaryItem>

            <S.SummaryItem>
              <S.SummaryLabel>상담 요약</S.SummaryLabel>
              <S.SummaryValue>[정보 공개 청구]</S.SummaryValue>
            </S.SummaryItem>
          </S.SummaryCard>

          <S.HomeButton onClick={handleGoHome}>홈으로 가기</S.HomeButton>
        </S.Content>
      </S.Container>
    </MainLayout>
  );
};

export default CompletionScreen;
