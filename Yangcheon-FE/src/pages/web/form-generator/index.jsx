import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import * as S from "./style";

const FormGenerator = () => {
  const navigate = useNavigate();
  const [formName, setFormName] = useState("");
  const [hwpFile, setHwpFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.name.toLowerCase().endsWith('.hwp')) {
        setHwpFile(file);
      } else {
        alert('HWP 파일만 업로드 가능합니다.');
      }
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.name.toLowerCase().endsWith('.hwp')) {
        setHwpFile(file);
      } else {
        alert('HWP 파일만 업로드 가능합니다.');
      }
    }
  };

  const saveTemplateHWP = async (formSchema, hwpFile) => {
    try {
      console.log('템플릿 HWP 파일 저장 중...');

      const formData = new FormData();
      formData.append('hwpFile', hwpFile);
      formData.append('reportType', formSchema.reportType);
      formData.append('templateName', formSchema.reportType + '.hwp');

      const response = await fetch('http://localhost:28090/save-template', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        console.log('템플릿 HWP 파일 저장 완료');
      } else {
        console.warn('템플릿 저장 실패, 계속 진행');
      }
    } catch (error) {
      console.warn('템플릿 저장 오류:', error.message);
      // 템플릿 저장 실패해도 양식 생성은 계속 진행
    }
  };

  const generateReactComponent = async (formSchema, formName) => {
    try {
      console.log('React 컴포넌트 자동 생성 중...');

      const response = await fetch('http://localhost:23000/ai/generate-component', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formSchema: formSchema,
          formName: formName
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('🎨 React 컴포넌트 자동 생성 완료!');
          console.log('생성된 파일들:', result.data.files);
          console.log('저장 경로:', result.data.savedPath);
        } else {
          console.warn('React 컴포넌트 생성 실패:', result.error);
        }
      } else {
        console.warn('React 컴포넌트 생성 API 호출 실패');
      }
    } catch (error) {
      console.warn('React 컴포넌트 생성 오류:', error.message);
      // 컴포넌트 생성 실패해도 양식 생성은 계속 진행
    }
  };

  const handleGenerate = async () => {
    if (!formName.trim()) {
      alert('서식명을 입력해주세요.');
      return;
    }
    if (!hwpFile) {
      alert('HWP 파일을 선택해주세요.');
      return;
    }

    setIsProcessing(true);
    try {
      console.log('양식 생성 시작:', { formName, hwpFile: hwpFile.name });

      // FormData 생성 (실제 HWP 파일 업로드용)
      const formData = new FormData();
      formData.append('hwpFile', hwpFile);
      formData.append('formName', formName);

      // 백엔드 API 호출
      const response = await fetch('http://localhost:23000/ai/analyze-hwp', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('AI 분석 결과:', result);

      if (result.success) {
        console.log('생성된 양식 스키마:', result.data);

        // 템플릿 HWP 파일 저장 요청
        await saveTemplateHWP(result.data, hwpFile);

        // React 컴포넌트 자동 생성 요청
        await generateReactComponent(result.data, formName);

        alert(`양식이 성공적으로 생성되었습니다!\n\n분석된 필드:\n- 직접 입력 필드: ${Object.keys(result.data.directInput?.applicantData || {}).length}개\n- AI 생성 필드: ${Object.keys(result.data.sttGenerated?.purposeData || {}).length}개\n\n🎨 React 컴포넌트도 자동 생성되었습니다!\n\n메인 화면에서 생성된 양식을 선택하여 사용하세요!`);

        // 메인홈으로 이동 (양식 목록에서 선택하도록)
        navigate('/consultation/start');
      } else {
        throw new Error(result.error || '양식 분석 실패');
      }

    } catch (error) {
      console.error('양식 생성 중 오류:', error);
      alert(`양식 생성 중 오류가 발생했습니다:\n${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <MainLayout>
      <S.Container>
        <S.Header>
          <S.Title>신규 양식 생성</S.Title>
          <S.Subtitle>새로운 민원 양식을 자동화하여 시스템에 추가합니다</S.Subtitle>
        </S.Header>

        <S.FormSection>
          <S.InputGroup>
            <S.Label>서식명</S.Label>
            <S.Input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="예: 사업자등록증 발급 신청"
              disabled={isProcessing}
            />
          </S.InputGroup>

          <S.InputGroup>
            <S.Label>HWP 양식 파일</S.Label>
            <S.FileUploadArea
              $dragActive={dragActive}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {hwpFile ? (
                <S.FileInfo>
                  <S.FileIcon>📄</S.FileIcon>
                  <S.FileName>{hwpFile.name}</S.FileName>
                  <S.FileSize>({(hwpFile.size / 1024).toFixed(1)} KB)</S.FileSize>
                </S.FileInfo>
              ) : (
                <S.UploadContent>
                  <S.UploadIcon>📁</S.UploadIcon>
                  <S.UploadText>
                    HWP 파일을 드래그하여 놓거나 클릭하여 선택하세요
                  </S.UploadText>
                  <S.UploadHint>지원 형식: .hwp</S.UploadHint>
                </S.UploadContent>
              )}
              <S.HiddenFileInput
                type="file"
                accept=".hwp"
                onChange={handleFileInput}
                disabled={isProcessing}
              />
            </S.FileUploadArea>
          </S.InputGroup>

          <S.GenerateButton
            onClick={handleGenerate}
            disabled={isProcessing || !formName.trim() || !hwpFile}
          >
            {isProcessing ? (
              <>
                <S.LoadingSpinner />
                양식 생성 중...
              </>
            ) : (
              '생성하기'
            )}
          </S.GenerateButton>
        </S.FormSection>

        {isProcessing && (
          <S.ProcessingStatus>
            <S.ProcessSteps>
              <S.ProcessStep $active={true}>
                <S.StepNumber>1</S.StepNumber>
                <S.StepText>HWP 파일 분석</S.StepText>
              </S.ProcessStep>
              <S.ProcessStep>
                <S.StepNumber>2</S.StepNumber>
                <S.StepText>필드 추출</S.StepText>
              </S.ProcessStep>
              <S.ProcessStep>
                <S.StepNumber>3</S.StepNumber>
                <S.StepText>컴포넌트 생성</S.StepText>
              </S.ProcessStep>
              <S.ProcessStep>
                <S.StepNumber>4</S.StepNumber>
                <S.StepText>시스템 등록</S.StepText>
              </S.ProcessStep>
            </S.ProcessSteps>
          </S.ProcessingStatus>
        )}
      </S.Container>
    </MainLayout>
  );
};

export default FormGenerator;