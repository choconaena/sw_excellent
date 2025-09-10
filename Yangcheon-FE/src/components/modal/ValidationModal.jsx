import * as S from "./ModalStyles";

const ValidationModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <S.ModalMessage>{message}</S.ModalMessage>
        <S.ModalButtonGroup>
          <S.ConfirmButton onClick={onClose}>확인</S.ConfirmButton>
        </S.ModalButtonGroup>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

export default ValidationModal;
