import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useRoomChannel } from "../../../ws/useRoomChannel";
import { useRoomBus } from "../../../ws/useRoomBus";
import { useAuthStore } from "../../../store/authStore";
import { extractDataPayload } from "../../../ws/parseWs";
import DynamicFormView from "./components/DynamicFormView";
import DynamicSignatureView from "./components/DynamicSignatureView";
import DynamicCompleteView from "./components/DynamicCompleteView";
import TabletHeader from "../../../components/tablet/Header";
import * as S from "../consultation/style"; // 정보공개청구와 동일한 스타일 사용

const TabletDynamicConsultation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formSchema, setFormSchema] = useState(null);
  const [formName, setFormName] = useState("");
  const [currentStep, setCurrentStep] = useState("form");
  const [currentSubstep, setCurrentSubstep] = useState(1);
  const [formData, setFormData] = useState({});
  const [signature, setSignature] = useState(null);

  // URL 파라미터에서 상태 읽기
  const urlFormName = searchParams.get("form");
  const urlStep = searchParams.get("step") || "form";
  const urlSubstep = parseInt(searchParams.get("substep")) || 1;

  useEffect(() => {
    if (urlFormName) {
      setFormName(decodeURIComponent(urlFormName));
    }
    setCurrentStep(urlStep);
    setCurrentSubstep(urlSubstep);
  }, [urlFormName, urlStep, urlSubstep]);

  const userEmail = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = userEmail ? String(userEmail) : null;

  useRoomChannel(room, "tablet", {}, { persistJoin: true });

  const seenMsgIdsRef = useRef(new Set());

  const { send: sendToRoom } = useRoomBus(room, {
    onMessage: (p) => {
      let m = p?.msg;
      if (typeof m === "string") {
        try {
          m = JSON.parse(m);
        } catch {
          m = { msg_type: "text", content: { text: m } };
        }
      }
      if (!m && (p?.msg_type || p?.content)) {
        m = { msg_type: p.msg_type, content: p.content };
      }
      const t = m?.msg_type ?? m?.type;
      const c = m?.content ?? {};

      console.log("[tablet-dynamic] 수신 메시지:", { type: t, content: c });

      // 페이지 이동 명령
      if (t === "page_move" && c?.dst) {
        console.log("[tablet-dynamic] 페이지 이동:", c.dst);
        const url = new URL(c.dst, window.location.origin);
        navigate(url.pathname + url.search);
        return;
      }

      // 폼 데이터 동기화
      const patch = extractDataPayload(p);
      if (patch && typeof patch === "object") {
        console.log("[tablet-dynamic] 폼 데이터 동기화:", patch);
        setFormData(prev => ({
          ...prev,
          ...patch
        }));
        return;
      }

      // 양식 스키마 수신
      if (t === "form_schema" && c?.schema) {
        console.log("[tablet-dynamic] 양식 스키마 수신:", c.schema);
        setFormSchema(c.schema);
        return;
      }

      // STT 열기/닫기
      if (t === "stt_open") {
        console.log("[tablet-dynamic] STT 상태 변경:", c?.status);
        // 태블릿에서는 별도 처리 불필요 (웹에서 관리)
        return;
      }
    },
  });

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // 웹으로 데이터 동기화
    sendToRoom({
      msg: {
        msg_type: "data",
        content: { [fieldName]: value }
      }
    });
  };

  const handleSignature = (signatureData) => {
    setSignature(signatureData);

    // 웹으로 서명 완료 알림
    sendToRoom({
      msg: { msg_type: "sign_done", content: { completed: true } }
    });
  };

  // 초기 진입 메시지
  useEffect(() => {
    if (!room || !formName) return;
    const key = `entered:tablet:${formName}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    sendToRoom({ msg: `[tablet] ${formName} 상담 화면 진입` });
  }, [room, formName, sendToRoom]);

  const renderContent = () => {
    switch (currentStep) {
      case "form":
        return (
          <DynamicFormView
            formSchema={formSchema}
            formName={formName}
            currentSubstep={currentSubstep}
            formData={formData}
            onInputChange={handleInputChange}
            sendToRoom={sendToRoom}
          />
        );
      case "signature":
        return (
          <DynamicSignatureView
            formName={formName}
            onSignature={handleSignature}
            sendToRoom={sendToRoom}
          />
        );
      case "complete":
        return (
          <DynamicCompleteView
            formName={formName}
            formData={formData}
            signature={signature}
          />
        );
      default:
        return (
          <S.LoadingContainer>
            <S.LoadingText>양식을 불러오는 중...</S.LoadingText>
          </S.LoadingContainer>
        );
    }
  };

  return (
    <S.Container>
      <TabletHeader />
      <S.Content>
        {renderContent()}
      </S.Content>
    </S.Container>
  );
};

export default TabletDynamicConsultation;