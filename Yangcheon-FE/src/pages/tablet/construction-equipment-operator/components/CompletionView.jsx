import { useNavigate } from "react-router-dom";
import * as S from "../style";
import { useEffect, useState } from "react";

const CompletionView = () => {
  const navigate = useNavigate();
  const [leftSec, setLeftSec] = useState(10); // 카운트다운 표시용(선택)

  useEffect(() => {
    const to = setTimeout(() => navigate("/tablet"), 10_000);
    const iv = setInterval(() => {
      setLeftSec((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => {
      clearTimeout(to);
      clearInterval(iv);
    };
  }, [navigate]);
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
    <S.CompletionScreen>
      <S.SuccessIcon>
        <S.CheckMark>✓</S.CheckMark>
      </S.SuccessIcon>

      <S.CompletionMessage>모든 절차가 완료되었습니다.</S.CompletionMessage>

      <S.CompletionCard>
        <S.CompletionItem>
          <S.CompletionLabel>상담 일시</S.CompletionLabel>
          <S.CompletionValue>{getCurrentDateTime()}</S.CompletionValue>
        </S.CompletionItem>

        <S.CompletionItem>
          <S.CompletionLabel>상담 요약</S.CompletionLabel>
          <S.CompletionValue>
            [건설기계조종사면허증 발급 신청]
          </S.CompletionValue>
        </S.CompletionItem>
      </S.CompletionCard>
      {/* 카운트다운 안내(원치 않으면 이 블록 삭제) */}
      <div style={{ marginTop: 16, color: "#666", fontSize: "0.95rem" }}>
        {leftSec}초 후 시작 화면으로 이동합니다.
      </div>
    </S.CompletionScreen>
  );
};

export default CompletionView;
