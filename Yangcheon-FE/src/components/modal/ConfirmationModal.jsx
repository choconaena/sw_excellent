import * as S from "./ModalStyles";

const ConfirmationModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <S.ModalOverlay onClick={onCancel}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <S.ModalMessage>완료하시겠습니까?</S.ModalMessage>
        <S.ModalButtonGroup>
          <S.ConfirmButton onClick={onConfirm}>확인</S.ConfirmButton>
          <S.CancelButton onClick={onCancel}>취소</S.CancelButton>
        </S.ModalButtonGroup>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

export default ConfirmationModal;
