// src/hooks/useSttSession.js
import { useEffect } from "react";
import { startSttSession } from "../services/sttSessionService";
import { setSttStopper } from "../utils/sttController";

// 🔸 세션 싱글톤 (이 파일의 모듈 전역)
let GLOBAL_STOP = null; // 현재 STT 세션 stop 함수
let GLOBAL_EMAIL = null; // 어떤 이메일로 세션 열려있는지

export function useSttSession({ email, onText }) {
  useEffect(() => {
    if (!email) return;

    let cancelled = false;

    (async () => {
      try {
        // 이미 같은 이메일로 열린 세션이 있으면 재연결하지 않음(라우트 이동 시 유지)
        if (GLOBAL_STOP && GLOBAL_EMAIL === email) {
          // 전역 stopper만 최신으로 갱신해둠(완료 화면 등에서 종료 가능)
          setSttStopper(() => {
            try {
              GLOBAL_STOP?.();
            } finally {
              GLOBAL_STOP = null;
              GLOBAL_EMAIL = null;
            }
          });
          return;
        }

        // 이메일이 바뀌었거나(로그인 변경 등) 기존 세션이 있으면 먼저 종료
        if (GLOBAL_STOP) {
          try {
            GLOBAL_STOP();
          } catch (e) {
            void e;
          }
          GLOBAL_STOP = null;
          GLOBAL_EMAIL = null;
        }

        console.log("[STT] startSttSession:", email);
        const { stop } = await startSttSession({ email, onText });

        if (cancelled) {
          // 마운트 해제 중이면 곧바로 정리
          try {
            stop();
          } catch (e) {
            void e;
          }
          return;
        }

        // 🔹 새 글로벌 세션 등록
        GLOBAL_STOP = stop;
        GLOBAL_EMAIL = email;

        // 🔹 어디서든 끊을 수 있게 전역 stopper 등록(완료 화면 등에서 사용)
        setSttStopper(() => {
          try {
            GLOBAL_STOP?.();
          } finally {
            GLOBAL_STOP = null;
            GLOBAL_EMAIL = null;
          }
        });
      } catch (e) {
        console.error("[STT] 세션 시작 실패:", e);
      }
    })();

    const handleBeforeUnload = () => {
      // 새로고침/닫기 시에는 정리
      try {
        GLOBAL_STOP?.();
      } catch (e) {
        void e;
      }
      GLOBAL_STOP = null;
      GLOBAL_EMAIL = null;
      setSttStopper(null);
      sessionStorage.setItem("stt_refresh_intent_ts", String(Date.now()));
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      cancelled = true;
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // ⚠️ 여기서는 "자동 종료"하지 않습니다.
      // 이유: 라우트 이동해도 세션을 계속 유지하려고 하기 때문입니다.
      // 명시적 종료는 sttController.stopSttSession()을 호출하세요(예: 홈으로 가기 클릭 시).
    };
  }, [email]);
}
