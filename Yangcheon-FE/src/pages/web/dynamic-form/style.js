import styled from 'styled-components';

export const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
`;

export const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

export const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 30px;
`;

export const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
`;

export const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 20px;
    left: 100%;
    width: 40px;
    height: 2px;
    background: ${props => props.$completed ? '#4CAF50' : '#ddd'};
    transform: translateX(-50%);
  }
`;

export const StepNumber = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props =>
    props.$active ? '#2196F3' :
    props.$completed ? '#4CAF50' : '#ddd'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 8px;
`;

export const StepTitle = styled.span`
  font-size: 14px;
  color: ${props => props.$active ? '#2196F3' : '#666'};
  font-weight: ${props => props.$active ? '600' : '400'};
`;

export const FormSection = styled.div`
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

export const InstructionBox = styled.div`
  background: #e3f2fd;
  border: 1px solid #2196F3;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
`;

export const InstructionTitle = styled.h3`
  color: #1976D2;
  margin-bottom: 15px;
  font-size: 18px;
`;

export const InstructionItem = styled.div`
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.6;
`;

export const FieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 16px;

  .required {
    color: #f44336;
    margin-left: 4px;
  }
`;

export const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #2196F3;
  }

  &:required:invalid {
    border-color: #f44336;
  }
`;

export const RadioGroup = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
`;

export const RadioOption = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  input[type="radio"] {
    width: 18px;
    height: 18px;
    accent-color: #2196F3;
  }

  label {
    font-size: 16px;
    color: #333;
    cursor: pointer;
  }
`;

export const ValidationText = styled.div`
  font-size: 14px;
  color: #666;
  font-style: italic;
`;

export const SignatureCanvas = styled.canvas`
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: crosshair;

  &:focus {
    border-color: #2196F3;
  }
`;

export const SignatureControls = styled.div`
  display: flex;
  gap: 10px;

  button {
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    color: #666;
    cursor: pointer;
    font-size: 14px;

    &:hover {
      background: #f5f5f5;
    }
  }
`;

export const PreviewSection = styled.div`
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
`;

export const PreviewTitle = styled.h3`
  color: #4CAF50;
  margin-bottom: 15px;
  font-size: 18px;
`;

export const PreviewItem = styled.div`
  margin-bottom: 15px;
  padding: 15px;
  background: white;
  border-radius: 6px;
  border-left: 4px solid #4CAF50;
`;

export const PreviewLabel = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
`;

export const PreviewDescription = styled.div`
  font-size: 14px;
  color: #666;
  font-style: italic;
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 20px;
`;

export const PrimaryButton = styled.button`
  flex: 1;
  max-width: 200px;
  padding: 16px 24px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover:not(:disabled) {
    background: #1976D2;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  margin-left: auto;
`;

export const SecondaryButton = styled.button`
  flex: 1;
  max-width: 200px;
  padding: 16px 24px;
  background: white;
  color: #666;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #2196F3;
    color: #2196F3;
  }
`;

export const LoadingMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  font-size: 18px;
  color: #666;
`;