import styled, { keyframes } from "styled-components";

const STEP_HEADER_HEIGHT = "120px";

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
  width: 100vw;
  height: 100dvh;
  background: #fff;
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
export const InlineTextInput = styled.input`
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  height: 2.25rem;
  font-size: 0.95rem;
  line-height: 1.2;
  flex: 1 1 12rem; /* 기본 12rem, 필요 시 줄어듦 */
  min-width: 0;
  max-width: 100%;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
  }
`;
//수수료
export const LegalNotice = styled.div`
  color: #666;
  font-size: 1.1rem;
  line-height: 1.4;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-top: 1rem;
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

// 실시간 상담 화면
export const ChatScreen = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 20px;
  animation: ${fadeIn} 0.6s ease-out;
  overflow: hidden;
  max-height: 86dvh;
  min-height: 0;
`;

export const ChatHeader = styled.div`
  padding: 1.5rem 2rem;
  text-align: center;
`;

export const ChatTitle = styled.h3`
  font-size: 2rem;
  margin: 0;
  font-weight: 700;
`;

export const ChatMessages = styled.div`
  flex: 1;
  padding: 2rem 12rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
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
  max-width: 70%;
  padding: 1.2rem 1.5rem;
  border-radius: 20px;
  font-size: 1.3rem;
  line-height: 1.5;
  word-wrap: break-word;
  animation: ${fadeIn} 0.4s ease-out;

  ${(props) =>
    props.$isUser
      ? `
    background: #e3f2fd;
    color: #333;
    align-self: flex-end;
    margin-left: auto;
  `
      : `
    background: #f5f5f5;
    color: #333;
    align-self: flex-start;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  `}
`;

// 폼 화면
export const FormScreen = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  // border-radius: 20px;
  // box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: ${fadeIn} 0.6s ease-out;
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
`;

export const FormSubtitle = styled.p`
  font-size: 1rem;
  margin: 0;
  opacity: 0.7;
`;

export const FormContent = styled.div`
  flex: 1;
  padding: 1rem 12rem;
  overflow-y: auto;
`;

export const FormField = styled.div`
  margin-bottom: 1.5rem;
`;

export const FieldLabel = styled.label`
  display: block;
  margin-bottom: 1rem;
  color: #333;
  font-weight: 700;
  font-size: 1.2rem;
`;

export const Required = styled.span`
  color: #dc3545;
  margin-right: 0.25rem;
`;

export const FormInput = styled.input`
  width: 100%;
  padding: 0.7rem 1.3rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #a93946;
    box-shadow: 0 0 0 3px rgba(169, 57, 70, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

export const FormButton = styled.button`
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
  margin: auto 0;

  &:hover {
    background-color: #91212e;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(169, 57, 70, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

// 체크박스 그리드
export const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); /* 중요 */
  gap: 1.5rem;
  margin-top: 1rem;
`;

export const CheckboxOption = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #a93946;
    background-color: #fff5f6;
  }

  ${(props) =>
    props.$checked &&
    `
    border-color: #a93946;
    background-color: #fff5f6;
  `}
`;

export const CheckboxInput = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #a93946;
`;

export const CheckboxLabel = styled.label`
  font-size: 1.2rem;
  color: #333;
  cursor: pointer;
  font-weight: 500;
`;

// 요약 화면
export const SummaryScreen = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  // border-radius: 20px;
  // box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: ${fadeIn} 0.6s ease-out;
  justify-content: center;
`;

export const SummaryContent = styled.div`
  flex: 1;
  padding: 1rem 20rem;
  overflow-y: auto;
`;

export const SummaryTitle = styled.h4`
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 1.5rem;
  font-weight: 700;
`;

export const SummaryText = styled.div`
  font-size: 1.3rem;
  line-height: 1.8;
  color: #333;
  white-space: pre-line;
`;

// 서명 화면
export const SignatureScreen = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  overflow: hidden;
  margin: 0 10rem;
  justify-content: center;
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

export const SignatureMessage = styled.p`
  font-size: 1.5rem;
  color: #666;
  text-align: center;
  margin: 0;
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
