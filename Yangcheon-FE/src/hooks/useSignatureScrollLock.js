import { useEffect } from "react";

export function useSignatureScrollLock(active = true, targetEl) {
  useEffect(() => {
    if (!active) return;

    const body = document.body;
    const docEl = document.documentElement;

    // 기존 스타일 보존
    const prevOverflow = body.style.overflow;
    const prevTouchAction = body.style.touchAction;
    const prevOB = docEl.style.overscrollBehavior;

    // 바디 스크롤 잠금
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    docEl.style.overscrollBehavior = "none";

    // iOS/안드 공통: 기본 스크롤 동작 차단
    const prevent = (e) => e.preventDefault();
    const opts = { passive: false };

    window.addEventListener("touchmove", prevent, opts);
    window.addEventListener("wheel", prevent, opts);

    // 타깃 엘리먼트에 보수적으로 한 번 더 적용(선택)
    if (targetEl?.current) {
      targetEl.current.addEventListener("touchmove", prevent, opts);
      targetEl.current.addEventListener("wheel", prevent, opts);
    }

    return () => {
      body.style.overflow = prevOverflow;
      body.style.touchAction = prevTouchAction;
      docEl.style.overscrollBehavior = prevOB;

      window.removeEventListener("touchmove", prevent, opts);
      window.removeEventListener("wheel", prevent, opts);

      if (targetEl?.current) {
        targetEl.current.removeEventListener("touchmove", prevent, opts);
        targetEl.current.removeEventListener("wheel", prevent, opts);
      }
    };
  }, [active, targetEl]);
}
