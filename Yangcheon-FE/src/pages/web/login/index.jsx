import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAndFetchProfile } from "../../../services/authService";
import * as S from "./style";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // 입력 시 에러 메시지 초기화
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await loginAndFetchProfile(formData);

      console.log("✅ 로그인 성공:", result.user);
      navigate("/"); // 홈으로 이동
    } catch (err) {
      console.error("🚫 로그인 실패:", err);
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <S.Container>
      <S.LoginCard>
        <S.LogoSection>
          <S.LogoIcon src="/logo.png" alt="양천하이 로고" />
          <S.LogoText>양천하이</S.LogoText>
          <S.Subtitle>스마트한 민원 응답을 위한 AI 파트너</S.Subtitle>
        </S.LogoSection>

        <S.LoginForm onSubmit={handleSubmit}>
          <S.FormField>
            <S.FieldLabel>이메일</S.FieldLabel>
            <S.FormInput
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="이메일을 입력하세요"
              required
            />
          </S.FormField>

          <S.FormField>
            <S.FieldLabel>비밀번호</S.FieldLabel>
            <S.FormInput
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </S.FormField>

          {error && <S.ErrorMessage>{error}</S.ErrorMessage>}

          <S.LoginButton type="submit" disabled={isLoading}>
            {isLoading ? "로그인 중..." : "로그인"}
          </S.LoginButton>
        </S.LoginForm>

        <S.Footer>
          <S.FooterText>
            양천구청 AI 민원실 시스템에 오신 것을 환영합니다.
          </S.FooterText>
        </S.Footer>
      </S.LoginCard>
    </S.Container>
  );
};

export default Login;
