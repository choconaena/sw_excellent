import styled from "styled-components";

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

export const ModalContent = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 3rem 5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  min-width: 400px;
  text-align: center;
  animation: modalSlideIn 0.3s ease-out;

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

export const ModalMessage = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 5rem;
  font-weight: 600;
  line-height: 1.4;
`;

export const ModalButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

export const ConfirmButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 100px;

  &:hover {
    background-color: #c82333;
  }
`;

export const CancelButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 100px;

  &:hover {
    background-color: #5a6268;
  }
`;
