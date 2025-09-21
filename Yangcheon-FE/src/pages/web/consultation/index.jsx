import { useEffect, useState, useRef } from "react";
import MainLayout from "../../../layouts/MainLayout";
import ChatPanel from "./components/consultation/ChatPanel";
import IdentityRequest from "./components/consultation/IdentityRequest";
import ApplicantForm from "./components/consultation/ApplicantForm";
import SummaryStep from "./components/consultation/SummaryStep";
import EnhancedSummaryStep from "./components/consultation/EnhancedSummaryStep";
import FeeExemptionStep from "./components/consultation/FeeExemptionStep";
import DisclosureMethodStep from "./components/consultation/DisclosureMethodStep";
import SignatureStep from "./components/consultation/SignatureStep";
import { useConsultationFlow } from "../../../hooks/useConsultationFlow";
import { useSttSession } from "../../../hooks/useSttSession";
import { useReliableRoomBus } from "../../../ws/reliable/useReliableRoomBus";
import {
  submitApplicantData,
  submitFinalReportWeb,
} from "../../../services/consultationService";
import * as S from "./style";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { useRoomBus } from "../../../ws/useRoomBus";
import { extractDataPayload, extractChatText } from "../../../ws/parseWs";
import { useRoomChannel } from "../../../ws/useRoomChannel";
import { useReportStore } from "../../../store/useReportStore";
import { useRealtimeUnloadPrompt } from "../../../hooks/useRealtimeUnloadPrompt";

const ALLOWED_FIELDS = [
  "name",
  "birthDate",
  "address",
  "passport",
  "phone",
  "email",
  "fax",
  "businessNumber",
];

const TABLET_DEST_BY_NEXT_STEP = {
  1: "https://yangcheon.ai.kr:28443/tablet/consultation?view=form&step=applicant",
  2: null,
  3: "https://yangcheon.ai.kr:28443/tablet/consultation?view=form&step=summary",
  4: "https://yangcheon.ai.kr:28443/tablet/consultation?view=form&step=method",
  5: null,
  6: "https://yangcheon.ai.kr:28443/tablet/consultation?view=form&step=signature",
  7: null,
};

