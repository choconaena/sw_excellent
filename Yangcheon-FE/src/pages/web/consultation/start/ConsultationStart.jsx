import MainLayout from "../../../../layouts/MainLayout";
import DefaultConsultationView from "../DefaultConsultationView";
import * as S from "../style";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../../../store/authStore";
import { useRoomBus } from "../../../../ws/useRoomBus";

const ConsultationStart = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState([
    // 기본 양식들을 미리 설정 (API 로드되면 업데이트됨)
    {
      id: "information_open",
      title: "정보공개청구",
      icon: "📋",
      requiresRecording: true,
      isSystem: true,
      route: "https://yangcheon.ai.kr:28443/정보공개청구",
      tabletRoute: "https://yangcheon.ai.kr:28443/tablet/consultation?view=form&step=consent-collection"
    },
    {
      id: "construction_machinery_license",
      title: "건설기계조종사면허(재)발급",
      icon: "🚜",
      requiresRecording: false,
      isSystem: true,
      route: "https://yangcheon.ai.kr:28443/건설기계조종사면허",
      tabletRoute: "https://yangcheon.ai.kr:28443/tablet/construction-equipment-operator?step=1"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ 방 식별 (예: 이메일 기준)
  const email = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = email ? String(email) : null;

  // ✅ Bus 핸들 생성 (웹→테블릿)
  const { send } = useRoomBus(room, {}, { tag: "start-consultation" });

  // 양식 목록 불러오기 (백그라운드에서 로드하여 새 양식들 추가)
  useEffect(() => {
    const loadForms = async () => {
      try {
        const response = await fetch('http://localhost:23000/forms');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log('양식 목록 로드 완료:', result.data);

            // 서버 데이터를 UI용 형태로 변환
            const formattedServices = result.data.map((form, index) => ({
              id: form.id,
              title: form.title,
              icon: form.icon,
              requiresRecording: form.requiresRecording,
              isSystem: form.isSystem,
              route: form.route,
              tabletRoute: form.tabletRoute,
              schema: form.schema,
              formName: form.formName
            }));

            // 서버에서 로드된 양식들로 업데이트 (기본 양식 + 새 양식)
            setServices(formattedServices);
          } else {
            console.error('양식 목록 로드 실패:', result.error);
            // 실패 시 기본 양식들 유지 (이미 초기값으로 설정됨)
          }
        } else {
          console.error('양식 목록 API 호출 실패:', response.status);
          // 실패 시 기본 양식들 유지
        }
      } catch (error) {
        console.error('양식 목록 로드 오류:', error);
        // 오류 시 기본 양식들 유지
      }
    };

    loadForms();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // 검색 로직
  };

  const handleServiceClick = (formId) => {
    const selectedService = services.find(s => s.id === formId);

    if (!selectedService) {
      console.error('선택된 서비스를 찾을 수 없습니다:', formId);
      return;
    }

    console.log('서비스 선택:', selectedService);

    // 시스템 양식들은 기존 로직 유지
    if (selectedService.isSystem) {
      if (formId === "information_open") {
        navigate("/consultation?flow=info-request&step=1");
        send({
          msg: {
            msg_type: "page_move",
            content: {
              dst: "https://yangcheon.ai.kr:28443/tablet/consultation?view=form&step=consent-collection",
            },
          },
        });
      } else if (formId === "construction_machinery_license") {
        navigate("/construction-equipment-operator?step=1");
        send({
          msg: {
            msg_type: "page_move",
            content: {
              dst: "https://yangcheon.ai.kr:28443/tablet/construction-equipment-operator?step=1",
            },
          },
        });
      }
    } else {
      // 동적 생성된 양식들은 새로운 로직
      navigate('/dynamic-consultation', {
        state: {
          formSchema: selectedService.schema,
          formName: selectedService.formName || selectedService.title
        }
      });

      send({
        msg: {
          msg_type: "page_move",
          content: {
            dst: selectedService.tabletRoute,
          },
        },
      });
    }
  };

  return (
    <MainLayout>
      <S.Container>
        <S.MainContent $isDefaultFlow={true}>
          <DefaultConsultationView
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearch={handleSearch}
            services={services}
            onServiceClick={handleServiceClick}
          />
        </S.MainContent>
      </S.Container>
    </MainLayout>
  );
};

export default ConsultationStart;
