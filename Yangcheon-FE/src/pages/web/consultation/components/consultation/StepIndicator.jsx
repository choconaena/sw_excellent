import { useSearchParams } from "react-router-dom";
import * as S from "./StepIndicatorStyles";

const StepIndicator = () => {
  const [searchParams] = useSearchParams();
  const currentStep = Number.parseInt(searchParams.get("step")) || 1;
  const flow = searchParams.get("flow");

  if (flow !== "info-request") return null;

  const steps = [
    { number: 1, title: "신분증 요청" },
    { number: 2, title: "정보 입력" },
    { number: 3, title: "요약 단계" },
    { number: 4, title: "요약 생성" },
    { number: 5, title: "공개 방법" },
    { number: 6, title: "수수료" },
    { number: 7, title: "서명" },
  ];

  return (
    <S.Container>
      <S.StepList>
        {steps.map((step, index) => (
          <S.StepItem key={step.number}>
            <S.StepNumber
              $isActive={currentStep === step.number}
              $isCompleted={currentStep > step.number}
            >
              {currentStep > step.number ? "✓" : step.number}
            </S.StepNumber>
            <S.StepTitle $isActive={currentStep === step.number}>
              {step.title}
            </S.StepTitle>
            {index < steps.length - 1 && (
              <S.StepConnector $isCompleted={currentStep > step.number} />
            )}
          </S.StepItem>
        ))}
      </S.StepList>
    </S.Container>
  );
};

export default StepIndicator;
