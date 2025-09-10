import { useNavigate } from "react-router-dom";
import {
  Container,
  MainWrapper,
  Header,
  Logo,
  Title,
  Subtitle,
  GridContainer,
  Card,
  CardContent,
  IconContainer,
  IconWrapper,
  CardTitle,
  CardDescription,
  Button,
  Footer,
  AdminIconComponent,
  CitizenIconComponent,
} from "./UserTypeSelection.styles";

const UserTypeSelection = () => {
  const navigate = useNavigate();

  const handleUserTypeSelect = (userType) => {
    if (userType === "admin") {
      navigate("/admin");
    } else if (userType === "citizen") {
      navigate("/tablet");
    }
  };

  return (
    <Container>
      <MainWrapper>
        <Header>
          <Logo src="/logo.png" alt="양천구청 로고" />
          <Title>양천구청 AI 민원실</Title>
          <Subtitle>사용자 유형을 선택해주세요</Subtitle>
        </Header>

        <GridContainer>
          {/* 공무원용 카드 */}
          <Card onClick={() => handleUserTypeSelect("admin")}>
            <CardContent>
              <IconContainer>
                {/* 아이콘 배경은 연한 톤 (선택) */}
                <IconWrapper $bgColor="#F9D7DB" $hoverColor="#F5B4BD">
                  <AdminIconComponent />
                </IconWrapper>
              </IconContainer>
              <CardTitle>공무원용</CardTitle>
              <CardDescription>
                민원 관리 및 업무 처리를 위한
                <br />
                관리자 인터페이스
              </CardDescription>

              {/* 버튼 색상: #A93946 / hover #91212E */}
              <Button
                $bgColor="#A93946"
                $hoverColor="#91212E"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUserTypeSelect("admin");
                }}
              >
                공무원용 접속
              </Button>
            </CardContent>
          </Card>
          {/* 양천구민용 카드 */}
          <Card onClick={() => handleUserTypeSelect("citizen")}>
            <CardContent>
              <IconContainer>
                {/* 아이콘 배경은 연한 톤 (선택) */}
                <IconWrapper $bgColor="#FFE1CC" $hoverColor="#FFC79E">
                  <CitizenIconComponent />
                </IconWrapper>
              </IconContainer>
              <CardTitle>양천구민용</CardTitle>
              <CardDescription>
                민원 상담 및 신청을 위한
                <br />
                구민 전용 인터페이스
              </CardDescription>

              <Button
                $bgColor="#FF6A00"
                $hoverColor="#E65F00"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUserTypeSelect("citizen");
                }}
              >
                양천구민용 접속
              </Button>
            </CardContent>
          </Card>
        </GridContainer>

        <Footer>
          {/* <p>
            문의사항이 있으시면 ~~로 연락해주세요.
          </p> */}
        </Footer>
      </MainWrapper>
    </Container>
  );
};

export default UserTypeSelection;
