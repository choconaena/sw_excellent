import { useState } from "react";
import * as S from "../../consultation/style"; // 정보공개청구와 동일한 스타일 사용

const DynamicFormView = ({
  formSchema,
  formName,
  currentSubstep,
  formData,
  onInputChange,
  sendToRoom
}) => {
  const [errors, setErrors] = useState({});

  if (!formSchema?.directInput) {
    return (
      <S.FormScreen>
        <S.FormHeader>
          <S.FormTitle>양식 로딩 중</S.FormTitle>
          <S.FormSubtitle>양식 스키마를 불러오는 중입니다...</S.FormSubtitle>
        </S.FormHeader>
      </S.FormScreen>
    );
  }

  // directInput의 키들을 단계별로 나누기
  const inputGroups = Object.keys(formSchema.directInput);
  const currentGroupKey = inputGroups[currentSubstep - 1];
  const currentGroup = formSchema.directInput[currentGroupKey];

  if (!currentGroup) {
    return (
      <S.FormScreen>
        <S.FormHeader>
          <S.FormTitle>단계 오류</S.FormTitle>
          <S.FormSubtitle>해당 단계가 존재하지 않습니다.</S.FormSubtitle>
        </S.FormHeader>
      </S.FormScreen>
    );
  }

  const renderField = (fieldName, field) => {
    const value = formData[fieldName] || "";

    switch (field.type) {
      case "text":
        return (
          <S.FormField key={fieldName}>
            <S.FieldLabel>
              {field.required && <S.Required>*</S.Required>}
              {field.label}
            </S.FieldLabel>
            <S.FormInput
              type="text"
              value={value}
              onChange={(e) => onInputChange(fieldName, e.target.value)}
              placeholder={field.placeholder || `${field.label}을(를) 입력하세요`}
            />
            {errors[fieldName] && <div style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: '0.5rem' }}>{errors[fieldName]}</div>}
          </S.FormField>
        );

      case "textarea":
        return (
          <S.FormField key={fieldName}>
            <S.FieldLabel>
              {field.required && <S.Required>*</S.Required>}
              {field.label}
            </S.FieldLabel>
            <S.TextArea
              value={value}
              onChange={(e) => onInputChange(fieldName, e.target.value)}
              placeholder={field.placeholder || `${field.label}을(를) 입력하세요`}
              rows={4}
            />
            {errors[fieldName] && <div style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: '0.5rem' }}>{errors[fieldName]}</div>}
          </S.FormField>
        );

      case "select":
        return (
          <S.FormField key={fieldName}>
            <S.FieldLabel>
              {field.required && <S.Required>*</S.Required>}
              {field.label}
            </S.FieldLabel>
            <S.FormInput
              as="select"
              value={value}
              onChange={(e) => onInputChange(fieldName, e.target.value)}
            >
              <option value="">선택하세요</option>
              {field.options?.map((option, index) => (
                <option key={index} value={option.value || option}>
                  {option.label || option}
                </option>
              ))}
            </S.FormInput>
            {errors[fieldName] && <div style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: '0.5rem' }}>{errors[fieldName]}</div>}
          </S.FormField>
        );

      case "date":
        return (
          <S.FormField key={fieldName}>
            <S.FieldLabel>
              {field.required && <S.Required>*</S.Required>}
              {field.label}
            </S.FieldLabel>
            <S.FormInput
              type="date"
              value={value}
              onChange={(e) => onInputChange(fieldName, e.target.value)}
            />
            {errors[fieldName] && <div style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: '0.5rem' }}>{errors[fieldName]}</div>}
          </S.FormField>
        );

      case "tel":
        return (
          <S.FormField key={fieldName}>
            <S.FieldLabel>
              {field.required && <S.Required>*</S.Required>}
              {field.label}
            </S.FieldLabel>
            <S.FormInput
              type="tel"
              value={value}
              onChange={(e) => onInputChange(fieldName, e.target.value)}
              placeholder={field.placeholder || "010-0000-0000"}
            />
            {errors[fieldName] && <div style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: '0.5rem' }}>{errors[fieldName]}</div>}
          </S.FormField>
        );

      case "email":
        return (
          <S.FormField key={fieldName}>
            <S.FieldLabel>
              {field.required && <S.Required>*</S.Required>}
              {field.label}
            </S.FieldLabel>
            <S.FormInput
              type="email"
              value={value}
              onChange={(e) => onInputChange(fieldName, e.target.value)}
              placeholder={field.placeholder || "example@email.com"}
            />
            {errors[fieldName] && <div style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: '0.5rem' }}>{errors[fieldName]}</div>}
          </S.FormField>
        );

      default:
        return (
          <S.FormField key={fieldName}>
            <S.FieldLabel>
              {field.required && <S.Required>*</S.Required>}
              {field.label}
            </S.FieldLabel>
            <S.FormInput
              type="text"
              value={value}
              onChange={(e) => onInputChange(fieldName, e.target.value)}
              placeholder={field.placeholder || `${field.label}을(를) 입력하세요`}
            />
            {errors[fieldName] && <div style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: '0.5rem' }}>{errors[fieldName]}</div>}
          </S.FormField>
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
    return titles[currentGroupKey] || `${currentSubstep}단계 정보`;
  };

  return (
    <S.FormScreen>
      <S.FormHeader>
        <S.FormTitle>{getStepTitle()}</S.FormTitle>
        <S.FormSubtitle>
          {formName} - {currentSubstep}/{inputGroups.length} 단계
        </S.FormSubtitle>
      </S.FormHeader>

      <S.FormContent>
        {Object.entries(currentGroup).map(([fieldName, field]) =>
          renderField(fieldName, field)
        )}

        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '12px',
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '1.1rem',
          color: '#666',
          lineHeight: '1.6'
        }}>
          ✏️ 위 항목들을 입력해주세요.<br/>
          📢 공무원 화면에서 다음 단계로 진행할 수 있습니다.
        </div>
      </S.FormContent>
    </S.FormScreen>
  );
};

export default DynamicFormView;