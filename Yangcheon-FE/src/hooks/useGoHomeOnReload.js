// src/hooks/useGoHomeOnReload.js
//새로고침 시 홈 화면 이동 훅
// 아직 미사용
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function useGoHomeOnReload(homePath = "/") {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Navigation Timing Level 2
    const entry = performance.getEntriesByType?.("navigation")?.[0];
    const isReload = entry
      ? entry.type === "reload"
      : // fallback (deprecated)
        performance.navigation?.type === 1;

    // 새로고침일 때만, 그리고 이미 홈이 아니라면 홈으로 이동
    if (isReload && location.pathname + location.search !== homePath) {
      navigate(homePath, { replace: true }); // history 쌓이지 않게
    }
  }, [navigate, location.pathname, location.search, homePath]);
}
