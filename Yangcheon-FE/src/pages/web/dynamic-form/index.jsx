import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import * as S from "./style";

const DynamicForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signature, setSignature] = useState(null);
  const [formSchema, setFormSchema] = useState(null);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // 양식 스키마를 location.state에서 받음
  useEffect(() => {
    if (location.state?.formSchema) {
      setFormSchema(location.state.formSchema);
      console.log('받은 양식 스키마:', location.state.formSchema);
    } else {
      // 스키마가 없으면 메인으로 이동
      navigate('/consultation/start');
    }
  }, [location.state, navigate]);

  if (!formSchema) {
    return (
      <MainLayout>
        <S.Container>
          <S.LoadingMessage>양식을 불러오는 중...</S.LoadingMessage>
        </S.Container>
      </MainLayout>
    );
  }

  const steps = [
    { title: "기본 정보", fields: formSchema.directInput?.applicantData || {} },
    { title: "신청 정보", fields: formSchema.directInput?.documentData || {} },
    { title: "서명", fields: formSchema.directInput?.signature || {} }
  ];

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSignature = (signatureData) => {
    setSignature(signatureData);
    setFormData(prev => ({
      ...prev,
      signature: signatureData
    }));
  };

  // 캔버스 서명 관련 함수들
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      const dataURL = canvas.toDataURL();
      handleSignature(dataURL);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
    setFormData(prev => {
      const newData = { ...prev };
      delete newData.signature;
      return newData;
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // STT 생성 필드들의 AI 프롬프트를 이용해 자동 생성
      const sttData = {};
      if (formSchema.sttGenerated?.purposeData) {
        Object.entries(formSchema.sttGenerated.purposeData).forEach(([key, field]) => {
          // 실제로는 STT 데이터에서 AI가 생성하지만, 여기서는 시뮬레이션
          sttData[key] = `[AI 생성] ${field.label}에 대한 내용입니다.`;
        });
      }

      const completeFormData = {
        reportType: formSchema.reportType,
        file_name: formSchema.file_name,
        items: {
          ...formData,
          ...sttData
        }
      };

      console.log('완성된 양식 데이터:', completeFormData);

      // HWP 생성 API 호출 (generate_server 사용)
      const formData = new FormData();
      formData.append('data', JSON.stringify(completeFormData));

      // 서명 이미지가 있으면 추가
      if (signature) {
        // Data URL을 Blob으로 변환
        const base64Data = signature.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        formData.append('images', blob, 'signature.png');
      }

      const response = await fetch('http://localhost:28091/', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        // HWP 파일 다운로드
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = formSchema.file_name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        alert('양식이 성공적으로 생성되어 다운로드되었습니다!');
        navigate('/consultation/start');
      } else {
        throw new Error('HWP 생성 실패');
      }

    } catch (error) {
      console.error('양식 제출 오류:', error);
      alert('양식 제출 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (fieldName, fieldConfig) => {
    const value = formData[fieldName] || '';

    switch (fieldConfig.type) {
      case 'text':
        return (
          <S.InputGroup key={fieldName}>
            <S.Label required={fieldConfig.required}>
              {fieldConfig.label}
              {fieldConfig.required && <span className="required">*</span>}
            </S.Label>
            <S.Input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              placeholder={fieldConfig.placeholder}
              required={fieldConfig.required}
            />
            {fieldConfig.validation && (
              <S.ValidationText>{fieldConfig.validation}</S.ValidationText>
            )}
          </S.InputGroup>
        );

      case 'date':
        return (
          <S.InputGroup key={fieldName}>
            <S.Label required={fieldConfig.required}>
              {fieldConfig.label}
              {fieldConfig.required && <span className="required">*</span>}
            </S.Label>
            <S.Input
              type="date"
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              required={fieldConfig.required}
            />
            {fieldConfig.validation && (
              <S.ValidationText>{fieldConfig.validation}</S.ValidationText>
            )}
          </S.InputGroup>
        );

      case 'radio':
        return (
          <S.InputGroup key={fieldName}>
            <S.Label required={fieldConfig.required}>
              {fieldConfig.label}
              {fieldConfig.required && <span className="required">*</span>}
            </S.Label>
            <S.RadioGroup>
              {fieldConfig.options?.map((option, index) => (
                <S.RadioOption key={index}>
                  <input
                    type="radio"
                    id={`${fieldName}_${index}`}
                    name={fieldName}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleInputChange(fieldName, e.target.value)}
                    required={fieldConfig.required}
                  />
                  <label htmlFor={`${fieldName}_${index}`}>{option}</label>
                </S.RadioOption>
              ))}
            </S.RadioGroup>
          </S.InputGroup>
        );

      case 'canvas':
        return (
          <S.InputGroup key={fieldName}>
            <S.Label required={fieldConfig.required}>
              {fieldConfig.label}
              {fieldConfig.required && <span className="required">*</span>}
            </S.Label>
            <S.SignatureCanvas
              ref={canvasRef}
              width={400}
              height={200}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            <S.SignatureControls>
              <button type="button" onClick={clearSignature}>
                서명 지우기
              </button>
              {signature && (
                <span style={{color: '#4CAF50', fontSize: '14px'}}>
                  ✓ 서명 완료
                </span>
              )}
            </S.SignatureControls>
            {fieldConfig.description && (
              <S.ValidationText>{fieldConfig.description}</S.ValidationText>
            )}
          </S.InputGroup>
        );

      default:
        return null;
    }
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = Object.entries(currentStepData.fields || {})
    .filter(([_, field]) => field.required)
    .every(([fieldName, _]) => formData[fieldName]);

  return (
    <MainLayout>
      <S.Container>
        <S.Header>
          <S.Title>{formSchema.reportType} 신청</S.Title>
          <S.StepIndicator>
            {steps.map((step, index) => (
              <S.Step key={index} $active={index === currentStep} $completed={index < currentStep}>
                <S.StepNumber>{index + 1}</S.StepNumber>
                <S.StepTitle>{step.title}</S.StepTitle>
              </S.Step>
            ))}
          </S.StepIndicator>
        </S.Header>

        <S.FormSection>
          <S.StepTitle>{currentStepData.title}</S.StepTitle>

          {/* 안내사항 표시 */}
          {formSchema.instructions && currentStep === 0 && (
            <S.InstructionBox>
              <S.InstructionTitle>📋 작성 안내</S.InstructionTitle>
              {formSchema.instructions.map((instruction, index) => (
                <S.InstructionItem key={index}>{instruction}</S.InstructionItem>
              ))}
            </S.InstructionBox>
          )}

          {/* 현재 단계 필드들 렌더링 */}
          <S.FieldsContainer>
            {Object.entries(currentStepData.fields || {}).map(([fieldName, fieldConfig]) =>
              renderField(fieldName, fieldConfig)
            )}
          </S.FieldsContainer>

          {/* STT 생성 필드 미리보기 (마지막 단계에서) */}
          {isLastStep && formSchema.sttGenerated?.purposeData && (
            <S.PreviewSection>
              <S.PreviewTitle>🤖 AI가 자동으로 생성할 내용</S.PreviewTitle>
              {Object.entries(formSchema.sttGenerated.purposeData).map(([key, field]) => (
                <S.PreviewItem key={key}>
                  <S.PreviewLabel>{field.label}</S.PreviewLabel>
                  <S.PreviewDescription>{field.aiPrompt}</S.PreviewDescription>
                </S.PreviewItem>
              ))}
            </S.PreviewSection>
          )}
        </S.FormSection>

        <S.ButtonGroup>
          {currentStep > 0 && (
            <S.SecondaryButton onClick={handlePrevStep}>
              이전
            </S.SecondaryButton>
          )}

          {!isLastStep ? (
            <S.PrimaryButton onClick={handleNextStep} disabled={!canProceed}>
              다음
            </S.PrimaryButton>
          ) : (
            <S.PrimaryButton
              onClick={handleSubmit}
              disabled={!canProceed || isSubmitting}
            >
              {isSubmitting ? '생성 중...' : 'HWP 문서 생성'}
            </S.PrimaryButton>
          )}
        </S.ButtonGroup>
      </S.Container>
    </MainLayout>
  );
};

export default DynamicForm;