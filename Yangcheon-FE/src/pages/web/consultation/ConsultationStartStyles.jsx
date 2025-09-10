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
  gap: 2.5rem;
  animation: ${slideIn} 0.6s ease-out;
`;

// 검색 섹션 스타일
export const SearchSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f3f4;
`;

export const SearchTitle = styled.h2`
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  text-align: center;
  color: #333;
`;

export const SearchForm = styled.form`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: 1rem 1.5rem;
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

export const SearchButton = styled.button`
  width: 50px;
  height: 50px;
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

export const SearchIcon = styled.span`
  font-size: 1.2rem;
`;

// 서비스 컨테이너 - 가로 배치
export const ServicesContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

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

export const ServiceBadge = styled.div`
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
