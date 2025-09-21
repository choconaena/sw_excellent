// React 컴포넌트 전체 코드
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import MainLayout from '../layouts/MainLayout';
import { CanvasSignature } from '../components/CanvasSignature';
import { generateHWP } from '../api/hwp';
import {
  FormWrapper,
  StepWrapper,
  InputField,
  RadioGroup,
  TextArea,
  Button
} from './style';

const TestkillForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    address: '',
    phone: '',
    issueType: '',
    applicationReason: '',
    usagePurpose: '',
    applicantSignature: null
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSignature = (signature) => {
    setFormData({ ...formData, applicantSignature: signature });
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.name) newErrors.name = '성명을 입력해주세요.';
      if (!formData.birthDate) newErrors.birthDate = '생년월일을 입력해주세요.';
      if (!formData.address) newErrors.address = '주소를 입력해주세요.';
      if (!formData.phone) newErrors.phone = '전화번호를 입력해주세요.';
    } else if (step === 2) {
      if (!formData.issueType) newErrors.issueType = '발급 구분을 선택해주세요.';
      if (!formData.applicationReason) newErrors.applicationReason = '신청 사유를 입력해주세요.';
      if (!formData.usagePurpose) newErrors.usagePurpose = '용도를 입력해주세요.';
    } else if (step === 3) {
      if (!formData.applicantSignature) newErrors.applicantSignature = '서명을 입력해주세요.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await generateHWP(formData);
      const blob = new Blob([response.data], { type: 'application/hwp' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'testkill_generated.hwp';
      a.click();
      window.URL.revokeObjectURL(url);
      navigate('/');
    } catch (error) {
      console.error('HWP 생성 실패:', error);
    }
  };

  return (
    <MainLayout>
      <FormWrapper>
        {step === 1 && (
          <StepWrapper>
            <h2>기본정보</h2>
            <InputField
              type="text"
              name="name"
              placeholder="홍길동"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />
            <InputField
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              error={errors.birthDate}
            />
            <InputField
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
            />
            <InputField
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
            />
          </StepWrapper>
        )}
        {step === 2 && (
          <StepWrapper>
            <h2>신청정보</h2>
            <RadioGroup>
              <label>
                <input
                  type="radio"
                  name="issueType"
                  value="신규발급"
                  checked={formData.issueType === '신규발급'}
                  onChange={handleChange}
                />
                신규발급
              </label>
              <label>
                <input
                  type="radio"
                  name="issueType"
                  value="재발급"
                  checked={formData.issueType === '재발급'}
                  onChange={handleChange}
                />
                재발급
              </label>
            </RadioGroup>
            <TextArea
              name="applicationReason"
              value={formData.applicationReason}
              onChange={handleChange}
              error={errors.applicationReason}
            />
            <TextArea
              name="usagePurpose"
              value={formData.usagePurpose}
              onChange={handleChange}
              error={errors.usagePurpose}
            />
          </StepWrapper>
        )}
        {step === 3 && (
          <StepWrapper>
            <h2>서명</h2>
            <CanvasSignature
              onSignature={handleSignature}
              error={errors.applicantSignature}
            />
          </StepWrapper>
        )}
        <Button onClick={handleNext}>{step < 3 ? '다음' : '제출'}</Button>
      </FormWrapper>
    </MainLayout>
  );
};

export default TestkillForm;
