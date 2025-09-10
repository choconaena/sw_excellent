import styled from "styled-components";

// 공통 패널 스타일
export const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
`;

export const CenterPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 2rem;
`;

export const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

// 채팅 관련 스타일
export const ChatSection = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-height: 80vh;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; // 내부에서만 스크롤
`;

export const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 2rem 1.5rem;
  background-color: white;
  position: sticky;
  top: 0;
  z-index: 1;
  flex-shrink: 0;
`;

export const ChatTitle = styled.h3`
  font-size: 1.5rem;
  color: #333;
  margin: 0;
  font-weight: 700;
`;

export const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 0 1.5rem 1.5rem 1.5rem; // padding을 여기에 줘야 메시지가 Header에 겹치지 않음

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

export const Message = styled.div`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background-color: ${(props) => (props.$isUser ? "#e3f2fd" : "#f5f5f5")};
  color: #333;
  font-size: 1.2rem;
  line-height: 1.4;
  max-width: 80%;
  align-self: ${(props) => (props.$isUser ? "flex-end" : "flex-start")};
`;

// 토글 관련 스타일
export const ToggleSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
`;

export const ToggleLabel = styled.span`
  font-size: 1.2rem;
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

// 단계별 스타일
export const StepHeader = styled.div`
  background-color: white;
  padding: 1.5rem 1.5rem;
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
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 1.2rem;
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

export const NextButton = styled.button`
  background-color: #a93946;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 3rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #91212e;
  }
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

// 폼 관련 스타일
export const FormSection = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const FormField = styled.div`
  margin-bottom: 1rem;
`;

export const FieldLabel = styled.label`
  display: block;
  margin-bottom: 1rem;
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
  padding: 1rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1.5rem;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #a93946;
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
  min-height: 100px;

  &:focus {
    border-color: #a93946;
  }
`;

export const InfoText = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin: 1rem 0;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
`;

// 라디오 버튼 스타일
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
  width: 30px;
  height: 30px;
  cursor: pointer;
  accent-color: #a93946;
`;

export const RadioLabel = styled.label`
  font-size: 1.3rem;
  color: #333;
  cursor: pointer;
`;

export const InlineControls = styled.div`
  display: grid;
  grid-template-columns: 1fr auto; /* 왼쪽(생년월일)은 넓게, 오른쪽(성별)은 내용크기 */
  align-items: center;
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    align-items: stretch; /* 모바일에서는 세로로 자연스럽게 쌓이게 */
  }
`;

// 체크박스 스타일
export const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr)); /* ← 중요 */
  gap: 2rem;
  margin-top: 1rem;
`;
export const CheckboxOption = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-width: 0;
`;
export const CheckboxInput = styled.input`
  width: 30px;
  height: 30px;
  cursor: pointer;
  accent-color: #a93946;
  /* ✔ 크기 고정: flex 수축 금지 */
  flex: 0 0 30px;
  min-width: 30px;
  min-height: 30px;
`;

export const OptionBody = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap; /* ← 같은 줄 유지 */
  min-width: 0; /* flex 아이템 수축 허용 */
`;

export const CheckboxLabel = styled.span`
  font-size: 1.5rem;
  color: #333;
  cursor: pointer;
  white-space: nowrap; /* '기타' 줄바꿈 방지 */
`;

export const InlineTextInput = styled.input`
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  min-width: 12rem;
  max-width: 22rem;
  font-size: 0.95rem;
  line-height: 1.2;
  height: 2.25rem;
  flex: 0 1 clamp(10rem, 30vw, 18rem);

  &:focus {
    outline: none;
    border-color: #a93946;
  }
`;

// 섹션 스타일
export const SectionTitle = styled.h3`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
  font-weight: 700;
`;

export const FeeSection = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const LegalNotice = styled.div`
  color: #666;
  font-size: 1.1rem;
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
  font-size: 1.5rem;
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

export const CompleteButton = styled.button`
  background-color: #a93946;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1.2rem 4rem;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #91212e;
  }
`;

// 향상된 요약 단계 스타일
export const SummaryContent = styled.div`
  color: #333;
  font-size: 1.2rem;
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
  font-size: 1.3rem;
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

// 요약 관련 스타일
export const SummarySection = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const SummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start; // 여러 줄일 경우 위 정렬
  margin-bottom: 2rem;
`;

export const SummaryHeaderText = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SummaryTitle = styled.h3`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 700;
`;

export const SummarySubtitle = styled.p`
  color: #666;
  font-size: 1.2rem;
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
