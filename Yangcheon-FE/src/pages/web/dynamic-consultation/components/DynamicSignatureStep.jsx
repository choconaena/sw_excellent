import { useState, useRef, useEffect } from "react";
import * as S from "../style";

const DynamicSignatureStep = ({
  formName,
  canComplete,
  onSignature,
  onComplete,
  onPrev,
  sendToRoom
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    context.strokeStyle = '#000000';
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const context = canvas.getContext('2d');
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const context = canvas.getContext('2d');
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setHasSignature(true);

      // 서명 데이터를 부모 컴포넌트로 전달
      const canvas = canvasRef.current;
      const signatureData = canvas.toDataURL();
      onSignature(signatureData);

      // 태블릿으로 서명 완료 알림
      sendToRoom({
        msg: { msg_type: "sign_done", content: { completed: true } }
      });
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSignature(null);
  };

  const handleComplete = () => {
    if (canComplete && hasSignature) {
      onComplete();
    }
  };

  // 터치 이벤트 핸들러 (모바일 지원)
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvasRef.current.dispatchEvent(mouseEvent);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvasRef.current.dispatchEvent(mouseEvent);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    canvasRef.current.dispatchEvent(mouseEvent);
  };

  return (
    <S.FormContainer>
      <S.StepHeader>
        <S.StepTitle>전자 서명</S.StepTitle>
        <S.StepIndicator>서명 단계</S.StepIndicator>
      </S.StepHeader>

      <S.FormContent>
        <S.SignatureSection>
          <S.SignatureTitle>
            {formName} 전자 서명
          </S.SignatureTitle>

          <S.SignatureNotice>
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '2rem',
              borderRadius: '12px',
              textAlign: 'center',
              margin: '2rem 0'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                📱 태블릿에서 서명을 진행해주세요
              </div>
              <div style={{ fontSize: '1.1rem', color: '#666', lineHeight: '1.6' }}>
                민원인께서 태블릿 화면에 직접 서명하시면<br/>
                자동으로 서명이 완료됩니다.
              </div>
              {!canComplete && (
                <S.SignatureWarning>
                  ⚠️ 태블릿에서 서명이 완료되면 제출 버튼이 활성화됩니다.
                </S.SignatureWarning>
              )}
            </div>
          </S.SignatureNotice>

          <S.SignatureActions>
            <S.SignatureStatus $hasSignature={hasSignature}>
              {hasSignature ? "✓ 서명 완료" : "서명을 작성해주세요"}
            </S.SignatureStatus>
          </S.SignatureActions>
        </S.SignatureSection>

        <S.CompletionSection>
          <S.CompletionTitle>제출 안내</S.CompletionTitle>
          <S.CompletionText>
            모든 정보 입력과 서명이 완료되면 HWP 문서가 자동으로 생성되어 다운로드됩니다.
          </S.CompletionText>

          {canComplete ? (
            <S.CompletionReady>
              ✅ 제출 준비가 완료되었습니다!
            </S.CompletionReady>
          ) : (
            <S.CompletionPending>
              ⏳ 태블릿에서 서명을 완료해주세요...
            </S.CompletionPending>
          )}
        </S.CompletionSection>
      </S.FormContent>

      <S.ButtonGroup>
        <S.SecondaryButton onClick={onPrev}>
          이전
        </S.SecondaryButton>
        <S.PrimaryButton
          onClick={handleComplete}
          disabled={!canComplete || !hasSignature}
          $disabled={!canComplete || !hasSignature}
        >
          {canComplete && hasSignature ? "문서 생성 및 완료" : "서명 대기 중..."}
        </S.PrimaryButton>
      </S.ButtonGroup>
    </S.FormContainer>
  );
};

export default DynamicSignatureStep;