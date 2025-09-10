// src/hooks/useTabletWsAutoReconnect.js
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useRoomChannel } from "../ws/useRoomChannel";
import { useRoomBus } from "../ws/useRoomBus";
import { getSocket } from "../ws/socket";

export function useTabletWsAutoReconnect() {
  const email = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = email ? String(email) : null;

  // 재연결 시 자동 재-조인
  useRoomChannel(room, "tablet-home", {}, { persistJoin: true });

  const { send } = useRoomBus(room, {}, { tag: "tablet-home" });

  useEffect(() => {
    const s = getSocket();

    if (!s.connected) s.connect?.();

    const onConnect = () =>
      send({ msg: { msg_type: "tablet_ready", content: null } });
    const onReconnect = () =>
      send({
        msg: { msg_type: "tablet_ready", content: { reason: "reconnect" } },
      });

    s.on("connect", onConnect);
    s.io?.on?.("reconnect", onReconnect);

    if (s.connected) onConnect();

    return () => {
      s.off?.("connect", onConnect);
      s.io?.off?.("reconnect", onReconnect);
    };
  }, [room, send]);
}