const WebConsultation = () => {
  const navigate = useNavigate();
  const [isChatTabletPublic, setIsChatTabletPublic] = useState(false);
  const [isSummaryTabletPublic, setIsSummaryTabletPublic] = useState(false);
  const [isSignReady, setIsSignReady] = useState(false);
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

  // 🔔 안내 모달

  const [introOpen, setIntroOpen] = useState(false);

  useEffect(() => {
    setIntroOpen(true);
  }, []);

  const closeIntro = () => {
    setIntroOpen(false);
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

      // data → 폼 동기화
      const patch = extractDataPayload(p);
      if (patch && typeof patch === "object") {
        Object.entries(patch).forEach(([k, v]) => {
          if (k === "disclosureMethods" || k === "receiveMethods") {
            const arr = Array.isArray(v) ? v : v == null ? [] : [String(v)];
            handleMethodDataChange(k, arr);
            return;
          }
          handleInputChange(k, v ?? "");
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
    },
  });

  // 웹 → tablet 브로드캐스트 전용 (로컬 추가 없음)
  const postChatFromWeb = (text, isUser = false) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    sendToRoom({
      msg: { msg_type: "chat", content: { id, text, isUser, from: "web" } },
    });
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
    console.log("[web] report_meta ->", { reportId, status, msg });
  }, [room, reportId, status, msg, sendToRoom]);

  useEffect(() => {
    if (!room) return;
    const key = `entered:${userEmail}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    sendToRoom({ msg: "[web] 상담 화면 진입" });
  }, [room, userEmail, sendToRoom]);

  useEffect(() => {
    const isReloadByPerf = (() => {
      const nav = performance.getEntriesByType("navigation")[0];
      if (nav && "type" in nav) return nav.type === "reload";
      return (
        typeof performance !== "undefined" &&
        performance.navigation &&
        performance.navigation.type === 1
      );
    })();
    const tsRaw = sessionStorage.getItem("stt_refresh_intent_ts");
    const ts = tsRaw ? Number(tsRaw) : 0;
    const freshReloadFlag = ts > 0 && Date.now() - ts < 4000;
    if (tsRaw) sessionStorage.removeItem("stt_refresh_intent_ts");
    if (isReloadByPerf && freshReloadFlag) {
      alert("STT 연결을 재시도 해주세요");
      navigate(-1);
    }
  }, [navigate]);

  const {
    currentFlow,
    currentStep,
    isCompleted,
    applicantData,
    summaryData,
    methodData,
    feeData,
    requestType,
    handleNextStep,
    handlePrevStep,
    handleInputChange,
    handleSummaryDataChange,
    handleMethodDataChange,
    handleFeeDataChange,
    handleComplete,
  } = useConsultationFlow();

  useEffect(() => {
    if (isCompleted) navigate("/consultation/complete");
  }, [isCompleted, navigate]);

  const renderContent = () => {
    if (currentFlow !== "info-request") return null;

    switch (currentStep) {
      case 1:
        return (
          <IdentityRequest
            onNext={() => {
              sendTabletNavForNext(1);
              handleNextStep();
            }}
            onPrev={handlePrevStep}
            sendToRoom={sendToRoom}
          />
        );
      case 2:
        return (
          <ApplicantForm
            applicantData={applicantData}
            onInputChange={handleInputChange}
            onNext={async () => {
              try {
                await submitApplicantData(applicantData);
                sendTabletNavForNext(2);
                handleNextStep();
              } catch (error) {
                console.error("신청인 데이터 전송 실패:", error);
              }
            }}
            onPrev={handlePrevStep}
            sendToRoom={sendToRoom}
          />
        );
      case 3:
        return (
          <SummaryStep
            onPrev={handlePrevStep}
            onNext={() => {
              sendTabletNavForNext(3);
              handleNextStep();
            }}
            isTabletPublic={isSummaryTabletPublic}
            onToggleChange={() => setIsSummaryTabletPublic((v) => !v)}
          />
        );
      case 4:
        return (
          <EnhancedSummaryStep
            summaryData={summaryData}
            onSummaryDataChange={handleSummaryDataChange}
            onNext={() => {
              sendTabletNavForNext(4);
              handleNextStep();
            }}
            onPrev={handlePrevStep}
            isTabletPublic={isSummaryTabletPublic}
            onToggleChange={() => setIsSummaryTabletPublic((v) => !v)}
          />
        );
      case 5:
        return (
          <DisclosureMethodStep
            methodData={methodData}
            onMethodDataChange={handleMethodDataChange}
            onNext={() => {
              sendTabletNavForNext(5);
              handleNextStep();
            }}
            onPrev={handlePrevStep}
          />
        );
      case 6:
        return (
          <FeeExemptionStep
            feeData={feeData}
            onFeeDataChange={handleFeeDataChange}
            onNext={() => {
              sendTabletNavForNext(6);
              handleNextStep();
            }}
            onPrev={handlePrevStep}
          />
        );
      case 7:
        return (
          <SignatureStep
            canComplete={isSignReady}
            onComplete={async () => {
              try {
                // ✅ 최종 레포트 전송에 requestType 사용
                const res = await submitFinalReportWeb({ requestType });
                if (res?.message) alert(res.message);

                // 태블릿 완료 화면으로 이동
                sendToRoom({
                  msg: {
                    msg_type: "page_move",
                    content: {
                      dst: "/tablet/consultation?view=form&step=complete",
                    },
                  },
                });
                handleComplete();
              } catch (e) {
                alert(e?.message || "최종 레포트 전송 중 오류가 발생했습니다.");
              }
            }}
            onPrev={handlePrevStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      {/* ⬇️ 안내 모달 */}
      {introOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={{
              width: "min(520px, 92vw)",
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 12px 40px rgba(0,0,0,.18)",
              padding: "2rem 2rem 1rem",
              textAlign: "center",
            }}
          >
            <h3
              style={{
                margin: "0 0 1rem",
                fontSize: "2rem",
                fontWeight: 700,
              }}
            >
              진행 안내
            </h3>
            <p
              style={{
                margin: "0 0 1rem",
                color: "#444",
                lineHeight: 1.55,
                fontSize: "1.1rem",
              }}
            >
              이 화면에서 <b>새로고침(F5)</b> 하거나
              <br />
              다른 메뉴로 이동하면 상담이 <b>처음부터</b> 다시 시작됩니다.
              <br />꼭 필요한 경우가 아니라면 페이지 이동/새로고침을 피해주세요.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button
                onClick={() => closeIntro(true)}
                style={{
                  padding: ".7rem 1.2rem",
                  borderRadius: 8,
                  border: "none",
                  background: "#a93946",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
      <S.Container>
        <S.MainContent $isDefaultFlow={currentFlow === "default"}>
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

export default WebConsultation;
