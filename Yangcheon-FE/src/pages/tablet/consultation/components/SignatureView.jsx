// src/views/tablet/Consultation/components/ConsentSignatureView.jsx
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import * as S from "../style";
import { submitAppSignature } from "../../../../services/consultationService";
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

const PreviewPanel = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  margin: 0.5rem auto 1rem;
  padding: 0.8rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  max-width: 640px;
`;
const PreviewImg = styled.img`
  max-height: 120px;
  max-width: 280px;
  object-fit: contain;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #f1f3f5;
`;
const Meta = styled.div`
  font-size: 0.95rem;
  color: #444;
  line-height: 1.4;
`;

const SignatureView = ({ onComplete }) => {
  const { reportId } = useReportStore();

  // room & ws
  const email = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = email ? String(email) : null;
  const { send } = useRoomBus(room, {}, { tag: "signature" });

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingRef = useRef(false);
  const currentStrokeRef = useRef(null);

  const [strokes, setStrokes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false); // ✅ 업로드 완료 상태

  const [previewUrl, setPreviewUrl] = useState("");
  const [previewSize, setPreviewSize] = useState(0);

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

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    let x, y, p;
    if ("clientX" in e) {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
      p = e.pressure ?? 0.5;
    } else if (e.touches && e.touches[0]) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
      p = 0.5;
    } else {
      x = 0;
      y = 0;
      p = 0.5;
    }
    return { x, y, p };
  };

  const onPointerDown = (e) => {
    if (submitted || loading) return; // ✅ 잠금
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
    if (submitted) return; // ✅ 잠금
    setStrokes([]);
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
      setPreviewSize(0);
    }
  };

  // const undo = () => {
  //   if (submitted) return; // ✅ 잠금
  //   setStrokes((prev) => {
  //     const next = prev.slice(0, -1);
  //     setTimeout(redrawAll, 0);
  //     return next;
  //   });
  // };

  const toBlob = (canvas) =>
    new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/png", 0.92)
    );

  const handleComplete = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!reportId) {
      alert("reportId가 없습니다. STT 세션을 시작한 뒤 다시 시도해 주세요.");
      return;
    }

    const isEmpty =
      strokes.length === 0 || strokes.every((s) => s.points.length === 0);
    if (isEmpty) {
      alert("서명이 없습니다. 화면에 서명해 주세요.");
      return;
    }

    try {
      setLoading(true);
      const blob = await toBlob(canvas);

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewSize(blob.size);

      const result = await submitAppSignature({ reportId, blob });

      // 웹에게 서명 완료 신호
      send({ msg: { msg_type: "sign_done", content: null } });

      // ✅ 완료 상태로 전환 → 툴바 숨김 + 캔버스 잠금
      setSubmitted(true);

      alert(result?.msg || "서명이 전송되었습니다.");

      const dataUrl = canvas.toDataURL("image/png");
      onComplete?.({ dataUrl, blob, result });
    } catch (err) {
      console.error("서명 업로드 실패:", err);
      let msg = err?.message || "업로드 중 오류가 발생했습니다.";
      try {
        const j = JSON.parse(msg);
        msg = j?.message || j?.msg || msg;
      } catch (e) {
        void e;
      }
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    resizeCanvas();
    const onResize = () => resizeCanvas();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    redrawAll();
  }, [strokes]);

  return (
    <S.SignatureScreen>
      <S.FormHeader>
        <S.FormTitle>전자 서명</S.FormTitle>
        <S.FormSubtitle>
          화면을 통해 서명해 주시면 상담이 마무리됩니다.
        </S.FormSubtitle>
      </S.FormHeader>

      {/* 잠금 타깃 ref 부착 */}
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

      {previewUrl && (
        <PreviewPanel>
          <PreviewImg src={previewUrl} alt="서명 미리보기" />
          <Meta>
            <div>
              <b>파일 타입</b>: image/png
            </div>
            <div>
              <b>크기</b>: {(previewSize / 1024).toFixed(1)} KB
            </div>
            {submitted && (
              <div>
                <b>상태</b>: 전송 완료
              </div>
            )}
            <div>
              <a href={previewUrl} download="signature.png">
                이미지 다운로드
              </a>
            </div>
          </Meta>
        </PreviewPanel>
      )}

      {/* ✅ 업로드 완료 후 툴바 숨김 */}
      {!submitted && (
        <Toolbar>
          {/* <ToolButton onClick={undo} disabled={strokes.length === 0 || loading}>
            되돌리기
          </ToolButton> */}
          <ToolButton
            onClick={clearAll}
            disabled={strokes.length === 0 || loading}
          >
            전체 삭제
          </ToolButton>
          <S.FormButton onClick={handleComplete} disabled={loading}>
            {loading ? "업로드 중..." : "완료"}
          </S.FormButton>
        </Toolbar>
      )}
    </S.SignatureScreen>
  );
};

export default SignatureView;
