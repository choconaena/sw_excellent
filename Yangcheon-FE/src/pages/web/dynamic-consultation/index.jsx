import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import ChatPanel from "../consultation/components/consultation/ChatPanel";
import DynamicFormStep from "./components/DynamicFormStep";
import DynamicSignatureStep from "./components/DynamicSignatureStep";
import { useSttSession } from "../../../hooks/useSttSession";
import { useReliableRoomBus } from "../../../ws/reliable/useReliableRoomBus";
import * as S from "../consultation/style"; // 정보공개청구와 동일한 스타일 사용
import { useAuthStore } from "../../../store/authStore";
import { useRoomBus } from "../../../ws/useRoomBus";
import { extractDataPayload, extractChatText } from "../../../ws/parseWs";
import { useRoomChannel } from "../../../ws/useRoomChannel";
import { useReportStore } from "../../../store/useReportStore";
import { useRealtimeUnloadPrompt } from "../../../hooks/useRealtimeUnloadPrompt";

const DynamicConsultation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formSchema, setFormSchema] = useState(null);
  const [formName, setFormName] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [signature, setSignature] = useState(null);
  const [isChatTabletPublic, setIsChatTabletPublic] = useState(false);
  const [isSignReady, setIsSignReady] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useRealtimeUnloadPrompt(true);
  const userEmail = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = userEmail ? String(userEmail) : null;

  const { reportId, status, msg } = useReportStore();

  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "모델 로드 대기중! 곧 대화가 시작됩니다.",
      isUser: true,
      timestamp: new Date(),
    },
  ]);

  // 양식 스키마를 location.state에서 받음
  useEffect(() => {
    if (location.state?.formSchema) {
      setFormSchema(location.state.formSchema);
      setFormName(location.state.formName || location.state.formSchema.reportType);
      console.log('동적 상담용 양식 스키마:', location.state.formSchema);
    } else {
      // 스키마가 없으면 메인으로 이동
      navigate('/consultation/start');
    }
  }, [location.state, navigate]);

  // 태블릿 페이지 이동을 위한 매핑
  const TABLET_DEST_BY_NEXT_STEP = {
    1: `https://yangcheon.ai.kr:28443/tablet/dynamic-consultation?form=${encodeURIComponent(formName)}&step=form&substep=1`,
    2: `https://yangcheon.ai.kr:28443/tablet/dynamic-consultation?form=${encodeURIComponent(formName)}&step=form&substep=2`,
    3: `https://yangcheon.ai.kr:28443/tablet/dynamic-consultation?form=${encodeURIComponent(formName)}&step=signature`,
    4: `https://yangcheon.ai.kr:28443/tablet/dynamic-consultation?form=${encodeURIComponent(formName)}&step=complete`,
  };

  const sendTabletNavForNext = (step) => {
    const dst = TABLET_DEST_BY_NEXT_STEP[step] ?? null;
    if (dst) {
      sendToRoom({ msg: { msg_type: "page_move", content: { dst } } });
    } else {
      sendToRoom({
        msg: { msg_type: "stt_open", content: { status: isChatTabletPublic } },
      });
    }
  };

  useRoomChannel(room, "web", {}, { persistJoin: true });

  const handleTabletPublicToggle = () => {
    const next = !isChatTabletPublic;
    setIsChatTabletPublic(next);
    sendToRoom({ msg: { msg_type: "stt_open", content: { status: next } } });
  };

  const seenMsgIdsRef = useRef(new Set());

  const { send: sendToRoom } = useRoomBus(room, {
    onMessage: (p) => {
      // normalize
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

      // sign_done → 완료 버튼 활성화
      if (t === "sign_done") {
        setIsSignReady(true);
        return;
      }

      // chat → 한 번만 추가
      if (t === "chat" && c?.text) {
        const mid = c.id;
        if (mid && seenMsgIdsRef.current.has(mid)) return;
        setMessages((prev) => [
          ...prev,
          {
            id: mid || `${Date.now()}-${prev.length + 1}`,
            content: c.text,
            isUser: !!c.isUser,
            timestamp: new Date(),
            origin: c.from || "app",
          },
        ]);
        if (mid) seenMsgIdsRef.current.add(mid);
        return;
      }

      // data → 폼 동기화 (동적 필드들)
      const patch = extractDataPayload(p);
      if (patch && typeof patch === "object") {
        Object.entries(patch).forEach(([k, v]) => {
          setFormData(prev => ({
            ...prev,
            [k]: v ?? ""
          }));
        });
        return;
      }

      // 기타 텍스트
      const text = extractChatText(p);
      if (!text) return;
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${prev.length + 1}`,
          content: text,
          isUser: false,
          timestamp: new Date(),
          origin: "system",
        },
      ]);

      // STT 내용 기반 자동 필드 채우기
      processSTTForAutoFill(text);
    },
  });

  // 웹 → tablet 브로드캐스트 전용 (로컬 추가 없음)
  const postChatFromWeb = (text, isUser = false) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    sendToRoom({
      msg: { msg_type: "chat", content: { id, text, isUser, from: "web" } },
    });
  };

  // STT 내용 기반 자동 필드 채우기 함수
  const processSTTForAutoFill = async (sttText) => {
    if (!formSchema?.sttGenerated || !sttText.trim()) return;

    try {
      // 모든 STT 메시지 수집
      const allSTTMessages = messages
        .filter(msg => !msg.isUser && msg.origin !== "system")
        .map(msg => msg.content)
        .join(" ");

      const fullSTTContent = allSTTMessages + " " + sttText;

      // GPT API를 통해 STT 내용에서 필드값 추출
      const response = await fetch('http://localhost:23000/ai/extract-stt-fields', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sttContent: fullSTTContent,
          formSchema: formSchema,
          currentFormData: formData
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          console.log('STT 기반 자동 필드 채우기:', result.data);

          // 추출된 필드값들을 폼 데이터에 적용
          Object.entries(result.data).forEach(([fieldName, value]) => {
            if (value && value.trim()) {
              setFormData(prev => ({
                ...prev,
                [fieldName]: value
              }));

              // 태블릿으로도 동기화
              sendToRoom({
                msg: {
                  msg_type: "data",
                  content: { [fieldName]: value }
                }
              });
            }
          });

          // 자동 채움 알림 메시지 추가
          if (Object.keys(result.data).length > 0) {
            setMessages((prev) => [
              ...prev,
              {
                id: `autofill-${Date.now()}`,
                content: `🤖 AI가 상담 내용을 분석하여 일부 필드를 자동으로 채웠습니다: ${Object.keys(result.data).join(', ')}`,
                isUser: false,
                timestamp: new Date(),
                origin: "system",
              },
            ]);
          }
        }
      }
    } catch (error) {
      console.warn('STT 자동 필드 채우기 실패:', error);
    }
  };

  // STT 텍스트를 postChatFromWeb으로만 전송
  useSttSession({
    email: userEmail,
    onText: (text) => postChatFromWeb(text, false),
  });

  useEffect(() => {
    if (!room || !reportId) return;
    sendToRoom({
      msg: { msg_type: "report_meta", content: { reportId, status, msg } },
    });
    console.log("[dynamic-web] report_meta ->", { reportId, status, msg });
  }, [room, reportId, status, msg, sendToRoom]);

  useEffect(() => {
    if (!room) return;
    const key = `entered:${userEmail}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    sendToRoom({ msg: `[web] ${formName} 상담 화면 진입` });
  }, [room, userEmail, sendToRoom, formName]);

  useEffect(() => {
    if (isCompleted) navigate("/consultation/complete");
  }, [isCompleted, navigate]);

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // 태블릿으로 데이터 동기화
    sendToRoom({
      msg: {
        msg_type: "data",
        content: { [fieldName]: value }
      }
    });
  };

  const handleNextStep = () => {
    sendTabletNavForNext(currentStep + 1);
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      sendTabletNavForNext(currentStep - 1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSignature = (signatureData) => {
    setSignature(signatureData);
  };

  const handleComplete = async () => {
    try {
      console.log('최종 제출 데이터:', {
        formName,
        formData,
        signature,
        schema: formSchema
      });

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

      // HWP 생성 API 호출 (generate_server 사용)
      const formDataToSend = new FormData();
      formDataToSend.append('data', JSON.stringify(completeFormData));

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
        formDataToSend.append('images', blob, 'signature.png');
      }

      const response = await fetch('http://localhost:28091/', {
        method: 'POST',
        body: formDataToSend
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

        alert(`${formName} 양식이 성공적으로 생성되어 다운로드되었습니다!`);

        // 태블릿 완료 화면으로 이동
        sendToRoom({
          msg: {
            msg_type: "page_move",
            content: {
              dst: `/tablet/dynamic-consultation?form=${encodeURIComponent(formName)}&step=complete`,
            },
          },
        });

        setIsCompleted(true);
      } else {
        throw new Error('HWP 생성 실패');
      }

    } catch (error) {
      console.error('양식 완료 중 오류:', error);
      alert(`양식 완료 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  if (!formSchema) {
    return (
      <MainLayout>
        <S.Container>
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            양식을 불러오는 중...
          </div>
        </S.Container>
      </MainLayout>
    );
  }

  // 총 단계 수 계산
  const directInputSteps = formSchema.directInput ? Object.keys(formSchema.directInput).length : 0;
  const totalSteps = directInputSteps + 1; // +1 for signature

  const renderContent = () => {
    if (currentStep <= directInputSteps) {
      return (
        <DynamicFormStep
          formSchema={formSchema}
          currentStep={currentStep}
          formData={formData}
          onInputChange={handleInputChange}
          onNext={handleNextStep}
          onPrev={handlePrevStep}
          totalSteps={totalSteps}
          sendToRoom={sendToRoom}
        />
      );
    } else if (currentStep === totalSteps) {
      return (
        <DynamicSignatureStep
          formName={formName}
          canComplete={isSignReady}
          onSignature={handleSignature}
          onComplete={handleComplete}
          onPrev={handlePrevStep}
          sendToRoom={sendToRoom}
        />
      );
    }

    return null;
  };

  return (
    <MainLayout>
      <S.Container>
        <S.MainContent>
          <S.LeftPanel>
            <ChatPanel
              messages={messages}
              isTabletPublic={isChatTabletPublic}
              onToggleChange={handleTabletPublicToggle}
            />
          </S.LeftPanel>
          <S.RightPanel>{renderContent()}</S.RightPanel>
        </S.MainContent>
      </S.Container>
    </MainLayout>
  );
};

export default DynamicConsultation;