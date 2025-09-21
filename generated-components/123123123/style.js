// styled-components 스타일 코드
import styled from 'styled-components';

export const StepContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

export const FormGroup = styled.div`
  margin-bottom: 15px;
  width: 100%;
  max-width: 400px;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

export const Input = styled.input`
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
`;

export const RadioGroup = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const RadioButton = styled.label`
  display: flex;
  align-items: center;
`;

export const Button = styled.button`
  padding: 10px 20px;
  margin: 5px;
  cursor: pointer;
`;

export const ErrorText = styled.span`
  color: red;
  font-size: 12px;
`;

export const Canvas = styled.canvas`
  border: 1px solid #000;
  margin-bottom: 10px;
`;
