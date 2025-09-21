import { useState, useEffect } from "react";
import * as S from "../style";

const DynamicFormStep = ({
  formSchema,
  currentStep,
  formData,
  onInputChange,
  onNext,
  onPrev,
  totalSteps,
  sendToRoom
}) => {
  const [errors, setErrors] = useState({});

  if (!formSchema?.directInput) return null;

  // directInput의 키들을 단계별로 나누기
  const inputGroups = Object.keys(formSchema.directInput);
  const currentGroupKey = inputGroups[currentStep - 1];
  const currentGroup = formSchema.directInput[currentGroupKey];

  if (!currentGroup) return null;

  const validateCurrentStep = () => {
    const newErrors = {};
    Object.entries(currentGroup).forEach(([fieldName, field]) => {
      if (field.required && (!formData[fieldName] || formData[fieldName].trim() === "")) {
        newErrors[fieldName] = `${field.label}을(를) 입력해주세요.`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      onNext();
    }
  };

  const renderField = (fieldName, field) => {
    const value = formData[fieldName] || "";

    switch (field.type) {
      case "text":
        return (
          <S.InputField key={fieldName}>
            <S.Label required={field.required}>
              {field.label}
              {field.required && <span> *</span>}
            </S.Label>
            <S.Input
              type="text"
              value={value}
              onChange={(e) => onInputChange(fieldName, e.target.value)}
              placeholder={field.placeholder || `${field.label}을(를) 입력하세요`}
            />
            {errors[fieldName] && <S.ErrorText>{errors[fieldName]}</S.ErrorText>}
          </S.InputField>
        );

      case "textarea":
        return (
          <S.InputField key={fieldName}>
            <S.Label required={field.required}>
              {field.label}
              {field.required && <span> *</span>}
            </S.Label>
            <S.TextArea
              value={value}
              onChange={(e) => onInputChange(fieldName, e.target.value)}
              placeholder={field.placeholder || `${field.label}을(를) 입력하세요`}
              rows={4}
            />
            {errors[fieldName] && <S.ErrorText>{errors[fieldName]}</S.ErrorText>}
          </S.InputField>
        );

      case "select":
        return (
          <S.InputField key={fieldName}>
            <S.Label required={field.required}>
              {field.label}
              {field.required && <span> *</span>}
            </S.Label>
            <S.Select
              value={value}
              onChange={(e) => onInputChange(fieldName, e.target.value)}
            >
              <option value="">선택하세요</option>
              {field.options?.map((option, index) => (
                <option key={index} value={option.value || option}>
                  {option.label || option}
                </option>
              ))}
            </S.Select>
            {errors[fieldName] && <S.ErrorText>{errors[fieldName]}</S.ErrorText>}
          </S.InputField>
        );

      case "date":
        return (
          <S.InputField key={fieldName}>
            <S.Label required={field.required}>
              {field.label}
              {field.required && <span> *</span>}
            </S.Label>
            <S.Input
              type="date"
              value={value}
              onChange={(e) => onInputChange(fieldName, e.target.value)}
            />
            {errors[fieldName] && <S.ErrorText>{errors[fieldName]}</S.ErrorText>}
          </S.InputField>
        );

      case "tel":
        return (
          <S.InputField key={fieldName}>
            <S.Label required={field.required}>
              {field.label}
              {field.required && <span> *</span>}
            </S.Label>
            <S.Input
              type="tel"
              value={value}
              onChange={(e) => onInputChange(fieldName, e.target.value)}
              placeholder={field.placeholder || "010-0000-0000"}
            />
            {errors[fieldName] && <S.ErrorText>{errors[fieldName]}</S.ErrorText>}
          </S.InputField>
        );

      case "email":
        return (
          <S.InputField key={fieldName}>
            <S.Label required={field.required}>
              {field.label}
              {field.required && <span> *</span>}
            </S.Label>
            <S.Input
              type="email"
              value={value}
              onChange={(e) => onInputChange(fieldName, e.target.value)}
              placeholder={field.placeholder || "example@email.com"}
            />
            {errors[fieldName] && <S.ErrorText>{errors[fieldName]}</S.ErrorText>}
          </S.InputField>
        );

      default:
        return (
          <S.InputField key={fieldName}>
            <S.Label required={field.required}>
              {field.label}
              {field.required && <span> *</span>}
            </S.Label>
            <S.Input
              type="text"
              value={value}
              onChange={(e) => onInputChange(fieldName, e.target.value)}
              placeholder={field.placeholder || `${field.label}을(를) 입력하세요`}
            />
            {errors[fieldName] && <S.ErrorText>{errors[fieldName]}</S.ErrorText>}
          </S.InputField>
        );
    }
  };

  // 단계별 제목 생성
  const getStepTitle = () => {
    const titles = {
      'applicantData': '신청인 정보',
      'applicationData': '신청 정보',
      'businessData': '사업 정보',
      'personalData': '개인 정보',
      'contactData': '연락처 정보',
      'addressData': '주소 정보'
    };
    return titles[currentGroupKey] || `${currentStep}단계`;
  };

  return (
    <S.FormContainer>
      <S.StepHeader>
        <S.StepTitle>{getStepTitle()}</S.StepTitle>
        <S.StepIndicator>
          {currentStep} / {totalSteps}
        </S.StepIndicator>
      </S.StepHeader>

      <S.FormContent>
        {Object.entries(currentGroup).map(([fieldName, field]) =>
          renderField(fieldName, field)
        )}
      </S.FormContent>

      <S.ButtonGroup>
        {currentStep > 1 && (
          <S.SecondaryButton onClick={onPrev}>
            이전
          </S.SecondaryButton>
        )}
        <S.PrimaryButton onClick={handleNext}>
          다음
        </S.PrimaryButton>
      </S.ButtonGroup>
    </S.FormContainer>
  );
};

export default DynamicFormStep;