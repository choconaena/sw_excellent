import styled from "styled-components";

// 메인 컨테이너
export const Container = styled.div`
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`;

export const Header = styled.header`
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
`;

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0;
`;

export const StepIndicator = styled.div`
  background: #a93946;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(169, 57, 70, 0.3);
`;

export const Content = styled.main`
  flex: 1;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
`;

// 로딩 상태
export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

export const LoadingText = styled.div`
  font-size: 1.5rem;
  color: #666;
  text-align: center;
`;

// 폼 관련 스타일
export const FormContainer = styled.div`
  width: 100%;
  max-width: 800px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
`;

export const StepTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  text-align: center;
  margin-bottom: 2rem;
`;

export const FormContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
`;

export const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const Label = styled.label`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;

  span {
    color: #dc3545;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 1rem 1.5rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1.1rem;
  outline: none;
  transition: all 0.3s ease;
  background: white;

  &:focus {
    border-color: #a93946;
    box-shadow: 0 0 0 3px rgba(169, 57, 70, 0.1);
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem 1.5rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1.1rem;
  outline: none;
  transition: all 0.3s ease;
  resize: vertical;
  font-family: inherit;
  background: white;

  &:focus {
    border-color: #a93946;
    box-shadow: 0 0 0 3px rgba(169, 57, 70, 0.1);
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 1rem 1.5rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1.1rem;
  outline: none;
  transition: all 0.3s ease;
  background: white;

  &:focus {
    border-color: #a93946;
    box-shadow: 0 0 0 3px rgba(169, 57, 70, 0.1);
  }
`;

export const ErrorText = styled.span`
  color: #dc3545;
  font-size: 1rem;
  font-weight: 500;
`;

export const Instructions = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
  border: 2px solid #dee2e6;
`;

// 서명 관련 스타일
export const SignatureContainer = styled.div`
  width: 100%;
  max-width: 900px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const SignatureHeader = styled.div`
  text-align: center;
`;

export const SignatureTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
`;

export const SignatureSubtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin: 0;
`;

export const SignatureCanvasContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
`;

export const SignatureCanvas = styled.canvas`
  border: 3px solid #e9ecef;
  border-radius: 15px;
  cursor: crosshair;
  background: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  &:focus {
    border-color: #a93946;
  }
`;

export const SignatureOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.2rem;
  color: #adb5bd;
  pointer-events: none;
  display: ${props => props.$hasSignature ? 'none' : 'block'};
`;

export const SignatureActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ClearButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #c82333;
    transform: translateY(-2px);
  }
`;

export const SignatureStatus = styled.div`
  padding: 1rem 2rem;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  background: ${props => props.$hasSignature ? '#d4edda' : '#f8d7da'};
  color: ${props => props.$hasSignature ? '#155724' : '#721c24'};
  border: 2px solid ${props => props.$hasSignature ? '#c3e6cb' : '#f5c6cb'};
`;

// 완료 화면 스타일
export const CompleteContainer = styled.div`
  width: 100%;
  max-width: 800px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const CompleteHeader = styled.div`
  text-align: center;
  padding-bottom: 2rem;
  border-bottom: 2px solid #e9ecef;
`;

export const CompleteIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

export const CompleteTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: #28a745;
  margin-bottom: 0.5rem;
`;

export const CompleteSubtitle = styled.p`
  font-size: 1.3rem;
  color: #666;
  margin: 0;
`;

export const CompleteContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const CompleteSection = styled.div`
  background: #f8f9fa;
  border-radius: 15px;
  padding: 2rem;
  border: 2px solid #e9ecef;
`;

export const SectionTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
`;

export const SectionContent = styled.div`
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
`;

export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;
`;

export const SummaryLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
  margin-bottom: 0.25rem;
`;

export const SummaryValue = styled.span`
  font-size: 1rem;
  color: #333;
  font-weight: 500;
`;

export const CompleteFooter = styled.div`
  text-align: center;
  padding-top: 2rem;
  border-top: 2px solid #e9ecef;
`;

export const ThankYouMessage = styled.div`
  font-size: 1.3rem;
  font-weight: 600;
  color: #a93946;
`;