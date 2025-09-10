import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  min-height: 100%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 800px;
  width: 100%;
  text-align: center;
`;

export const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background-color: #a93946;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem auto;
  animation: successPulse 0.6s ease-out;

  @keyframes successPulse {
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
  }
`;

export const CheckMark = styled.div`
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
`;

export const CompletionMessage = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 3rem;
  font-weight: 700;
  line-height: 1.4;
`;

export const SummaryCard = styled.div`
  background-color: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 3rem;
  text-align: left;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const SummaryItem = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const SummaryLabel = styled.div`
  font-size: 1.5rem;
  color: #666;
  margin-bottom: 1rem;
  font-weight: 700;
`;

export const SummaryValue = styled.div`
  font-size: 1.5rem;
  color: #333;
  font-weight: 600;
`;

export const HomeButton = styled.button`
  background-color: #a93946;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1.2rem 3rem;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  margin: 0 auto;
  max-width: 300px;
  transition: background-color 0.2s, transform 0.2s;

  &:hover {
    background-color: #91212e;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;
