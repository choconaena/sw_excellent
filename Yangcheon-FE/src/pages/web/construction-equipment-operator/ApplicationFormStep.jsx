// src/views/admin/construction-equipment-operator/ApplicationFormStep.jsx
import { useState, useRef, useEffect } from "react";
import * as S from "./style";
import ValidationModal from "../../../components/modal/ValidationModal";
import { useAuthStore } from "../../../store/authStore";
import { useRoomBus } from "../../../ws/useRoomBus";
import { extractDataPayload } from "../../../ws/parseWs";
import { getSocket } from "../../../ws/socket";
import { useReportStore } from "../../../store/useReportStore";
import { submitLicenseInfo } from "../../../services/constructionGovService";

const ALLOWED_FIELDS = [
  "isreissue",
  "name",
  "gender",
  "residentNumber",
  "address",
  "phone",
  "licenseType",
  "reissueReason",
  "qualificationType",
  "registrationNumber",
  "licenseNumber",
  "issueDate",
];

const ApplicationFormStep = ({ formData, onInputChange, onNext }) => {
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 룸
  const userEmail = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = userEmail ? String(userEmail) : null;

  // ✅ 수신: 태블릿 → 웹
  useRoomBus(
    room,
    {
      onMessage: (p) => {
        const patch = extractDataPayload(p);
        if (!patch || typeof patch !== "object") return;
        Object.entries(patch).forEach(([k, v]) => {
          if (ALLOWED_FIELDS.includes(k)) onInputChange(k, v ?? "");
        });
      },
    },
    {
      verbose: true,
      tag: "construction-form-web-recv",
      tapAll: true,
      allowNoRoom: false,
    }
  );

  const { send } = useRoomBus(room, {}, { tag: "construction-form-web-send" });
  const { send: sendRoute } = useRoomBus(room, {}, { tag: "tablet-router" });

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

  const handleRadioChange = (field, value) => {
    onInputChange(field, value);
    pushPatch(field, value);
  };

  const validateRequiredFields = () => {
    const requiredFields = [
      { key: "qualificationType", label: "국가기술자격 종목 및 등급" },
      { key: "registrationNumber", label: "등록번호" },
      { key: "licenseNumber", label: "면허번호" },
      { key: "issueDate", label: "면허증 발급일" },
      { key: "name", label: "성명" },
      { key: "gender", label: "성별" },
      { key: "residentNumber", label: "주민등록번호" },
      { key: "address", label: "주소" },
      { key: "phone", label: "전화번호" },
    ];
    for (const f of requiredFields) {
      if (!formData[f.key] || String(formData[f.key]).trim() === "") {
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
      const res = await submitLicenseInfo(formData);
      const ok = res?.status === true && res?.reportid != null;

      if (!ok) {
        setValidationMessage(res?.msg || "전송에 실패했습니다.");
        setShowValidationModal(true);
        return;
      }

      // ✅ reportid 저장
      useReportStore.getState().setReportMeta({
        reportId: res.reportid,
        status: res.status,
        msg: res.msg,
      });

      const rid = Number(res.reportid);

      send({ msg: { msg_type: "data", content: { reportid: rid } } });

      // (선택) 태블릿에 성공 알림 패치
      try {
        send({
          msg: {
            msg_type: "data",
            content: { submitStatus: "ok", reportid: res.reportid },
          },
        });
      } catch (e) {
        void e;
      }

      alert(res?.msg || "발급 신청 정보 전송에 성공했습니다.");
      const dst =
        "/tablet/construction-equipment-operator?view=form&step=signature1";
      sendRoute({ msg: { msg_type: "page_move", content: { dst } } });
      onNext();
    } catch (e) {
      setValidationMessage(e?.message || "전송 중 오류가 발생했습니다.");
      setShowValidationModal(true);
    } finally {
      setLoading(false);
    }
  };

  const closeValidationModal = () => {
    setShowValidationModal(false);
    setValidationMessage("");
  };

  return (
    <S.Container>
      <S.Header>
        <S.Title>건설기계조종사면허증_2. 발급 신청 정보 입력</S.Title>
      </S.Header>

      <S.FormContent>
        {/* 국가기술자격 4필드 */}
        <S.QualificationRow>
          <S.FieldLabel>
            <S.Required>*</S.Required>국가기술자격
          </S.FieldLabel>
          <S.InlineGridFour>
            <div>
              <S.SubFieldLabel>① 종목 및 등급</S.SubFieldLabel>
              <S.FormInput
                type="text"
                value={formData.qualificationType}
                onChange={(e) => change("qualificationType", e.target.value)}
              />
            </div>
            <div>
              <S.SubFieldLabel>② 등록번호</S.SubFieldLabel>
              <S.FormInput
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => change("registrationNumber", e.target.value)}
              />
            </div>
            <div>
              <S.SubFieldLabel>③ 면허번호</S.SubFieldLabel>
              <S.FormInput
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => change("licenseNumber", e.target.value)}
              />
            </div>
            <div>
              <S.SubFieldLabel>④ 면허증 발급일</S.SubFieldLabel>
              <S.FormInput
                type="date"
                value={formData.issueDate}
                onChange={(e) => change("issueDate", e.target.value)}
              />
            </div>
          </S.InlineGridFour>
        </S.QualificationRow>

        {/* 안내 */}
        <S.InfoText>
          <span>↓</span>
          <span>민원인이 태블릿을 통해 직접 입력하는 정보입니다.</span>
        </S.InfoText>

        {/* 발급유형 + 2열 묶음 */}
        <S.GroupPanel>
          <S.FieldLabel>발급 유형</S.FieldLabel>
          <S.RadioGroup>
            <S.RadioOption>
              <S.RadioInput
                type="radio"
                name="isreissue"
                value="issue"
                checked={formData.isreissue === "issue"}
                onChange={(e) => handleRadioChange("isreissue", e.target.value)}
              />
              <S.RadioLabel>발급</S.RadioLabel>
            </S.RadioOption>
            <S.RadioOption>
              <S.RadioInput
                type="radio"
                name="isreissue"
                value="reissue"
                checked={formData.isreissue === "reissue"}
                onChange={(e) => handleRadioChange("isreissue", e.target.value)}
              />
              <S.RadioLabel>재발급</S.RadioLabel>
            </S.RadioOption>
          </S.RadioGroup>

          <S.TwoColGrid style={{ marginTop: "1.5rem" }}>
            <div>
              <S.FieldLabel>
                <S.Required>*</S.Required>성명
              </S.FieldLabel>
              <S.FormInput
                type="text"
                value={formData.name}
                onChange={(e) => change("name", e.target.value)}
              />
            </div>
            <div>
              <S.FieldLabel>
                <S.Required>*</S.Required>성별
              </S.FieldLabel>
              <S.RadioGroup>
                <S.RadioOption onClick={() => handleRadioChange("gender", 0)}>
                  <S.RadioInput
                    type="radio"
                    name="gender"
                    checked={Number(formData.gender) === 0}
                    onChange={() => handleRadioChange("gender", 0)}
                  />
                  <S.RadioLabel>남</S.RadioLabel>
                </S.RadioOption>
                <S.RadioOption onClick={() => handleRadioChange("gender", 1)}>
                  <S.RadioInput
                    type="radio"
                    name="gender"
                    checked={Number(formData.gender) === 1}
                    onChange={() => handleRadioChange("gender", 1)}
                  />
                  <S.RadioLabel>여</S.RadioLabel>
                </S.RadioOption>
              </S.RadioGroup>
            </div>

            <div>
              <S.FieldLabel>
                <S.Required>*</S.Required>주민등록번호
                <S.FieldNote>(외국인등록번호)</S.FieldNote>
              </S.FieldLabel>
              <S.FormInput
                type="text"
                value={formData.residentNumber}
                onChange={(e) => change("residentNumber", e.target.value)}
              />
            </div>
            <div>
              <S.FieldLabel>
                <S.Required>*</S.Required>주소
              </S.FieldLabel>
              <S.FormInput
                type="text"
                value={formData.address}
                onChange={(e) => change("address", e.target.value)}
              />
            </div>
            <div>
              <S.FieldLabel>
                <S.Required>*</S.Required>전화번호
              </S.FieldLabel>
              <S.FormInput
                type="text"
                value={formData.phone}
                onChange={(e) => change("phone", e.target.value)}
              />
            </div>
            <div>
              <S.FieldLabel>면허종류</S.FieldLabel>
              <S.FormInput
                type="text"
                value={formData.licenseType}
                onChange={(e) => change("licenseType", e.target.value)}
              />
            </div>
            <div>
              <S.FieldLabel>재발급 사유</S.FieldLabel>
              <S.TextArea
                value={formData.reissueReason || ""}
                onChange={(e) => change("reissueReason", e.target.value)}
                rows={3}
              />
            </div>
          </S.TwoColGrid>
        </S.GroupPanel>
      </S.FormContent>

      <S.ButtonContainer>
        <S.NextButton onClick={handleNext} disabled={loading}>
          {loading ? "전송 중..." : "다음"}
        </S.NextButton>
      </S.ButtonContainer>

      <ValidationModal
        isOpen={showValidationModal}
        onClose={closeValidationModal}
        message={validationMessage}
      />
    </S.Container>
  );
};

export default ApplicationFormStep;
