// src/views/tablet/WelcomeView.jsx
import { useEffect } from "react";
import TabletHeader from "../../components/tablet/Header";
import { useAuthStore } from "../../store/authStore";
import { useRoomBus } from "../../ws/useRoomBus"; // ✅ send만
import * as S from "./style";

const WelcomeView = () => {
  const userEmail = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = userEmail ? String(userEmail) : null;

  const { send } = useRoomBus(
    room,
    {},
    { verbose: true, tag: "tablet-welcome" }
  );

  useEffect(() => {
    if (!room) return;
    send({
      msg: { msg_type: "log", content: { text: "[app] 웰컴 화면 진입" } },
    });
  }, [room, send]);

  return (
    <S.Container>
      <TabletHeader />
      <S.WelcomeScreen>
        <S.WelcomeMessage>
          AI 민원실이 더 빠르고 편리한
          <br />
          민원 처리를 도와드립니다.
        </S.WelcomeMessage>
      </S.WelcomeScreen>
    </S.Container>
  );
};
export default WelcomeView;
