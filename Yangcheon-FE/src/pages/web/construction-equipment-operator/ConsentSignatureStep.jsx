// src/views/admin/construction-equipment-operator/ConsentSignatureStep.jsx
import { useState } from "react";
import * as S from "./style";
import { useAuthStore } from "../../../store/authStore";
import { useRoomBus } from "../../../ws/useRoomBus";
import { submitFinalReportWeb } from "../../../services/consultationService";

function normalize(p) {
  let m = p?.msg;
  if (typeof m === "string") {
    try {
      m = JSON.parse(m);
    } catch {
      m = { msg_type: "text", content: { text: p.msg } };
    }
  }
  if (!m && (p?.msg_type || p?.content)) {
    m = { msg_type: p.msg_type, content: p.content };
  }
  return m && typeof m === "object" ? m : null;
}

const TABLET_PHOTO_SRC = "/info.png"; // public/info.png

const ConsentSignatureStep = ({ onNext }) => {
  const [canNext, setCanNext] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const email = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = email ? String(email) : null;

  const { send } = useRoomBus(room, {}, { tag: "ceo-signature2-web" });

  // 태블릿에서 서명 완료 신호 수신 (num=2)
  useRoomBus(
    room,
    {
      onMessage: (p) => {
        const m = normalize(p);
        if (!m) return;
        const t = m.msg_type ?? m.type;
        const c = m.content ?? {};
        if (t === "sign_done" && (c?.num === 2 || c?.num === "2")) {
          setCanNext(true);
        }
      },
    },
    { tag: "ceo-signature2-web-recv", tapAll: true, allowNoRoom: false }
  );

  const handleNext = async () => {
    if (!canNext || submitting) return;
    try {
      setSubmitting(true);

      // ✅ 이미 있는 서비스 사용
      await submitFinalReportWeb({
        requestType: "건설기계조종사면허증(재)발급",
      });

      // 성공 후 태블릿 완료 화면으로 이동
      send({
        msg: {
          msg_type: "page_move",
          content: {
            dst: "/tablet/construction-equipment-operator?view=form&step=complete",
          },
        },
      });

      onNext?.();
    } catch (err) {
      console.error("최종 레포트 전송 실패:", err);
      alert(err?.message || "최종 레포트 전송에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <S.Container>
      <S.Header>
        <S.Title>
          건설기계조종사면허증_4. 행정정보 공동이용 동의서 전자서명
        </S.Title>
      </S.Header>

      <S.Content>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(320px, 40%) 64px 1fr",
            gap: "1.25rem",
            width: "100%",
            alignItems: "stretch",
          }}
        >
          {/* 왼쪽: 태블릿 안내 */}
          <div
            style={{
              border: "2px solid #e9ecef",
              borderRadius: 12,
              padding: "1rem",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              minHeight: 520,
            }}
          >
            <div
              style={{ fontWeight: 700, fontSize: "1.5rem", marginBottom: 8 }}
            >
              태블릿 화면 안내
            </div>
            <div
              style={{
                color: "#666",
                fontSize: "1rem",
                lineHeight: 1.45,
                marginBottom: 10,
              }}
            >
              민원인 태블릿에 아래 화면이 표시됩니다.
              <br />
              <b>[확인]</b>을 눌러야 서명 화면이 열립니다.
            </div>
            <div
              style={{
                border: "1px solid #f1f3f5",
                borderRadius: 10,
                padding: 8,
                background: "#fafafa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                maxHeight: 320,
              }}
            >
              <img
                src={TABLET_PHOTO_SRC}
                alt="태블릿 확인 화면 예시"
                style={{
                  maxWidth: "100%",
                  maxHeight: 300,
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: 8,
                  background: "#fff",
                }}
              />
            </div>
          </div>

          {/* 가운데: 화살표 */}
          <div
            aria-hidden
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "#f8f9fa",
                border: "1px solid #e9ecef",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
              title="다음 단계로"
            >
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                role="img"
                focusable="false"
              >
                <path
                  d="M8 5l7 7-7 7"
                  fill="none"
                  stroke="#c92a2a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* 오른쪽: 진행 상태 */}
          <div
            style={{
              border: "2px solid #e9ecef",
              borderRadius: 12,
              padding: "1rem",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              textAlign: "center",
              minHeight: 420,
            }}
          >
            <S.SignatureTitle>
              {"< 행정정보 공동이용 동의서 >"}
            </S.SignatureTitle>
            <S.Message>민원인께 태블릿에서 서명을 요청해주세요.</S.Message>
            <span
              style={{
                marginTop: "0.5rem",
                padding: "0.35rem 0.6rem",
                borderRadius: 999,
                background: canNext ? "#e6f4ea" : "#fff3cd",
                color: canNext ? "#137333" : "#8a6d3b",
                fontWeight: 700,
                fontSize: ".9rem",
              }}
            >
              {canNext ? "서명 완료" : "서명 대기중"}
            </span>
          </div>
        </div>
      </S.Content>

      <S.ButtonContainer>
        <S.NextButton onClick={handleNext} disabled={!canNext || submitting}>
          {canNext
            ? submitting
              ? "전송 중..."
              : "다음"
            : "서명 기다리는 중..."}
        </S.NextButton>
      </S.ButtonContainer>
    </S.Container>
  );
};

export default ConsentSignatureStep;
