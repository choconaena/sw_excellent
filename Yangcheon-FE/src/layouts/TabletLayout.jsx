// src/layouts/TabletLayout.jsx
import { Outlet } from "react-router-dom";
import { usePageMoveNavigation } from "../hooks/usePageMoveNavigation";
import { useReportMetaSync } from "../hooks/useReportMetaSync";
import { useTabletWsAutoReconnect } from "../hooks/useTabletWsAutoReconnect";
import { useAuthStore } from "../store/authStore";
import { useRoomChannel } from "../ws/useRoomChannel";
import { useSocketDisconnectNotice } from "../hooks/useSocketDisconnectNotice";

export default function TabletLayout() {
  const email = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = email ? String(email) : null;

  useRoomChannel(room, "app", {}, { persistJoin: true });
  usePageMoveNavigation();
  useReportMetaSync();
  useTabletWsAutoReconnect();

  // 1초 이상 끊기면 자동 새로고침, 모달은 비활성화
  const { Prompt } = useSocketDisconnectNotice({
    warnAfterMs: 0,
    autoReloadAfterMs: 1000,
  });

  return (
    <>
      {/* <Prompt />  // 🔕 모달 렌더 차단 */}
      <Outlet />
    </>
  );
}
