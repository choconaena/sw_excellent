// src/store/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      // 상태
      user: null,
      token: null,
      userId: null,
      loginStatus: false,
      isLoading: false,

      // 액션
      login: (userData, token) => {
        localStorage.setItem("jwtToken", token);
        set({
          user: userData,
          token: token,
          userId: userData.user_id,
          loginStatus: true,
          isLoading: false,
        });
      },

      logout: () => {
        localStorage.removeItem("jwtToken");
        set({
          user: null,
          token: null,
          userId: null,
          loginStatus: false,
          isLoading: false,
        });
      },

      // 로딩 상태 설정
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      // 토큰 확인 및 초기화
      initializeAuth: () => {
        const token = localStorage.getItem("jwtToken");
        if (token) {
          set({
            token: token,
            loginStatus: true,
          });
          return true; // 자동 로그인 가능
        }
        return false;
      },

      // 사용자 정보 업데이트 (프로필 조회 후)
      updateUser: (userData) => {
        set({
          user: userData,
          userId: userData.user_id,
          isLoading: false,
        });
      },

      // 인증 실패 처리
      handleAuthError: () => {
        localStorage.removeItem("jwtToken");
        set({
          user: null,
          token: null,
          userId: null,
          loginStatus: false,
          isLoading: false,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        userId: state.userId,
        loginStatus: state.loginStatus,
      }),
    }
  )
);
