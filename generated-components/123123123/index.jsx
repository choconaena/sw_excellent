// React 컴포넌트 전체 코드
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import MainLayout from '../layouts/MainLayout';
import axios from 'axios';

import {
  StepContainer,
  FormGroup,
  Label,
  Input,
  TextArea,
  RadioGroup,
  RadioButton,
  Button,
  ErrorText,
  Canvas,
} from './style';

const initialFormState = {
  name: '',
  birthDate: '',
  address: '',
  phone: '',
  issueType: '',
  applicationReason: '',
  usagePurpose: '',
  signature: null,
};

const 123123123Form = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.name) newErrors.name = '성명을 입력하세요.';
      if (!formData.birthDate) newErrors.birthDate = '생년월일을 입력하세요.';
      if (!formData.address) newErrors.address = '주소를 입력하세요.';
      if (!formData.phone) newErrors.phone = '전화번호를 입력하세요.';
    } else if (step === 2) {
      if (!formData.issueType) newErrors.issueType = '발급 구분을 선택하세요.';
    } else if (step === 3) {
      if (!formData.signature) newErrors.signature = '서명을 입력하세요.';
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
    if (validateStep()) {
      try {
        const response = await axios.post('http://localhost:28091/generate-hwp', formData, {
          responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'test_generated.hwp');
        document.body.appendChild(link);
        link.click();
        navigate('/');
      } catch (error) {
        console.error('Error generating HWP:', error);
      }
    }
  };

  const handleCanvasClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFormData({ ...formData, signature: null });
  };

  const handleCanvasSave = () => {
    const canvas = canvasRef.current;
    const signature = canvas.toDataURL();
    setFormData({ ...formData, signature });
  };

  return (
    <MainLayout>
      <StepContainer>
        {step === 1 && (
          <div>
            <FormGroup>
              <Label>성명</Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="홍길동"
              />
              {errors.name && <ErrorText>{errors.name}</ErrorText>}
            </FormGroup>
            <FormGroup>
              <Label>생년월일</Label>
              <Input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
              />
              {errors.birthDate && <ErrorText>{errors.birthDate}</ErrorText>}
            </FormGroup>
            <FormGroup>
              <Label>주소</Label>
              <Input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
              {errors.address && <ErrorText>{errors.address}</ErrorText>}
            </FormGroup>
            <FormGroup>
              <Label>전화번호</Label>
              <Input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && <ErrorText>{errors.phone}</ErrorText>}
            </FormGroup>
          </div>
        )}

        {step === 2 && (
          <div>
            <FormGroup>
              <Label>발급 구분</Label>
              <RadioGroup>
                <RadioButton>
                  <input
                    type="radio"
                    name="issueType"
                    value="신규발급"
                    checked={formData.issueType === '신규발급'}
                    onChange={handleChange}
                  />
                  신규발급
                </RadioButton>
                <RadioButton>
                  <input
                    type="radio"
                    name="issueType"
                    value="재발급"
                    checked={formData.issueType === '재발급'}
                    onChange={handleChange}
                  />
                  재발급
                </RadioButton>
              </RadioGroup>
              {errors.issueType && <ErrorText>{errors.issueType}</ErrorText>}
            </FormGroup>
          </div>
        )}

        {step === 3 && (
          <div>
            <FormGroup>
              <Label>신청인 서명</Label>
              <Canvas ref={canvasRef} width={300} height={150} />
              <Button onClick={handleCanvasClear}>지우기</Button>
              <Button onClick={handleCanvasSave}>저장</Button>
              {errors.signature && <ErrorText>{errors.signature}</ErrorText>}
            </FormGroup>
          </div>
        )}

        <div>
          {step > 1 && <Button onClick={handlePrev}>이전</Button>}
          {step < 3 && <Button onClick={handleNext}>다음</Button>}
          {step === 3 && <Button onClick={handleSubmit}>제출</Button>}
        </div>
      </StepContainer>
    </MainLayout>
  );
};

export default 123123123Form;
