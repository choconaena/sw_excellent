// src/components/consultation/ApplicantForm.jsx
import { useEffect, useRef, useState } from "react";
import * as S from "./ConsultationComponentStyles";
import ValidationModal from "../../../../../components/modal/ValidationModal";
import { submitApplicantDataWeb } from "../../../../../services/consultationService";
import { useReportStore } from "../../../../../store/useReportStore";
import { useAuthStore } from "../../../../../store/authStore";
import { useRoomBus } from "../../../../../ws/useRoomBus";
import { extractDataPayload } from "../../../../../ws/parseWs";
import { getSocket } from "../../../../../ws/socket";

const ALLOWED_FIELDS = [
  "name",
  "birthDate",
  "address",
  "passport",
  "phone",
  "email",
  "fax",
  "businessNumber",
  "gender",
];

const ApplicantForm = ({ applicantData, onInputChange, onNext, onPrev }) => {
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const reportId = useReportStore((s) => s.reportId);

  const userEmail = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = userEmail ? String(userEmail) : null;

  // ✅ 수신용: 태블릿 → 웹 (기존 유지)
  useRoomBus(
    room,
    {
      onMessage: (p) => {
        const patch = extractDataPayload(p);
        if (!patch || typeof patch !== "object") return;
        Object.entries(patch).forEach(([k, v]) => onInputChange(k, v ?? ""));
      },
    },
    { verbose: true, tag: "form-web-recv", tapAll: true, allowNoRoom: false }
  );

  // ✅ 송신용: 웹 → 태블릿
  const { send } = useRoomBus(room, {}, { tag: "form-web-send" });

  // ✅ 디바운스 패치 송신
  const patchRef = useRef({});
  const timerRef = useRef(null);
  const pushPatch = (field, value) => {
    if (!ALLOWED_FIELDS.includes(field)) return;
    patchRef.current[field] = value;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const payload = {};
      for (const [k, v] of Object.entries(patchRef.current)) {
        if (ALLOWED_FIELDS.includes(k)) payload[k] = v;
      }
      patchRef.current = {};
      timerRef.current = null;
      if (Object.keys(payload).length) {
        send({ msg: { msg_type: "data", content: payload } });
      }
    }, 150);
  };

  // ✅ 공용 변경 핸들러(부모에도 반영 + 패치도 송신)
  const change = (key, val) => {
    onInputChange(key, val);
    pushPatch(key, val);
  };

  useEffect(() => {
    const s = getSocket();
    const tap = (p) => console.log("[RAW room:message] <-", p);
    s.on("room:message", tap);
    return () => s.off("room:message", tap);
  }, []);

  const validateRequiredFields = () => {
    if (!reportId) {
      setValidationMessage(
        "reportId가 없습니다. STT 세션을 먼저 시작해 주세요."
      );
      setShowValidationModal(true);
      return false;
    }
    // validateRequiredFields 내부
    const required = [
      { key: "name", label: "성명" },
      { key: "birthDate", label: "생년월일" },
      { key: "address", label: "주소" },
      { key: "phone", label: "전화번호" },
      { key: "email", label: "전자우편주소" },
    ];

    for (const f of required) {
      const v = (applicantData[f.key] ?? "").toString().trim();
      if (!v) {
        setValidationMessage(`${f.label}은(는) 필수 입력 항목입니다.`);
        setShowValidationModal(true);
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateRequiredFields()) return;
    try {
      setLoading(true);
      const res = await submitApplicantDataWeb({
        ...applicantData,
        email: (applicantData.email || "").trim(),
      });
      const ok = res?.success === true || res?.status === true;
      if (!ok)
        throw new Error(
          res?.message || res?.msg || "청구인 정보 전송에 실패했습니다."
        );
      alert(res?.message || res?.msg || "정보 전송되었습니다.");
      onNext();
    } catch {
      setValidationMessage("전송 중 오류가 발생했습니다.");
      setShowValidationModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <S.RightPanel>
      <S.StepHeader>
        <S.StepNavigation>
          <S.BackButton onClick={onPrev}>← 이전</S.BackButton>
          <S.StepTitle>정보공개청구_2. 청구인 정보 입력</S.StepTitle>
        </S.StepNavigation>
      </S.StepHeader>

      <S.FormSection>
        <S.FormField>
          <S.FieldLabel>
            <S.Required>*</S.Required>성명
            <S.FieldNote>(법인 · 단체명 및 대표자 성명)</S.FieldNote>
          </S.FieldLabel>
          <S.FormInput
            type="text"
            value={applicantData.name || ""}
            onChange={(e) => change("name", e.target.value)} // ✅ 변경
            placeholder="예시) 홍길동"
          />
        </S.FormField>
        <S.FormField>
          <S.FieldLabel>
            <S.Required>*</S.Required>생년월일<S.FieldNote> (성별)</S.FieldNote>
          </S.FieldLabel>
          <S.InlineControls>
            <S.FormInput
              type="date"
              value={applicantData.birthDate || ""}
              onChange={(e) => change("birthDate", e.target.value)}
            />
            {/* 성별 선택 */}
            <S.RadioGroup style={{ marginTop: "0.75rem" }}>
              <S.RadioOption onClick={() => change("gender", 0)}>
                <S.RadioInput
                  type="radio"
                  name="gender"
                  checked={Number(applicantData.gender) === 0}
                  onChange={() => change("gender", 0)}
                />
                <S.RadioLabel>남</S.RadioLabel>
              </S.RadioOption>
              <S.RadioOption onClick={() => change("gender", 1)}>
                <S.RadioInput
                  type="radio"
                  name="gender"
                  checked={Number(applicantData.gender) === 1}
                  onChange={() => change("gender", 1)}
                />
                <S.RadioLabel>여</S.RadioLabel>
              </S.RadioOption>
            </S.RadioGroup>
          </S.InlineControls>
        </S.FormField>
        <S.FormField>
          <S.FieldLabel>
            <S.Required>*</S.Required>주소 (소재지)
            <S.FieldNote> 상세 주소까지 필수 작성</S.FieldNote>
          </S.FieldLabel>
          <S.FormInput
            type="text"
            value={applicantData.address || ""}
            onChange={(e) => change("address", e.target.value)} // ✅ 변경
            placeholder="예시) 서울시 양천구 목동로 233, 101동 1001호"
          />
        </S.FormField>
        <S.FormField>
          <S.FieldLabel>
            여권 · 외국인등록번호<S.FieldNote>(외국인의 경우 작성)</S.FieldNote>
          </S.FieldLabel>
          <S.FormInput
            type="text"
            value={applicantData.passport || ""}
            onChange={(e) => change("passport", e.target.value)} // ✅ 변경
            placeholder="여권 · 외국인등록번호를 입력하세요"
          />
        </S.FormField>
        <S.InfoText>
          ↓ 민원인이 태블릿을 통해 직접 입력하는 정보입니다.
        </S.InfoText>

        <S.FormField>
          <S.FieldLabel>
            <S.Required>*</S.Required>전화번호
            <S.FieldNote>(또는 휴대전화번호)</S.FieldNote>
          </S.FieldLabel>
          <S.FormInput
            type="tel"
            value={applicantData.phone || ""}
            onChange={(e) => change("phone", e.target.value)}
          />
        </S.FormField>

        <S.FormField>
          <S.FieldLabel>
            <S.Required>*</S.Required>전자우편주소
          </S.FieldLabel>
          <S.FormInput
            type="email"
            value={applicantData.email || ""}
            onChange={(e) => change("email", e.target.value)}
          />
        </S.FormField>
        <S.FormField>
          <S.FieldLabel>팩스번호</S.FieldLabel>
          <S.FormInput
            type="tel"
            value={applicantData.fax || ""}
            onChange={(e) => change("fax", e.target.value)} // ✅ 변경
          />
        </S.FormField>
        <S.FormField>
          <S.FieldLabel>
            사업자<S.FieldNote>(법인 · 단체)</S.FieldNote> 등록번호
          </S.FieldLabel>
          <S.FormInput
            type="text"
            value={applicantData.businessNumber || ""}
            onChange={(e) => change("businessNumber", e.target.value)} // ✅ 변경
          />
        </S.FormField>
        <S.ButtonGroup>
          <S.PrevButton onClick={onPrev} disabled={loading}>
            이전
          </S.PrevButton>
          <S.NextButton onClick={handleNext} disabled={loading}>
            {loading ? "전송 중..." : "다음"}
          </S.NextButton>
        </S.ButtonGroup>
      </S.FormSection>

      <ValidationModal
        isOpen={showValidationModal}
        onClose={() => {
          setShowValidationModal(false);
          setValidationMessage("");
        }}
        message={validationMessage}
      />
    </S.RightPanel>
  );
};

export default ApplicantForm;
