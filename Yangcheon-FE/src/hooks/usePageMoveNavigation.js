// src/hooks/usePageMoveNavigation.js
import { useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useRoomChannel } from "../ws/useRoomChannel";
import { getSocket } from "../ws/socket";

const SAVE_KEY = "tablet:returnTo";

const buildPath = (loc) => `${loc.pathname}${loc.search}${loc.hash}`;
const isChatRoute = (loc) =>
  loc.pathname.startsWith("/tablet/consultation") &&
  new URLSearchParams(loc.search).get("view") === "chat";

const setReturnPath = (path) => sessionStorage.setItem(SAVE_KEY, path);
const getReturnPath = () => sessionStorage.getItem(SAVE_KEY);
const clearReturnPath = () => sessionStorage.removeItem(SAVE_KEY);

export function usePageMoveNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = email ? String(email) : null;

  const isPublicRef = useRef(false);

  // ✅ 항상 "비-채팅 화면"을 최신값으로 저장
  useEffect(() => {
    if (!isChatRoute(location)) {
      setReturnPath(buildPath(location));
    }
  }, [location]);

  const onMessage = useCallback(
    (p) => {
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
      if (!m || typeof m !== "object") return;

      const t = m.msg_type ?? m.type;
      const c = m.content ?? {};

      // ✅ 새로 추가: 웹이 보낸 강제 종료
      if (t === "stop_all") {
        try {
          const s = getSocket?.();
          if (s?.connected) {
            if (room) s.emit("room:leave", { room });
            // 약간의 지연을 줘서 leave 전달
            setTimeout(() => {
              try {
                if (s.disconnect) s.disconnect();
                else if (s.close) s.close();
              } catch (e) {
                void e;
              }
            }, 100);
          }
        } catch (e) {
          void e;
        }
        // 안전하게 홈으로
        navigate(c?.goto || "/tablet", { replace: true });
        return;
      }

      if (t === "stt_open") {
        const status = !!c.status;

        if (status) {
          // ON: 현재가 비-채팅이면 저장(위 useEffect가 대부분 해결하지만, 혹시 모를 타이밍 보강)
          if (!isChatRoute(location)) {
            setReturnPath(buildPath(location));
          }
          isPublicRef.current = true;
          if (!isChatRoute(location)) {
            navigate("/tablet/consultation?view=chat");
          }
        } else {
          // OFF: 저장된 최신 비-채팅 경로로 복귀
          const back = getReturnPath() || "/tablet";
          isPublicRef.current = false;
          clearReturnPath();
          if (buildPath(location) !== back) {
            navigate(back);
          }
        }
        return;
      }

      if (t === "page_move") {
        const dst = c?.dst;
        if (!dst) return;

        try {
          if (/^https?:\/\//i.test(dst)) {
            const u = new URL(dst);
            if (u.origin === window.location.origin) {
              // 같은 오리진 → 비-채팅이면 미리 저장
              const willChat =
                u.pathname.startsWith("/tablet/consultation") &&
                new URLSearchParams(u.search).get("view") === "chat";
              if (!willChat) setReturnPath(u.pathname + u.search + u.hash);

              navigate(u.pathname + u.search + u.hash);
            } else {
              window.location.href = dst;
            }
          } else {
            // 상대경로 → 비-채팅이면 미리 저장
            const willChat =
              dst.startsWith("/tablet/consultation") &&
              new URLSearchParams(dst.split("?")[1] || "").get("view") ===
                "chat";
            if (!willChat) setReturnPath(dst);

            navigate(dst);
          }
        } catch {
          window.location.href = dst;
        }
      }
    },
    [navigate, location]
  );

  useRoomChannel(room, "tablet-router", { onMessage }, { persistJoin: true });
}
