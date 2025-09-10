import styled, { keyframes } from "styled-components";

const pulse = keyframes`
0% { opacity: 1; }
50% { opacity: 0.5; }
100% { opacity: 1; }
`;

const slideIn = keyframes`
from {
  opacity: 0;
  transform: translateY(20px);
}
to {
  opacity: 1;
  transform: translateY(0);
}
`;

const successPulse = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

// 공통 컨테이너 스타일
export const Container = styled.div`
  width: 100%;
  min-height: calc(100vh - 1000px);
  background-color: white;
  display: flex;
  flex-direction: column;
`;

export const Header = styled.div`
  padding: 2rem;
  border-bottom: 1px solid #e9ecef;
`;

export const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  margin: 0;
  font-weight: 600;
`;

export const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;
`;

export const ContentBox = styled.div`
  width: 100%;
  max-width: 1200px;
  min-height: 400px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: white;
  gap: 2rem;
`;

export const Message = styled.h2`
  font-size: 2rem;
  color: #333;
  text-align: center;
  margin: 0;
  font-weight: 600;
`;

export const ButtonContainer = styled.div`
  padding: 0rem 4rem;
  display: flex;
  justify-content: flex-end;
`;

export const NextButton = styled.button`
  background-color: #a93946;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 3rem;
  font-size: 1.4rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #91212e;
  }
`;

// ApplicationFormStep 스타일
// 상단 국가기술자격 카드
export const QualificationRow = styled.div`
  max-width: 1200px;
  margin: 0 auto 1.5rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem 2rem;
  background: white;
`;

// 2칸 가로 그리드 (성명/주민등록 등에 사용)
export const InlineGridTwo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// 4칸(데스크탑) / 2칸(중간) / 1칸(모바일)
export const InlineGridFour = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  align-items: end;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// ✅ 새로운 단일 박스(발급유형, 설명, 2열 필드 전부 포함)
export const GroupPanel = styled.div`
  max-width: 1200px;
  margin: 0 auto 1.5rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem 2rem;
  background: white;
`;

// 2열 그리드 (성명/주민등록번호, 주소/전화번호, 면허종류/재발급사유)
export const TwoColGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 2rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

// 전체 폭 패널(발급유형 등)
export const FullWidthPanel = styled.div`
  margin: 0 auto 1.5rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem 0rem;
  background: white;
`;

// 가로 1행(두 필드) 패널(성명/주민등록)
export const RowPanel = styled(FullWidthPanel)``;

export const FormContent = styled.div`
  flex: 1;
  padding: 2rem;
`;

export const InfoText = styled.div`
  text-align: center;
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

export const FormContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin: 0 auto;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

export const FormColumn = styled.div`
  background-color: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 2rem;
`;

export const FormField = styled.div`
  margin-bottom: 2rem;
`;

export const FieldLabel = styled.label`
  display: block;
  margin-bottom: 1.3rem;
  color: #333;
  font-weight: 600;
  font-size: 1.5rem;
`;

export const Required = styled.span`
  color: #dc3545;
  margin-right: 0.25rem;
`;

export const FieldNote = styled.span`
  color: #666;
  font-size: 1.2rem;
  font-weight: normal;
`;

export const FormInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1.3rem;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #a93946;
  }
`;

export const SubFormField = styled.div`
  margin-bottom: 1rem;
`;

export const SubFieldLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
  font-size: 1.2rem;
`;

export const RadioGroup = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 0.5rem;
`;

export const RadioOption = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const RadioInput = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #b85450;
`;

export const RadioLabel = styled.label`
  font-size: 1rem;
  color: #333;
  cursor: pointer;
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
  min-height: 100px;

  &:focus {
    border-color: #a93946;
  }
`;

// 서명 단계 스타일
export const SignatureTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin: 0;
  font-weight: 600;
`;

export const CompleteButton = styled.button`
  background-color: #a93946;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 3rem;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #91212e;
  }
`;

// 완료 화면 스타일
export const CompletionContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;
  gap: 3rem;
`;

export const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background-color: #a93946;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${successPulse} 0.6s ease-out;
`;

export const CheckMark = styled.div`
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
`;

export const CompletionMessage = styled.h2`
  font-size: 2rem;
  color: #333;
  margin: 0;
  font-weight: 700;
  text-align: center;
`;

