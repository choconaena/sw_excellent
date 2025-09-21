import styled from "styled-components";

// 기존 consultation 스타일을 베이스로 하여 동적 양식용 추가 스타일 정의

// 기본 컨테이너 스타일들 (기존과 동일)
export const Container = styled.div`
  width: 100%;
  min-height: calc(100vh - 70px);
  background-color: white;
  display: flex;
  flex-direction: column;
`;

export const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

export const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
`;

export const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

// 동적 양식용 폼 컨테이너
export const FormContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-height: 400px;
`;

export const StepHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f3f4;
`;

export const StepTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 0;
`;

export const StepIndicator = styled.div`
  background: #a93946;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
`;

export const FormContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// 폼 필드 스타일들
export const InputField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Label = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: #333;

  span {
    color: #dc3545;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #a93946;
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
  resize: vertical;
  font-family: inherit;

  &:focus {
    border-color: #a93946;
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
  background: white;

  &:focus {
    border-color: #a93946;
  }
`;

export const ErrorText = styled.span`
  color: #dc3545;
  font-size: 0.875rem;
  font-weight: 500;
`;

// 버튼 스타일들
export const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #f1f3f4;
`;

export const PrimaryButton = styled.button`
  background-color: ${props => props.$disabled ? '#6c757d' : '#a93946'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s;
  min-width: 120px;

  &:hover {
    background-color: ${props => props.$disabled ? '#6c757d' : '#91212e'};
  }
`;

export const SecondaryButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 120px;

  &:hover {
    background-color: #5a6268;
  }
`;

// 서명 관련 스타일들
export const SignatureSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
`;

export const SignatureTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin: 0;
`;

export const SignatureNotice = styled.div`
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
`;

export const SignatureWarning = styled.div`
  color: #f39c12;
  font-weight: 600;
  margin-top: 0.5rem;
`;

export const SignatureCanvas = styled.canvas`
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: crosshair;
  background: white;

  &:focus {
    border-color: #a93946;
  }
`;

export const SignatureActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const ClearButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #c82333;
  }
`;

export const SignatureStatus = styled.div`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  background: ${props => props.$hasSignature ? '#d4edda' : '#f8d7da'};
  color: ${props => props.$hasSignature ? '#155724' : '#721c24'};
`;

// 완료 섹션 스타일들
export const CompletionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
`;

export const CompletionTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

export const CompletionText = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
`;

export const CompletionReady = styled.div`
  color: #28a745;
  font-weight: 600;
  font-size: 1rem;
`;

export const CompletionPending = styled.div`
  color: #f39c12;
  font-weight: 600;
  font-size: 1rem;
`;