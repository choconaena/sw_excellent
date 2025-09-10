import { useState, useEffect } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";

export const useConsultationFlow = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [currentFlow, setCurrentFlow] = useState("default");
  const [isCompleted, setIsCompleted] = useState(false);
  const [requestType, setRequestType] = useState("정보공개청구"); //
  const [applicantData, setApplicantData] = useState({
    name: "",
    birthDate: "",
    address: "",
    passport: "",
    phone: "",
    email: "",
    fax: "",
    businessNumber: "",
  });

  const [summaryData, setSummaryData] = useState({
    content: "",
    isPublic: true,
  });

  const [methodData, setMethodData] = useState({
    disclosureMethods: [],
    receiveMethods: [],
    otherMethod: "",
  });

  const [feeData, setFeeData] = useState({
    exemptionType: "",
    exemptionReason: "",
  });

  // URL에서 step과 flow 파라미터 읽기
  const currentStep = Number.parseInt(searchParams.get("step")) || 1;
  const flowFromUrl = searchParams.get("flow") || "default";

  // URL 파라미터가 변경될 때 상태 동기화
  useEffect(() => {
    setCurrentFlow(flowFromUrl);
  }, [flowFromUrl]);

  // URL 파라미터 업데이트 함수
  const updateUrlParams = (flow, step) => {
    const params = new URLSearchParams(searchParams);

    if (flow === "default") {
      // 기본 상태일 때는 파라미터 제거
      params.delete("flow");
      params.delete("step");
    } else {
      params.set("flow", flow);
      params.set("step", step.toString());
    }

    setSearchParams(params);
  };

  const handleServiceClick = (serviceId, reqType = "정보공개청구") => {
    setRequestType(reqType); // ✅ 여기서 저장
    if (serviceId === 1) {
      setCurrentFlow("info-request");
      updateUrlParams("info-request", 1);
    }
  };

  const handleNextStep = () => {
    if (currentFlow === "info-request" && currentStep < 7) {
      const nextStep = currentStep + 1;
      updateUrlParams(currentFlow, nextStep);
    }
  };

  const handlePrevStep = () => {
    if (currentFlow === "info-request" && currentStep > 1) {
      const prevStep = currentStep - 1;
      updateUrlParams(currentFlow, prevStep);
    } else if (currentFlow === "info-request" && currentStep === 1) {
      // 첫 번째 단계에서 이전으로 가면 기본 화면으로
      navigate("/consultation/start");
      resetFlow();
    }
  };

  const handleInputChange = (field, value) => {
    setApplicantData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSummaryDataChange = (field, value) => {
    setSummaryData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMethodDataChange = (field, value) => {
    setMethodData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFeeDataChange = (field, value) => {
    setFeeData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleComplete = () => {
    // 완료 처리 로직
    console.log("정보공개청구 완료", {
      applicantData,
      summaryData,
      methodData,
      feeData,
    });
    // 완료 상태를 true로 설정
    setIsCompleted(true);
  };
  const resetFlow = () => {
    setCurrentFlow("default");
    setIsCompleted(false);
    updateUrlParams("default", 1);
    setApplicantData({
      name: "",
      birthDate: "",
      address: "",
      passport: "",
      phone: "",
      email: "",
      fax: "",
      businessNumber: "",
    });
    setSummaryData({
      content: "",
      isPublic: true,
    });
    setMethodData({
      disclosureMethods: [],
      receiveMethods: [],
      otherMethod: "",
    });
    setFeeData({
      exemptionType: "",
      exemptionReason: "",
    });
    setRequestType("정보공개청구");
  };

  // 직접 URL로 접근했을 때 유효성 검사
  useEffect(() => {
    const flow = searchParams.get("flow");
    const step = Number.parseInt(searchParams.get("step"));

    if (flow && step) {
      // 유효하지 않은 조합인 경우 기본 상태로 리다이렉트
      if (flow === "info-request" && (step < 1 || step > 7)) {
        updateUrlParams("default", 1);
      } else if (flow !== "info-request" && flow !== "default") {
        updateUrlParams("default", 1);
      }
    }
  }, [searchParams]);

  return {
    currentFlow,
    currentStep,
    isCompleted,
    applicantData,
    summaryData,
    methodData,
    feeData,
    requestType,

    handleServiceClick,
    handleNextStep,
    handlePrevStep,
    handleInputChange,
    handleSummaryDataChange,
    handleMethodDataChange,
    handleFeeDataChange,
    handleComplete,
    resetFlow,
  };
};
