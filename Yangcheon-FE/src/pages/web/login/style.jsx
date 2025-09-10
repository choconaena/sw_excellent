import styled, { keyframes, css } from "styled-components";

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
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

export const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  //   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

export const LoginCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 3rem 10rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 800px;
  animation: ${fadeIn} 0.6s ease-out;
`;

export const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

export const LogoIcon = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

export const LogoText = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  color: #333;
  margin: 0 0 0.5rem 0;
`;

export const Subtitle = styled.p`
  color: #666;
  font-size: 1rem;
  margin: 0;
  line-height: 1.4;
`;

export const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const FieldLabel = styled.label`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
`;

export const FormInput = styled.input`
  padding: 1rem 1.2rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1.2rem;
  outline: none;
  transition: all 0.3s ease;
  background: white;

  &:focus {
    border-color: #a93946;
    box-shadow: 0 0 0 3px rgba(169, 57, 70, 0.1);
  }

  &::placeholder {
    color: #999;
  }

  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.9rem;
  padding: 0.75rem 1rem;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  text-align: center;
`;

export const LoginButton = styled.button`
  background-color: #a93946;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1.2rem;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover:not(:disabled) {
    background-color: #91212e;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(169, 57, 70, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  ${(props) =>
    props.disabled &&
    css`
      animation: ${pulse} 2s infinite;
    `}
`;

export const Footer = styled.div`
  margin-top: 2rem;
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
`;

export const FooterText = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
`;
