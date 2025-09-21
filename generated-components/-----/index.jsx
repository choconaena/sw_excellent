// React 컴포넌트 전체 코드
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import MainLayout from '../layouts/MainLayout';
import { CanvasDraw } from 'react-canvas-draw';
import axios from 'axios';
import {
  FormWrapper,
  StepWrapper,
  InputField,
  TextAreaField,
  Button
} from './style';

const 테스트양식Form = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    reason: ''
  });
  const [errors, setErrors] = useState({});
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1 && !formData.name) {
      newErrors.name = '성명을 입력해주세요.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    const signatureData = canvasRef.current.getSaveData();
    try {
      const response = await axios.post('http://localhost:28091/generate-hwp', {
        ...formData,
        signature: signatureData
      });
      const blob = new Blob([response.data], { type: 'application/hwp' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'test_form.hwp';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Error generating HWP:', error);
    }
  };

  return (
    <MainLayout>
      <FormWrapper>
        {step === 1 && (
          <StepWrapper>
            <h2>기본정보</h2>
            <InputField>
              <label>성명</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && <span>{errors.name}</span>}
            </InputField>
            <Button onClick={handleNext}>다음</Button>
          </StepWrapper>
        )}
        {step === 2 && (
          <StepWrapper>
            <h2>신청정보</h2>
            <TextAreaField>
              <label>신청 사유</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
              />
            </TextAreaField>
            <Button onClick={handlePrev}>이전</Button>
            <Button onClick={handleNext}>다음</Button>
          </StepWrapper>
        )}
        {step === 3 && (
          <StepWrapper>
            <h2>서명</h2>
            <CanvasDraw ref={canvasRef} canvasWidth={400} canvasHeight={200} />
            <Button onClick={handlePrev}>이전</Button>
            <Button onClick={handleSubmit}>제출</Button>
          </StepWrapper>
        )}
      </FormWrapper>
    </MainLayout>
  );
};

export default 테스트양식Form;