export const SummaryCard = styled.div`
  background-color: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 2rem;
  text-align: left;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
`;

export const SummaryItem = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const SummaryLabel = styled.div`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

export const SummaryValue = styled.div`
  font-size: 1.2rem;
  color: #333;
  font-weight: 600;
`;

export const HomeButton = styled.button`
  background-color: #a93946;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1.2rem 3rem;
  font-size: 1.3rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;

  &:hover {
    background-color: #91212e;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

// 기존 스타일들 (유지)
export const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
`;

// New combined search box styles
export const CombinedSearchBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  background: white;
  border-radius: 16px;
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f3f4;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

export const CombinedSearchTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  white-space: nowrap;
`;

export const CombinedSearchInputWrapper = styled.form`
  flex: 1;
  display: flex;
  gap: 1rem;
  align-items: center;
  width: 100%; /* Ensure it takes full width on smaller screens */

  @media (min-width: 769px) {
    max-width: 400px; /* Limit width on larger screens */
  }
`;

export const CombinedSearchInput = styled.input`
  flex: 1;
  padding: 0.8rem 1.2rem;
  border: 2px solid #e9ecef;
  border-radius: 50px;
  font-size: 1rem;
  outline: none;
  background: white;
  transition: all 0.3s ease;

  &:focus {
    border-color: #a93946;
    box-shadow: 0 0 0 3px rgba(169, 57, 70, 0.1);
  }

  &::placeholder {
    color: #666;
  }
`;

export const CombinedSearchButton = styled.button`
  width: 45px;
  height: 45px;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    border-color: #a93946;
    box-shadow: 0 4px 12px rgba(169, 57, 70, 0.2);
    transform: scale(1.05);
  }
`;

export const CombinedSearchIcon = styled.span`
  font-size: 1.2rem;
`;

// New container for service categories (horizontal layout)
export const ServiceCategoriesWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  animation: ${slideIn} 0.6s ease-out;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr; /* Stack columns on small screens */
  }
`;

// DefaultConsultationView's main container (now just a wrapper for the above)
export const DefaultViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
`;

// Existing styles for chat and step panels (unchanged)
export const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
`;

export const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

// Chat related styles (unchanged)
export const ChatSection = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-height: 80vh;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  background-color: white;
  position: sticky;
  top: 0;
  z-index: 1;
  flex-shrink: 0;
`;

export const ChatTitle = styled.h3`
  font-size: 1.4rem;
  color: #333;
  margin: 0;
  font-weight: 700;
`;

export const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 1.5rem 1.5rem 1.5rem;

  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #aaa;
  }
`;

export const MessageStyled = styled.div`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background-color: ${(props) => (props.$isUser ? "#e3f2fd" : "#f5f5f5")};
  color: #333;
  font-size: 0.9rem;
  line-height: 1.4;
  max-width: 80%;
  align-self: ${(props) => (props.$isUser ? "flex-end" : "flex-start")};
`;

// Toggle related styles (unchanged)
export const ToggleSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
`;

export const ToggleLabel = styled.span`
  font-size: 0.9rem;
  color: #666;
  text-align: center;
  white-space: nowrap;
`;

export const ToggleSwitch = styled.div`
  width: 60px;
  height: 30px;
  background-color: ${(props) => (props.$isOn ? "#4caf50" : "#ccc")};
  border-radius: 15px;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0 8px;
  box-sizing: border-box;
`;

export const ToggleSlider = styled.div`
  width: 26px;
  height: 26px;
  background-color: white;
  border-radius: 50%;
  position: absolute;
  left: ${(props) => (props.$isOn ? "30px" : "2px")};
  transition: left 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

export const ToggleText = styled.span`
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  z-index: 1;
  margin-right: ${(props) => (props.$isOn ? "auto" : "0")};
  margin-left: ${(props) => (props.$isOn ? "0" : "auto")};
`;

// Step related styles (unchanged)
export const StepHeader = styled.div`
  background-color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-weight: 600;
  color: #333;
`;

export const StepNavigation = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  height: 40px;
`;

export const StepTitle = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: #f5f5f5;
    color: #333;
  }
`;

export const StepContent = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
`;

export const RequestMessage = styled.h2`
  font-size: 1.5rem;
  color: #333;
  text-align: center;
  margin-bottom: 3rem;
  font-weight: 600;
`;

