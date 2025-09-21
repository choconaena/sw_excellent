// src/views/tablet/construction-equipment-operator/components/Signature1View.jsx
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import * as S from "../style";
import { useReportStore } from "../../../../store/useReportStore";
import { useAuthStore } from "../../../../store/authStore";
import { useRoomBus } from "../../../../ws/useRoomBus";
import { extractDataPayload } from "../../../../ws/parseWs";
import { submitConstructionSignature } from "../../../../services/constructionGovService";

const Signature1View = ({ onComplete }) => {
  // URL 쿼리에서 rid 받아서 store에 저장(있을 때만)
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const rid = searchParams.get("rid");
    if (rid) {
      useReportStore.getState().setReportMeta({ reportId: Number(rid) });
    }
  }, [searchParams]);

  // store 구독 (화면 표시용)
  //const { reportId } = useReportStore();

  // WS room
  const email = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = email ? String(email) : null;

  // 송신용
  const { send } = useRoomBus(
    room,
    {},
    { tag: "construction-signature1-send" }
  );

  // 수신용: 웹에서 data.reportid를 보내주면 store에 저장
  useRoomBus(
    room,
    {
      onMessage: (p) => {
        const patch = extractDataPayload(p);
        const rid = patch?.reportid;
        if (typeof rid !== "undefined") {
          useReportStore.getState().setReportMeta({ reportId: Number(rid) });
        }
      },
    },
    { tag: "construction-signature1-recv" }
  );

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingRef = useRef(false);
  const currentStrokeRef = useRef(null);

  const [strokes, setStrokes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [previewUrl, setPreviewUrl] = useState("");
  //const [previewSize, setPreviewSize] = useState(0);

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
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
      //setPreviewSize(0);
    }
  };

  // const undo = () => {
  //   if (submitted) return;
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

    // 업로드 직전, store의 최신 reportId를 즉시 조회
    const rid = useReportStore.getState().reportId;
    if (!rid) {
      alert("reportId가 없습니다. 웹에서 신청정보를 먼저 전송해 주세요.");
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
      //setPreviewSize(blob.size);

      // 서비스는 reportId를 인자로 주지 않아도 store 값을 사용
      const result = await submitConstructionSignature({ num: 1, blob });

      // 태블릿 → 웹: 서명 완료 신호
      send({ msg: { msg_type: "sign_done", content: { num: 1 } } });

      setSubmitted(true);
      alert(result?.message || "서명이 전송되었습니다.");

      const dataUrl = canvas.toDataURL("image/png");
      onComplete?.({ dataUrl, blob, result });
    } catch (err) {
      console.error("서명 전송 실패:", err);
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
          발급 신청을 위한 서명해 주시기 바랍니다.
        </S.FormSubtitle>
      </S.FormHeader>

      <S.SignatureArea>
        <S.Canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerLeave}
        />
      </S.SignatureArea>

      {/* {previewUrl && (
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            justifyContent: "center",
            margin: "0.5rem auto 1rem",
            padding: "0.8rem 1rem",
            border: "2px solid #e9ecef",
            borderRadius: "12px",
            maxWidth: 640,
          }}
        >
          <img
            src={previewUrl}
            alt="서명 미리보기"
            style={{
              maxHeight: 120,
              maxWidth: 280,
              objectFit: "contain",
              borderRadius: 8,
              background: "#fff",
              border: "1px solid #f1f3f5",
            }}
          />
          <div style={{ fontSize: "0.95rem", color: "#444", lineHeight: 1.4 }}>
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
              <a href={previewUrl} download="signature1.png">
                이미지 다운로드
              </a>
            </div>
          </div>
        </div>
      )} */}

      {!submitted && (
        <S.Toolbar>
          {/* <S.ToolButton
            onClick={undo}
            disabled={strokes.length === 0 || loading}
          >
            되돌리기
          </S.ToolButton> */}
          <S.ToolButton
            onClick={clearAll}
            disabled={strokes.length === 0 || loading}
          >
            전체 삭제
          </S.ToolButton>
          <S.FormButton onClick={handleComplete} disabled={loading}>
            {loading ? "업로드 중..." : "완료"}
          </S.FormButton>
        </S.Toolbar>
      )}
    </S.SignatureScreen>
  );
};

export default Signature1View;
