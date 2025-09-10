import { useEffect } from "react";
import MainLayout from "../../../layouts/MainLayout";
import { useConstructionEquipmentFlow } from "../../../hooks/useConstructionEquipmentFlow";
import IdentityRequestStep from "./IdentityRequestStep";
import ApplicationFormStep from "./ApplicationFormStep";
import IssuanceSignatureStep from "./IssuanceSignatureStep";
import ConsentSignatureStep from "./ConsentSignatureStep";
import CompletionScreen from "./CompletionScreen";
import * as S from "./style";

const ConstructionEquipmentConsultation = () => {
  const {
    currentStep,
    isCompleted,
    formData,
    handleNextStep,
    handleInputChange,
    handleComplete,
  } = useConstructionEquipmentFlow();

  // 완료 상태가 true가 되면 완료 화면으로 이동
  useEffect(() => {
    if (isCompleted) {
      // Note: This navigates to the CompletionScreen component within this flow,
      // not the global /consultation/complete.
      // The CompletionScreen component itself will handle navigation back to home.
    }
  }, [isCompleted]);

  const renderStepContent = () => {
    if (isCompleted) {
      return <CompletionScreen />;
    }

    switch (currentStep) {
      case 1:
        return <IdentityRequestStep onNext={handleNextStep} />;
      case 2:
        return (
          <ApplicationFormStep
            formData={formData}
            onInputChange={handleInputChange}
            onNext={handleNextStep}
          />
        );
      case 3:
        return <IssuanceSignatureStep onNext={handleNextStep} />;
      case 4:
        return <ConsentSignatureStep onNext={handleNextStep} />;
      case 5:
        return <CompletionScreen onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <S.MainContent>{renderStepContent()}</S.MainContent>
    </MainLayout>
  );
};

export default ConstructionEquipmentConsultation;
