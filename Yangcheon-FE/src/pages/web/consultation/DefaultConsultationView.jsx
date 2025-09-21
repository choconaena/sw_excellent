// DefaultConsultationView.jsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./style";

const normalize = (v) =>
  String(v ?? "")
    .toLowerCase()
    .replace(/\s+/g, ""); // 공백 무시, 대소문자 무시

const DefaultConsultationView = ({
  searchQuery,
  onSearchChange,
  onSearch, // 필요 시 외부에 알림용(선택)
  services = [],
  onServiceClick,
}) => {
  const navigate = useNavigate();
  // 1) 검색어로 서비스 목록 필터링
  const filteredServices = useMemo(() => {
    const q = normalize(searchQuery);
    if (!q) return services;

    return services.filter((s) => {
      const buckets = [
        s.title,
        ...(s.keywords || []), // 키워드/별칭이 있으면 함께 매칭
        ...(s.aliases || []),
      ];
      return buckets.some((b) => normalize(b).includes(q));
    });
  }, [services, searchQuery]);

  // 2) 녹음/일반 분리
  const recordingServices = filteredServices.filter((s) => s.requiresRecording);
  const nonRecordingServices = filteredServices.filter(
    (s) => !s.requiresRecording
  );

  // 3) 폼 submit
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(searchQuery); // 외부에 이벤트 알리고 싶으면 사용, 아니면 생략 가능
  };

  return (
    <S.DefaultViewContainer>
      <S.CombinedSearchBox>
        <S.CombinedSearchTitle>
          🔍 양천구민께서 어떤 업무로 방문하셨나요?
        </S.CombinedSearchTitle>

        {/* 반드시 form이어야 onSubmit이 정상 동작합니다 */}
        <S.CombinedSearchInputWrapper onSubmit={handleSubmit}>
          <S.CombinedSearchInput
            type="text"
            placeholder="업무명을 검색해보세요..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <S.CombinedSearchButton type="submit">
            <S.CombinedSearchIcon>🔍</S.CombinedSearchIcon>
          </S.CombinedSearchButton>
        </S.CombinedSearchInputWrapper>
      </S.CombinedSearchBox>

      <S.ServiceCategoriesWrapper>
        <S.ServiceSection>
          <S.SectionHeader>
            <S.RecordingBadge $isRecording>REC</S.RecordingBadge>
            <S.SectionTitle>녹음이 필요한 업무</S.SectionTitle>
          </S.SectionHeader>
          <S.ServiceGrid>
            {recordingServices.map((service) => (
              <S.ServiceCard
                key={service.id}
                $isRecording
                onClick={() => onServiceClick(service.id, service.title)}
              >
                <S.ServiceHeader>
                  <S.ServiceEmoji>📋</S.ServiceEmoji>
                  <S.ServiceBadgeInCard $isRecording>
                    <S.RecordingDot />
                    녹음
                  </S.ServiceBadgeInCard>
                </S.ServiceHeader>
                <S.ServiceContent>
                  <S.ServiceTitle>{service.title}</S.ServiceTitle>
                  <S.ServiceDescription>
                    상담 내용이 자동으로 기록됩니다
                  </S.ServiceDescription>
                </S.ServiceContent>
                <S.ServiceArrow $isRecording>→</S.ServiceArrow>
              </S.ServiceCard>
            ))}
          </S.ServiceGrid>
        </S.ServiceSection>

        <S.ServiceSection>
          <S.SectionHeader>
            <S.RecordingBadge $isRecording={false}>일반</S.RecordingBadge>
            <S.SectionTitle>일반 업무</S.SectionTitle>
          </S.SectionHeader>
          <S.ServiceGrid>
            {nonRecordingServices.map((service) => (
              <S.ServiceCard
                key={service.id}
                $isRecording={false}
                onClick={() => onServiceClick(service.id, service.title)}
              >
                <S.ServiceHeader>
                  <S.ServiceEmoji>🚜</S.ServiceEmoji>
                  <S.ServiceBadgeInCard $isRecording={false}>
                    일반
                  </S.ServiceBadgeInCard>
                </S.ServiceHeader>
                <S.ServiceContent>
                  <S.ServiceTitle>{service.title}</S.ServiceTitle>
                  <S.ServiceDescription>
                    빠른 처리가 가능한 업무입니다
                  </S.ServiceDescription>
                </S.ServiceContent>
                <S.ServiceArrow $isRecording={false}>→</S.ServiceArrow>
              </S.ServiceCard>
            ))}

            {/* 신규 양식 추가 카드 */}
            <S.AddFormCard onClick={() => navigate("/admin/form-generator")}>
              <S.AddFormHeader>
                <S.AddFormIcon>➕</S.AddFormIcon>
                <S.AddFormBadge>관리자</S.AddFormBadge>
              </S.AddFormHeader>
              <S.AddFormContent>
                <S.AddFormTitle>새 양식 추가</S.AddFormTitle>
                <S.AddFormDescription>
                  새로운 민원 양식을 시스템에 추가
                </S.AddFormDescription>
              </S.AddFormContent>
              <S.AddFormArrow>→</S.AddFormArrow>
            </S.AddFormCard>
          </S.ServiceGrid>
        </S.ServiceSection>
      </S.ServiceCategoriesWrapper>
    </S.DefaultViewContainer>
  );
};

export default DefaultConsultationView;
