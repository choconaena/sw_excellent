import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const useConstructionEquipmentFlow = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  //   const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [formData, setFormData] = useState({
    qualificationType: "",
    registrationNumber: "",
    licenseNumber: "",
    issueDate: "",
    issueType: "issue", // 'issue' or 'reissue'
    name: "",
    residentNumber: "",
    address: "",
    phone: "",
    licenseType: "",
    reissueReason: "",
  });

  // URL에서 step 파라미터 읽기
  const stepFromUrl = Number.parseInt(searchParams.get("step")) || 1;

  // URL 파라미터가 변경될 때 상태 동기화
  useEffect(() => {
    setCurrentStep(stepFromUrl);
  }, [stepFromUrl]);

  // URL 파라미터 업데이트 함수
  const updateUrlParams = (step) => {
    const params = new URLSearchParams(searchParams);
    params.set("step", step.toString());
    setSearchParams(params);
  };

  const handleNextStep = () => {
    if (currentStep < 5) {
      const nextStep = currentStep + 1;
      updateUrlParams(nextStep);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleComplete = () => {
    console.log("건설기계조종사면허(재)발급 완료", formData);
    setIsCompleted(true);
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setIsCompleted(false);
    updateUrlParams(1);
    setFormData({
      qualificationType: "",
      registrationNumber: "",
      licenseNumber: "",
      issueDate: "",
      issueType: "issue",
      name: "",
      residentNumber: "",
      address: "",
      phone: "",
      licenseType: "",
      reissueReason: "",
    });
  };

  // 직접 URL로 접근했을 때 유효성 검사
  useEffect(() => {
    const step = Number.parseInt(searchParams.get("step"));
    if (step && (step < 1 || step > 5)) {
      updateUrlParams(1); // 유효하지 않은 단계면 첫 단계로 리다이렉트
    }
  }, [searchParams]);

  return {
    currentStep,
    isCompleted,
    formData,
    handleNextStep,
    handleInputChange,
    handleComplete,
    resetFlow,
  };
};
