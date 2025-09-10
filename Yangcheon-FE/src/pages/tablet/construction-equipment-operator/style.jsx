import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
`;

export const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const Content = styled.main`
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  overflow: auto;
  position: relative;
`;

// Form Components
export const FormContainer = styled.div`
  background: white;
  padding: 2rem;
  margin: 0 300px;
`;

export const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 0.5rem;
`;

export const Subtitle = styled.p`
  color: #666;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 0.9rem;
`;

export const FormContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-top: 1rem;
`;

export const RadioGroup = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

export const RadioOption = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const RadioInput = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #b85450;
`;

export const RadioLabel = styled.label`
  font-size: 1rem;
  color: #333;
  cursor: pointer;
`;

export const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const FieldLabel = styled.label`
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const RequiredMark = styled.span`
  color: #e74c3c;
  font-weight: bold;
`;

export const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #b85450;
  }

  &::placeholder {
    color: #999;
  }
`;

export const SubmitButton = styled.button`
  background-color: #a93946;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 3rem;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: block;
  margin: 3rem auto 0;

  &:hover {
    background-color: #91212e;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(169, 57, 70, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

// Requirements Components
export const RequirementsContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
`;

export const RequirementsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const RequirementsSection = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
`;

export const SectionNumber = styled.div`
  font-weight: bold;
  color: #333;
  min-width: 20px;
`;

export const SectionContent = styled.div`
  flex: 1;
`;

export const RequirementList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

export const RequirementItem = styled.div`
  color: #555;
  font-size: 0.9rem;
  line-height: 1.4;
`;

export const FeeSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

export const FeeLabel = styled.div`
  font-weight: 500;
  color: #333;
  text-align: center;
`;

export const FeeAmount = styled.div`
  font-weight: bold;
  color: #b85450;
  text-align: center;
`;

export const ProcessSection = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

export const ProcessTitle = styled.h4`
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  text-align: center;
`;

export const ProcessList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const ProcessItem = styled.div`
  color: #555;
  font-size: 0.9rem;
  line-height: 1.4;
`;

export const NoticeBox = styled.div`
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  padding: 1rem;
  color: #555;
  font-size: 0.75rem;
  line-height: 1.5;
`;

// Signature Components
export const SignatureModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const SignatureOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
`;

export const SignatureContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  position: relative;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
`;

export const SignatureTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: bold;
  color: #333;
  margin: 0;
`;

export const SignatureSubtitle = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin: 0;
  text-align: center;
`;

export const SignatureCanvas = styled.canvas`
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: crosshair;
  background: white;
`;

export const SignatureButton = styled.button`
  background-color: #b85450;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #a04944;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

// 완료 화면
export const CompletionScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  animation: ${fadeIn} 0.8s ease-out;
`;

export const SuccessIcon = styled.div`
  width: 90px;
  height: 90px;
  background-color: #a93946;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  animation: ${pulse} 2s infinite;
`;

export const CheckMark = styled.div`
  color: white;
  font-size: 3rem;
  font-weight: bold;
`;

export const CompletionMessage = styled.h2`
  font-size: 2rem;
  color: #333;
  margin-bottom: 3rem;
  font-weight: 700;
`;

export const CompletionCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  max-width: 700px;
  width: 100%;
`;

export const CompletionItem = styled.div`
  margin-bottom: 2rem;
  text-align: left;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const CompletionLabel = styled.div`
  font-size: 1.3rem;
  color: #666;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

export const CompletionValue = styled.div`
  font-size: 1.5rem;
  color: #333;
  font-weight: 600;
`;

export const DetailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: center;
`;

export const DetailLabel = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
`;

export const DetailValue = styled.div`
  color: #555;
  font-size: 1rem;
`;

export const RequirementsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;
  border: 2px solid #ddd;
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid #ddd;
`;

export const TableHeader = styled.td`
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  color: #333;
  vertical-align: middle;
  width: 120px;
  line-height: 1.4;
`;

export const TableCell = styled.td`
  border: 1px solid #ddd;
  padding: 1rem;
  vertical-align: top;
  background-color: white;
`;

export const TableFeeCell = styled.td`
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  color: #333;
  vertical-align: middle;
  width: 100px;
  line-height: 1.4;
`;

export const SignatureScreen = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  overflow: hidden;
  margin: 0 10rem;
  justify-content: center;
`;

export const FormHeader = styled.div`
  padding: 2rem 2rem 1rem 2rem;
  text-align: center;
`;

export const FormTitle = styled.h3`
  font-size: 1.7rem;
  margin: 0 0 0.7rem 0;
  font-weight: 700;
  color: #333;
`;

export const FormSubtitle = styled.p`
  font-size: 1rem;
  margin: 0;
  color: #666;
`;

export const SignatureArea = styled.div`
  flex: 1;
  margin: 1rem 3rem;
  border: 3px dashed #ccc;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  height: 50%;
`;

export const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  background: #fff;
  touch-action: none;
  cursor: crosshair;
  border-radius: 8px;
`;

export const Toolbar = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  flex-wrap: wrap;
`;

export const ToolButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #5a6268;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const FormButton = styled.button`
  background-color: #b85450;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #a04944;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
