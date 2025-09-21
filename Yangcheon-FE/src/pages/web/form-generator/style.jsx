import styled, { keyframes } from "styled-components";

export const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

export const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

export const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
`;

export const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #718096;
  line-height: 1.6;
`;

export const FormSection = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 2.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

export const InputGroup = styled.div`
  margin-bottom: 2rem;
`;

export const Label = styled.label`
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    background-color: #f9fafb;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

export const FileUploadArea = styled.div`
  position: relative;
  border: 2px dashed ${props => props.$dragActive ? '#3b82f6' : '#d1d5db'};
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${props => props.$dragActive ? '#eff6ff' : '#fafafa'};

  &:hover {
    border-color: #3b82f6;
    background-color: #eff6ff;
  }
`;

export const HiddenFileInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }
`;

export const UploadContent = styled.div`
  pointer-events: none;
`;

export const UploadIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

export const UploadText = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

export const UploadHint = styled.div`
  font-size: 0.9rem;
  color: #6b7280;
`;

export const FileInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  pointer-events: none;
`;

export const FileIcon = styled.div`
  font-size: 2rem;
`;

export const FileName = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
`;

export const FileSize = styled.div`
  font-size: 0.9rem;
  color: #6b7280;
`;

export const GenerateButton = styled.button`
  width: 100%;
  padding: 1rem 2rem;
  background-color: #a93946;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background-color: #91212e;
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: #a93946;
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff40;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export const ProcessingStatus = styled.div`
  margin-top: 3rem;
  padding: 2rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

export const ProcessSteps = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ProcessStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: ${props => props.$active ? 1 : 0.5};
  transition: opacity 0.3s;
`;

export const StepNumber = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.$active ? '#3b82f6' : '#e5e7eb'};
  color: ${props => props.$active ? 'white' : '#6b7280'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 0.5rem;
  transition: all 0.3s;
`;

export const StepText = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
  text-align: center;
`;