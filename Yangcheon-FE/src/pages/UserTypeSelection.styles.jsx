import styled from "styled-components";

export const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    180deg,
    rgb(253, 253, 253) 40%,
    rgb(244, 216, 211) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0rem 12rem;
`;

export const MainWrapper = styled.div`
  width: 100%;
`;

export const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

export const Logo = styled.img`
  margin: 0 auto 1.5rem auto;
  height: 5rem;
  width: auto;
  display: block;
`;

export const Title = styled.h1`
  font-size: 2.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
`;

export const Subtitle = styled.p`
  font-size: 1.5rem;
  color: #4b5563;
`;

export const GridContainer = styled.div`
  display: grid;
  gap: 2rem;
  width: 100%;
  padding: 0 clamp(1rem, 4vw, 2rem);
  justify-content: center;
  justify-items: center;
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(400px, 1fr));
  }
`;

export const Card = styled.div`
  width: 100%;
  max-width: 1200px;
  background: white;
  border-radius: 2rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
    transform: translateY(-2px);
  }
`;

export const CardContent = styled.div`
  padding: 5rem 2rem;
  text-align: center;
`;

export const IconContainer = styled.div`
  margin-bottom: 2rem;
`;

export const IconWrapper = styled.div`
  width: 5rem;
  height: 5rem;
  background-color: ${(props) => props.$bgColor || "#dbeafe"};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
  transition: background-color 0.3s ease;

  ${Card}:hover & {
    background-color: ${(props) => props.$hoverColor || "#bfdbfe"};
  }
`;

export const CardTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.75rem;
`;

export const CardDescription = styled.p`
  color: #4b5563;
  margin-bottom: 1.5rem;
  line-height: 1.5;
  font-size: 1.2rem;
`;

export const Button = styled.button`
  width: 90%;
  background-color: ${(props) => props.$bgColor || "#A93946"};
  color: white;
  padding: 1.2rem 0;
  font-size: 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) => props.$hoverColor || "#1d4ed8"};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3);
  }
`;

export const Footer = styled.div`
  text-align: center;
  margin-top: 2rem;

  p {
    font-size: 0.875rem;
    color: #6b7280;
  }
`;

export const AdminIcon = styled.svg`
  width: 2.5rem;
  height: 2.5rem;
  color: #a93946;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

export const CitizenIcon = styled.svg`
  width: 2.5rem;
  height: 2.5rem;
  color: #ff6a00;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

export const AdminIconComponent = () => (
  <AdminIcon viewBox="0 0 24 24">
    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </AdminIcon>
);

export const CitizenIconComponent = () => (
  <CitizenIcon viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      d="M12 2a5 5 0 100 10 5 5 0 000-10zm-7 18a7 7 0 0114 0H5z"
      clipRule="evenodd"
    />
  </CitizenIcon>
);
