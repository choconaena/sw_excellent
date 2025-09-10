import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import GlobalStyle from "./style/globalStyle";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import { useAuthStore } from "./store/authStore";
import { autoLogin } from "./services/authService";

const BackGroundColor = styled.div`
  width: 100vw;
  min-height: 100vh;
  flex-direction: column;
  display: flex;
  justify-content: start;
  align-items: start;
  margin: 0 auto;
  background-color: #fff;
  overflow: hidden;
`;

const Wrapper = styled.div`
  min-height: 100%;
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
`;

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { initializeAuth } = useAuthStore();

  // 앱 시작 시 인증 상태 초기화 및 자동 로그인 (이 훅 하나로 라우팅 제어)
  useEffect(() => {
    const handleAuth = async () => {
      // 로그인 페이지에서는 자동 로그인 시도하지 않음
      if (location.pathname === "/login") {
        return;
      }

      // 토큰 확인
      const hasToken = initializeAuth();

      if (hasToken) {
        const result = await autoLogin();

        if (!result.success) {
          console.log("자동 로그인 실패:", result.message);
          if (result.shouldRedirectToLogin) {
            navigate("/login");
          }
        } else {
          console.log("✅ 자동 로그인 성공:", result.user);
        }
      } else {
        // 토큰이 없으면 로그인 페이지로 이동
        navigate("/login");
      }
    };

    handleAuth();
  }, [initializeAuth, navigate, location.pathname]);

  return (
    <>
      <GlobalStyle />
      <BackGroundColor>
        <Wrapper>
          <Outlet />
        </Wrapper>
      </BackGroundColor>
    </>
  );
}

export default App;
