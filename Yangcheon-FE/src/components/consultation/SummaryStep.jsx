import * as S from "./ConsultationComponentStyles";
import Toggle from "./TogglePanel";

const SummaryStep = ({ onPrev, onNext, isTabletPublic, onToggleChange }) => {
  // 요약 요청 및 다음 단계 호출 (서비스 로직은 상위에서 처리)
  const handleSummarize = () => {
    onNext(); // 상위 컴포넌트에서 실제 API 호출 처리
  };

  return (
    <S.RightPanel>
      <S.StepHeader>
        <S.StepNavigation>
          <S.BackButton onClick={onPrev}>← 이전</S.BackButton>
          <S.StepTitle>정보공개청구_3. 요약 생성 및 수정</S.StepTitle>
        </S.StepNavigation>
      </S.StepHeader>
      <S.SummarySection>
        <S.SummaryHeader>
          <S.SummaryHeaderText>
            <S.SummaryTitle>요약 결과</S.SummaryTitle>
            <S.SummarySubtitle>
              요약 결과를 수정 할 수 있습니다.
            </S.SummarySubtitle>
          </S.SummaryHeaderText>
          <Toggle
            label="요약 결과 공개 여부"
            isOn={isTabletPublic}
            onToggle={onToggleChange}
          />
        </S.SummaryHeader>

        <S.SummaryBox>
          <S.SummaryMessage>
            '요약하기' 버튼을 누르면
            <br />
            요약 결과가 생성됩니다.
          </S.SummaryMessage>
        </S.SummaryBox>
        <S.SummaryButton onClick={handleSummarize}>요약하기</S.SummaryButton>
      </S.SummarySection>
    </S.RightPanel>
  );
};

export default SummaryStep;
