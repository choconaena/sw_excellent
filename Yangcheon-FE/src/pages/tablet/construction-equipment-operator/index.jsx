// src/views/tablet/construction-equipment-operator/index.jsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom"; // ★ 추가
import * as S from "./style";
import TabletHeader from "../../../components/tablet/Header";
import ApplicationFormView from "./components/ApplicationFormView";
import RequirementsView from "./components/RequirementsView";
import Signature1View from "./components/Signature1View";
import Signature2View from "./components/Signature2View";
import CompletionView from "./components/CompletionView";
import { useReportStore } from "../../../store/useReportStore";
import { useAuthStore } from "../../../store/authStore";
import { useRoomBus } from "../../../ws/useRoomBus";
import { extractDataPayload } from "../../../ws/parseWs";

const ConstructionEquipmentOperator = () => {
  const [searchParams] = useSearchParams(); // ★ 추가
  const [currentView, setCurrentView] = useState("form");
  const [applicationData, setApplicationData] = useState({
    issueType: "발급",
    name: "",
    residentNumber: "",
    address: "",
    phone: "",
    licenseType: "",
    reissueReason: "",
  });

  // ★ reportId 저장 함수
  const setReportMeta = useReportStore((s) => s.setReportMeta);

  // ★ 룸 설정 (WS 양방향 위해)
  const email = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = email ? String(email) : null;

  // URL 파라미터로 현재 뷰 결정
  useEffect(() => {
    const view = searchParams.get("view") || "form";
    const step = searchParams.get("step");

    if (view === "form" && step) {
      switch (step) {
        case "requirements":
          setCurrentView("requirements");
          break;
        case "signature1":
          setCurrentView("signature1");
          break;
        case "signature2":
          setCurrentView("signature2");
          break;
        case "complete":
          setCurrentView("completion");
          break;
        default:
          setCurrentView("form");
      }
    } else {
      setCurrentView("form");
    }
  }, [searchParams]);

  // ★ URL 쿼리의 rid를 store에 저장 (웹에서 page_move 시 같이 보낸 값)
  useEffect(() => {
    const rid = searchParams.get("rid");
    if (rid) setReportMeta({ reportId: Number(rid) });
  }, [searchParams, setReportMeta]);

  // ★ 웹에서 data 메시지로 reportid를 보내줄 때도 저장
  useRoomBus(
    room,
    {
      onMessage: (p) => {
        const patch = extractDataPayload(p); // {msg_type:"data", content:{...}}
        const rid = patch?.reportid;
        if (typeof rid !== "undefined") {
          setReportMeta({ reportId: Number(rid) });
        }
      },
    },
    { tag: "construction-tablet-reportid" }
  );

  const handleFormSubmit = (form) => {
    setApplicationData(form);
    console.log("신청 정보:", form);
  };

  const handleSignature1Complete = (signatureData) => {
    console.log("첫 번째 서명 완료:", signatureData);
  };

  const handleSignature2Complete = (signatureData) => {
    console.log("두 번째 서명 완료:", signatureData);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "requirements":
        return <RequirementsView />;
      case "signature1":
        return <Signature1View onComplete={handleSignature1Complete} />;
      case "signature2":
        return <Signature2View onComplete={handleSignature2Complete} />;
      case "completion":
        return <CompletionView applicationData={applicationData} />;
      default:
        return <ApplicationFormView onSubmit={handleFormSubmit} />;
    }
  };

  return (
    <S.Container>
      <TabletHeader />
      <S.Content>{renderCurrentView()}</S.Content>
    </S.Container>
  );
};

export default ConstructionEquipmentOperator;
