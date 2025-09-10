import { useNavigate } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import * as S from "./style";
import { useAuthStore } from "../../../store/authStore";

const WebHome = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuthStore();
  const displayName = isLoading ? "로딩중..." : user?.name || "사용자";

  const handleStartClick = () => {
    navigate("/consultation/start");
  };

  return (
    <MainLayout>
      <S.Container>
        <S.MainContent>
          <S.WelcomeSection>
            <S.WelcomeTitle>안녕하세요, {displayName}님</S.WelcomeTitle>
            <S.WelcomeMessage>
              AI 민원실에 오신 것을 환영합니다.
            </S.WelcomeMessage>
          </S.WelcomeSection>

          <S.ServiceBox>
            <S.ServiceTitle>스마트한 민원 응답을 위한 AI 파트너</S.ServiceTitle>
            <S.StartButton onClick={handleStartClick}>시작하기</S.StartButton>
          </S.ServiceBox>
        </S.MainContent>
      </S.Container>
    </MainLayout>
  );
};

export default WebHome;
