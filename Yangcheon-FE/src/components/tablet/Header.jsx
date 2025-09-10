import styled from "styled-components";

export const Header = styled.header`
  background-color: rgba(255, 255, 255, 0.95);
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const LogoIcon = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
`;

export const LogoText = styled.h1`
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  margin: 0;
`;

export const Subtitle = styled.p`
  color: #666;
  font-size: 0.7rem;
  margin: 0;
`;

const TabletHeader = () => {
  return (
    <Header>
      <Logo>
        <LogoIcon src="/logo.png" alt="양천하이 로고" />
        <LogoText>양천하이</LogoText>
      </Logo>
      <Subtitle>스마트한 민원 응답을 위한 AI 파트너</Subtitle>
    </Header>
  );
};

export default TabletHeader;
