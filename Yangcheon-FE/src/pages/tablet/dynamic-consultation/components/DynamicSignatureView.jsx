import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import * as S from "../../consultation/style"; // 정보공개청구와 동일한 스타일 사용
import { useReportStore } from "../../../../store/useReportStore";
import { useAuthStore } from "../../../../store/authStore";
import { useRoomBus } from "../../../../ws/useRoomBus";

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  background: #fff;
  touch-action: none;
  cursor: crosshair;
  border-radius: 8px;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  flex-wrap: wrap;
`;

const ToolButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.7rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background-color: #5a6268;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DynamicSignatureView = ({
  formName,
  onSignature,
  sendToRoom
}) => {
  const { reportId } = useReportStore();

  // room & ws
  const email = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = email ? String(email) : null;
  const { send } = useRoomBus(room, {}, { tag: "dynamic-signature" });

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingRef = useRef(false);
  const currentStrokeRef = useRef(null);

  const [strokes, setStrokes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const color = "#000";
  const baseWidth = 2.2;

  const redrawAll = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    for (const s of strokes) {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      const pts = s.points;
      if (!pts || pts.length === 0) continue;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
    }
    ctx.restore();
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const dpr = Math.max(window.devicePixelRatio || 1, 1);
    const displayWidth = parent.clientWidth;
    const displayHeight = parent.clientHeight;
    canvas.width = Math.max(1, Math.floor(displayWidth * dpr));
    canvas.height = Math.max(1, Math.floor(displayHeight * dpr));
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = baseWidth;
    ctxRef.current = ctx;
    redrawAll();
  };

  useEffect(() => {
    resizeCanvas();
    const onResize = () => resizeCanvas();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    redrawAll();
  }, [strokes]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    let x, y;
    if ("clientX" in e) {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    } else if (e.touches && e.touches[0]) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = 0;
      y = 0;
    }
    return { x, y };
  };

  const onPointerDown = (e) => {
    if (submitted || loading) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    drawingRef.current = true;
    currentStrokeRef.current = { color, width: baseWidth, points: [{ x, y }] };
    const ctx = ctxRef.current;
    ctx.strokeStyle = color;
    ctx.lineWidth = baseWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const onPointerMove = (e) => {
    if (!drawingRef.current || submitted || loading) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    const ctx = ctxRef.current;
    const s = currentStrokeRef.current;
    s.points.push({ x, y });
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endStroke = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const s = currentStrokeRef.current;
    currentStrokeRef.current = null;
    if (s && s.points.length > 1) setStrokes((prev) => [...prev, s]);
  };

  const onPointerUp = (e) => {
    e.preventDefault();
    endStroke();
  };

  const onPointerLeave = (e) => {
    e.preventDefault();
    endStroke();
  };

  const clearAll = () => {
    if (submitted) return;
    setStrokes([]);
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const toBlob = (canvas) =>
    new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/png", 0.92)
    );

  const handleComplete = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isEmpty = strokes.length === 0 || strokes.every((s) => s.points.length === 0);
    if (isEmpty) {
      alert("서명이 없습니다. 화면에 서명해 주세요.");
      return;
    }

    try {
      setLoading(true);

      // 서명 데이터를 부모 컴포넌트로 전달
      const dataUrl = canvas.toDataURL("image/png");
      onSignature(dataUrl);

      // 웹에게 서명 완료 신호
      send({ msg: { msg_type: "sign_done", content: null } });

      // 완료 상태로 전환
      setSubmitted(true);

      alert("서명이 완료되었습니다.");

    } catch (err) {
      console.error("서명 처리 실패:", err);
      alert("서명 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <S.SignatureScreen>
      <S.FormHeader>
        <S.FormTitle>전자 서명</S.FormTitle>
        <S.FormSubtitle>
          {formName} 신청서에 서명해 주시면 상담이 마무리됩니다.
        </S.FormSubtitle>
      </S.FormHeader>

      <S.SignatureArea>
        <Canvas
          ref={canvasRef}
          $locked={loading || submitted}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerLeave}
        />
      </S.SignatureArea>

      {!submitted && (
        <Toolbar>
          <ToolButton
            onClick={clearAll}
            disabled={strokes.length === 0 || loading}
          >
            전체 삭제
          </ToolButton>
          <S.FormButton onClick={handleComplete} disabled={loading}>
            {loading ? "처리 중..." : "완료"}
          </S.FormButton>
        </Toolbar>
      )}

      {submitted && (
        <div style={{
          backgroundColor: '#d4edda',
          padding: '1.5rem',
          borderRadius: '12px',
          margin: '1rem 3rem',
          textAlign: 'center',
          fontSize: '1.2rem',
          color: '#155724',
          fontWeight: '600'
        }}>
          ✅ 서명이 완료되었습니다!<br/>
          공무원 화면에서 최종 제출을 진행해주세요.
        </div>
      )}
    </S.SignatureScreen>
  );
};

export default DynamicSignatureView;