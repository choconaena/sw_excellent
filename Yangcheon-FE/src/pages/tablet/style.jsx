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
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(
    180deg,
    rgb(253, 253, 253) 20%,
    rgb(244, 216, 211) 100%
  );
`;

// 대기 화면
export const WelcomeScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  animation: ${fadeIn} 0.8s ease-out;
`;

export const WelcomeMessage = styled.h2`
  font-size: 2rem;
  color: #333;
  margin: 0;
  font-weight: 700;
  line-height: 1.4;
  animation: ${pulse} 3s infinite;
`;
