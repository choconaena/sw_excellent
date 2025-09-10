import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import * as S from "./style";
import WelcomeView from "../WelcomeView";
import ChatView from "./components/ChatView";
import ApplicantFormView from "./components/ApplicantFormView";
import SummaryView from "./components/SummaryView";
import MethodSelectionView from "./components/MethodSelectionView";
import SignatureView from "./components/SignatureView";
import ConsentSignatureView from "./components/consent/ConsentSignatureView";
import CompletionView from "./components/CompletionView";
import FeeExemptionView from "./components/FeeExemptionView";
import TabletHeader from "../../../components/tablet/Header";
import ConsentCollectionView from "./components/consent/ConsentCollectionView";

const TabletConsultation = () => {
  const [searchParams] = useSearchParams();
  const [currentView, setCurrentView] = useState("welcome");
  const [messages, setMessages] = useState([]);
  const [summaryData] = useState(null);

  // 동의 상태(필요 시 웹으로도 전달 가능)
  const [consentCollection, setConsentCollection] = useState(null); // true/false

  useEffect(() => {
    const view = searchParams.get("view") || "welcome";
    const step = searchParams.get("step");

    if (view === "chat") {
      setCurrentView("chat");
      return;
    }

    if (view === "form" && step) {
      switch (step) {
        case "consent-collection":
          setCurrentView("consent-collection");
          return;
        case "consent-thirdparty":
          setCurrentView("consent-thirdparty");
          return;
        case "applicant":
          setCurrentView("applicant-form");
          return;
        case "summary":
          setCurrentView("summary");
          return;
        case "method":
          setCurrentView("method-selection");
          return;
        case "fee":
          setCurrentView("fee-exemption");
          return;
        case "signature":
          setCurrentView("signature");
          return;

        case "consentsignature":
          setCurrentView("consentsignature");
          return;
        case "complete":
          setCurrentView("completion");
          return;
        default:
          setCurrentView("welcome");
      }
    } else {
      setCurrentView("welcome");
    }
  }, [searchParams]);

  // 예시 메시지
  useEffect(() => {
    if (currentView === "chat") {
      setMessages([{ content: "실시간 상담입니다.", isUser: true }]);
    }
  }, [currentView]);

  // 동의 화면 핸들러
  const handleConsentCollection = (agreed) => {
    setConsentCollection(agreed);
    console.log("[동의① 수집·이용] :", agreed);
    if (!agreed) {
      // 동의하지 않음
      return;
    }
    // 다음 동의 화면으로 이동
    setCurrentView("consentsignature");
  };

  const handleApplicantFormSubmit = (formData) => {
    console.log("신청인 정보:", formData);
  };

  const handleMethodSelectionSubmit = (methodData) => {
    console.log("공개/수령 방법:", methodData);
  };

  const handleSignatureComplete = () => {
    console.log("서명 완료");
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "chat":
        return <ChatView messages={messages} />;

      case "consent-collection":
        return (
          <ConsentCollectionView
            onAgree={() => handleConsentCollection(true)}
            onDisagree={() => handleConsentCollection(false)}
          />
        );

      case "applicant-form":
        return <ApplicantFormView onSubmit={handleApplicantFormSubmit} />;

      case "summary":
        return <SummaryView summaryData={summaryData} />;

      case "method-selection":
        return <MethodSelectionView onSubmit={handleMethodSelectionSubmit} />;

      case "fee-exemption":
        return <FeeExemptionView />;

      case "signature":
        return <SignatureView onComplete={handleSignatureComplete} />;

      case "consentsignature":
        return <ConsentSignatureView />;
      case "completion":
        return <CompletionView />;

      default:
        return <WelcomeView />;
    }
  };

  return (
    <S.Container>
      <TabletHeader />
      <S.Content>{renderCurrentView()}</S.Content>
    </S.Container>
  );
};

export default TabletConsultation;
