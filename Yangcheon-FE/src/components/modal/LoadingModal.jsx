import * as S from "./ModalStyles";

const LoadingModal = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <S.ModalOverlay>
      <S.ModalContent>
        <S.ModalMessage>전송 중입니다. 잠시만 기다려주세요...</S.ModalMessage>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

export default LoadingModal;