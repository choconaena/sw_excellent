// src/views/admin/construction-equipment-operator/IssuanceSignatureStep.jsx
import { useState } from "react";
import * as S from "./style";
import { useAuthStore } from "../../../store/authStore";
import { useRoomBus } from "../../../ws/useRoomBus";

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

const IssuanceSignatureStep = ({ onNext }) => {
  const [canNext, setCanNext] = useState(false);

  const email = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = email ? String(email) : null;

  const { send } = useRoomBus(room, {}, { tag: "ceo-signature1-web" });

  useRoomBus(
    room,
    {
      onMessage: (p) => {
        const m = normalize(p);
        if (!m) return;
        const t = m.msg_type ?? m.type;
        const c = m.content ?? {};
        if (t === "sign_done" && (c?.num === 1 || c?.num == null)) {
          setCanNext(true);
        }
      },
    },
    { tag: "ceo-signature1-web-recv", tapAll: true, allowNoRoom: false }
  );

  const handleNext = () => {
    // 태블릿을 다음 단계(주석 참고)로 이동
    send({
      msg: {
        msg_type: "page_move",
        content: {
          dst: "/tablet/construction-equipment-operator?view=form&step=requirements",
        },
      },
    });
    onNext?.();
  };

  const buttonLabel = canNext ? "다음" : "서명 기다리는중...";

  return (
    <S.Container>
      <S.Header>
        <S.Title>건설기계조종사면허증_3. 발급 신청 전자서명</S.Title>
      </S.Header>
      <S.Content>
        <S.ContentBox>
          <S.SignatureTitle>{"< 발급 신청 전자 서명 >"}</S.SignatureTitle>
          <S.Message>민원인께 태블릿에서 서명을 요청해주세요.</S.Message>
        </S.ContentBox>
      </S.Content>
      <S.ButtonContainer>
        <S.NextButton
          onClick={handleNext}
          disabled={!canNext}
          aria-busy={!canNext}
        >
          {buttonLabel}
        </S.NextButton>
      </S.ButtonContainer>
    </S.Container>
  );
};

export default IssuanceSignatureStep;