export const PrevButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 3rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #5a6268;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
`;

// Form related styles (unchanged)
export const FormSection = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const InfoTextTop = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin: 1rem 0;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
`;

// Checkbox styles (unchanged)
export const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 0.5rem;
`;

export const CheckboxOption = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const CheckboxInput = styled.input`
  width: 23px;
  height: 23px;
  cursor: pointer;
`;

export const CheckboxLabel = styled.label`
  font-size: 1.3rem;
  color: #333;
  cursor: pointer;
`;

// Section styles (unchanged)
export const SectionTitleConsultation = styled.h3`
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

export const FeeSection = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const LegalNotice = styled.div`
  color: #666;
  font-size: 0.85rem;
  line-height: 1.4;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-top: 1rem;
`;

export const MethodSection = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const MethodGroup = styled.div`
  margin-bottom: 2rem;
`;

export const MethodGroupTitle = styled.h4`
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 1.5rem;
  font-weight: 700;
`;

export const SignatureSection = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

export const SignatureContent = styled.div`
  padding: 4rem 2rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  margin: 2rem 0;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const SignatureMessage = styled.h2`
  font-size: 1.5rem;
  color: #333;
  line-height: 1.4;
  font-weight: 600;
`;

// Enhanced Summary Step styles (unchanged)
export const SummaryContent = styled.div`
  color: #333;
  font-size: 1rem;
  line-height: 1.6;
  width: 100%;
  text-align: left;
  white-space: pre-line;
`;

export const SummaryTextArea = styled.textarea`
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
  resize: none;
  background: transparent;
  font-family: inherit;
  white-space: pre-wrap;
`;

export const SummaryButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

// Summary related styles (unchanged)
export const SummarySection = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const SummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
`;

export const SummaryHeaderText = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SummaryTitle = styled.h3`
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

export const SummarySubtitle = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 2rem;
`;

export const SummaryBox = styled.div`
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 3rem 2rem;
  text-align: center;
  margin-bottom: 2rem;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const SummaryMessage = styled.div`
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
`;

export const SummaryButton = styled.button`
  background-color: #a93946;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 3rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  display: block;
  margin: 0 auto;

  &:hover {
    background-color: #91212e;
  }
`;

// Styles for Service Sections and Cards
export const ServiceSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f3f4;
`;

export const SectionIcon = styled.span`
  font-size: 1.5rem;
`;

export const SectionTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin: 0;
  font-weight: 700;
  flex: 1;
`;

export const RecordingBadge = styled.div`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${(props) => (props.$isRecording ? "#a93946" : "#6c757d")};
  color: white;
  box-shadow: 0 2px 8px
    ${(props) =>
      props.$isRecording
        ? "rgba(169, 57, 70, 0.3)"
        : "rgba(108, 117, 125, 0.3)"};
`;

export const ServiceGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const ServiceCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f3f4;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    border-color: ${(props) => (props.$isRecording ? "#a93946" : "#6c757d")};
  }

  &:active {
    transform: translateY(-2px);
  }
`;

export const ServiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

export const ServiceEmoji = styled.div`
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
`;

export const ServiceBadgeInCard = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-size: 0.7rem;
  font-weight: 600;
  background: ${(props) => (props.$isRecording ? "#a93946" : "#6c757d")};
  color: white;
  box-shadow: 0 2px 8px
    ${(props) =>
      props.$isRecording
        ? "rgba(169, 57, 70, 0.3)"
        : "rgba(108, 117, 125, 0.3)"};
`;

export const RecordingDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: white;
  animation: ${pulse} 2s infinite;
`;

export const ServiceContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const ServiceTitle = styled.h4`
  font-size: 1.2rem;
  color: #333;
  margin: 0;
  font-weight: 700;
  line-height: 1.3;
`;

export const ServiceDescription = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
  font-weight: 500;
`;

export const ServiceArrow = styled.div`
  font-size: 1.5rem;
  color: ${(props) => (props.$isRecording ? "#a93946" : "#6c757d")};
  align-self: flex-end;
  margin-top: auto;
  transition: transform 0.3s ease;
  font-weight: bold;

  ${ServiceCard}:hover & {
    transform: translateX(5px);
  }
`;
