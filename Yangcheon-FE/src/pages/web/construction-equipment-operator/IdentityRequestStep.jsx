import { useEffect, useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import { useRoomBus } from "../../../ws/useRoomBus";
import { useRoomChannel } from "../../../ws/useRoomChannel";
import * as S from "./style";

const IdentityRequestStep = ({ onNext }) => {
  // 1) room 식별 (email 기준)
  const email = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = email ? String(email) : null;

  // 2) 이 화면에 들어오면 web이 join (지속 유지)
  useRoomChannel(room, "web", {}, { persistJoin: true });

  // 3) 전송 핸들
  const { send } = useRoomBus(room, {}, { tag: "identity-web" });

  const goTablet = () => {
    const dst = "https://yangcheon.ai.kr:28443/tablet/construction-equipment-operator?step=1";

    send({
      msg: {
        msg_type: "page_move",
        content: { dst },
      },
    });

    // 웹 쪽도 다음 단계로 진행
    onNext?.();
  };

  // 🔔 안내 모달: 같은 상담(reportId) 동안 1회만 노출

  const [introOpen, setIntroOpen] = useState(false);

  useEffect(() => {
    setIntroOpen(true);
  }, []);

  const closeIntro = () => {
    setIntroOpen(false);
  };

  return (
    <S.Container>
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
      <S.Header>
        <S.Title>건설기계조종사면허증_1. 신분증 요청</S.Title>
      </S.Header>
      <S.Content>
        <S.ContentBox>
          <S.Message>민원인께 신분증을 요청해주세요!</S.Message>
        </S.ContentBox>
      </S.Content>
      <S.ButtonContainer>
        <S.NextButton onClick={goTablet}>다음</S.NextButton>
      </S.ButtonContainer>
    </S.Container>
  );
};

export default IdentityRequestStep;
