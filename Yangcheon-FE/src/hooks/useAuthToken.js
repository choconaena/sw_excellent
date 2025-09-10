// src/hooks/useAuthToken.js
import { useEffect } from "react";
import { loginAndStoreToken } from "../services/authService";

export function useAuthToken({ email, password }) {
  useEffect(() => {
    (async () => {
      try {
        await loginAndStoreToken({ email, password });
        console.log("✅ 로그인 & JWT 저장");
      } catch (e) {
        console.error("🚫 자동 로그인 실패:", e);
      }
    })();
  }, [email, password]);
}
