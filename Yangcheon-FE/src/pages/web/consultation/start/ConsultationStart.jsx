import MainLayout from "../../../../layouts/MainLayout";
import DefaultConsultationView from "../DefaultConsultationView";
import * as S from "../style";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../../../../store/authStore";
import { useRoomBus } from "../../../../ws/useRoomBus";

const ConsultationStart = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // ✅ 방 식별 (예: 이메일 기준)
  const email = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = email ? String(email) : null;

  // ✅ Bus 핸들 생성 (웹→테블릿)
  const { send } = useRoomBus(room, {}, { tag: "start-consultation" });

  const services = [
    {
      id: 1,
      title: "정보공개청구",
      icon: "📋",
      requiresRecording: true, // 녹음 O 업무
    },
    {
      id: 2,
      title: "건설기계조종사면허(재)발급",
      icon: "🚜",
      requiresRecording: false, // 녹음 X 업무
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // 검색 로직
  };

  const handleServiceClick = (id) => {
    if (id === 1) {
      // 1) 웹 페이지 이동
      navigate("/consultation?flow=info-request&step=1");

      // 2) 테블릿 화면 이동 (consent-collection)
      send({
        msg: {
          msg_type: "page_move",
          content: {
            dst: "/tablet/consultation?view=form&step=consent-collection",
          },
        },
      });
    } else if (id === 2) {
      navigate("/construction-equipment-operator?step=1");

      send({
        msg: {
          msg_type: "page_move",
          content: {
            dst: "/tablet/construction-equipment-operator?step=1",
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
