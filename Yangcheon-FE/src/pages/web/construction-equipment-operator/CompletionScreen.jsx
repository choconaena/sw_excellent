import { useNavigate } from "react-router-dom";
import * as S from "./style";

const CompletionScreen = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/admin");
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
    <S.Container>
      <S.Header>
        <S.Title>건설기계조종사면허증_5. 완료</S.Title>
      </S.Header>
      <S.CompletionContent>
        <S.SuccessIcon>
          <S.CheckMark>✓</S.CheckMark>
        </S.SuccessIcon>

        <S.CompletionMessage>모든 절차가 완료되었습니다.</S.CompletionMessage>

        <S.SummaryCard>
          <S.SummaryItem>
            <S.SummaryLabel>신청일시</S.SummaryLabel>
            <S.SummaryValue>{getCurrentDateTime()}</S.SummaryValue>
          </S.SummaryItem>

          <S.SummaryItem>
            <S.SummaryLabel>신청 내용</S.SummaryLabel>
            <S.SummaryValue>[건설기계조종사면허증 발급 신청]</S.SummaryValue>
          </S.SummaryItem>
        </S.SummaryCard>

        <S.HomeButton onClick={handleGoHome}>홈으로 가기</S.HomeButton>
      </S.CompletionContent>
    </S.Container>
  );
};

export default CompletionScreen;
