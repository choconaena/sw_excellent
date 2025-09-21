// styled-components 스타일 코드
import styled from 'styled-components';

export const FormWrapper = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const StepWrapper = styled.div`
  margin-bottom: 20px;
`;

export const InputField = styled.div`
  margin-bottom: 15px;
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  span {
    color: red;
    font-size: 12px;
  }
`;

export const TextAreaField = styled.div`
  margin-bottom: 15px;
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  textarea {
    width: 100%;
    height: 100px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
`;

export const Button = styled.button`
  padding: 10px 15px;
  margin-right: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;
