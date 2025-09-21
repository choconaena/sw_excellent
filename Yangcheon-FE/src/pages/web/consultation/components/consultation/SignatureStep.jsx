// src/components/consultation/SignatureStep.jsx
import { useState } from "react";
import * as S from "./ConsultationComponentStyles";
import ConfirmationModal from "../../../../../components/modal/ConfirmationModal";
import LoadingModal from "../../../../../components/modal/LoadingModal";

const SignatureStep = ({ onComplete, onPrev, canComplete = false }) => {
  const [showModal, setShowModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);

  const handleCompleteClick = () => {
    if (!canComplete) return; // 안전망
    setShowModal(true);
  };

  const handleConfirm = () => {
    setShowModal(false);
    setShowLoadingModal(true);

    onComplete();
  };

  return (
    <S.RightPanel>
      <S.StepHeader>
        <S.StepNavigation>
          <S.BackButton onClick={onPrev}>← 이전</S.BackButton>
          <S.StepTitle>정보공개청구_6. 청구인 서명</S.StepTitle>
        </S.StepNavigation>
      </S.StepHeader>

      <S.SignatureSection>
        <S.SectionTitle>청구인 서명</S.SectionTitle>
        <S.SignatureContent>
          <S.SignatureMessage>
            청구인에게
            <br />
            서명을 요청해주세요
          </S.SignatureMessage>
        </S.SignatureContent>

        {/* ✅ sign_done을 받을 때까지 비활성화 */}
        <S.CompleteButton onClick={handleCompleteClick} disabled={!canComplete}>
          {canComplete ? "완료" : "서명 대기 중…"}
        </S.CompleteButton>
      </S.SignatureSection>

      <ConfirmationModal
        isOpen={showModal}
        onConfirm={handleConfirm}
        onCancel={() => setShowModal(false)}
      />

      <LoadingModal isOpen={showLoadingModal} />
    </S.RightPanel>
  );
};

export default SignatureStep;
