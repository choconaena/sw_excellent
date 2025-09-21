import { useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import * as S from "./style";

const FormGenerator = () => {
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
      // TODO: 실제 처리 로직 구현
      console.log('양식 생성 시작:', { formName, hwpFile: hwpFile.name });

      // 임시로 3초 대기
      await new Promise(resolve => setTimeout(resolve, 3000));

      alert('양식이 성공적으로 생성되었습니다!');

      // 초기화
      setFormName("");
      setHwpFile(null);
    } catch (error) {
      console.error('양식 생성 중 오류:', error);
      alert('양식 생성 중 오류가 발생했습니다.');
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