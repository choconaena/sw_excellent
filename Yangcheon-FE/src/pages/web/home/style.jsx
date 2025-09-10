import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

export const WelcomeSection = styled.div`
  text-align: left;
  margin-bottom: 4rem;
  width: 100%;
`;

export const WelcomeTitle = styled.h2`
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
  font-weight: 600;
`;

export const WelcomeMessage = styled.p`
  font-size: 1.5rem;
  color: #666;
  margin: 0;
`;

export const ServiceBox = styled.div`
  background-color: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 4rem 3rem;
  text-align: center;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 1200px;
`;

export const ServiceTitle = styled.h3`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 3rem;
  font-weight: 700;
  line-height: 1.4;
`;

export const StartButton = styled.button`
  background-color: #a93946;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 3rem;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #91212e;
  }

  &:active {
    transform: translateY(1px);
  }
`;

export const NoticeText = styled.p`
  color: #666;
  font-size: 0.9rem;
  text-align: right;
  margin: 0;
  font-style: italic;
  width: 100%;
  max-width: 1200px;
`;
