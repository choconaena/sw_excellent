import { useState, useRef } from "react";
import * as S from "../style";
import { useAuthStore } from "../../../../store/authStore";
import { useRoomBus } from "../../../../ws/useRoomBus";
import { extractDataPayload } from "../../../../ws/parseWs";

const ALLOWED_FIELDS = [
  "isreissue",
  "name",
  "gender",
  "residentNumber",
  "address",
  "phone",
  "licenseType",
  "reissueReason",
];

const ApplicationFormView = () => {
  const [formData, setFormData] = useState({
    isreissue: "", // ✅ "issue" / "reissue" 로 통일
    name: "",
    gender: null,
    residentNumber: "",
    address: "",
    phone: "",
    licenseType: "",
    reissueReason: "",
  });

  const userEmail = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = userEmail ? String(userEmail) : null;

  // ✅ 태블릿 → 웹 송신
  const { send } = useRoomBus(room, {}, { tag: "construction-app-send" });

  // ✅ 웹 → 태블릿 수신 (ALLOWED_FIELDS 전체 반영)
  useRoomBus(
    room,
    {
      onMessage: (p) => {
        const patch = extractDataPayload(p);
        if (!patch || typeof patch !== "object") return;
        setFormData((prev) => {
          const next = { ...prev };
          for (const [k, v] of Object.entries(patch)) {
            if (ALLOWED_FIELDS.includes(k)) next[k] = v ?? "";
          }
          return next;
        });
      },
    },
    { tag: "construction-app-recv" }
  );

  // ✅ 디바운스 송신
  const patchRef = useRef({});
  const timerRef = useRef(null);
  const pushPatch = (field, value) => {
    if (!ALLOWED_FIELDS.includes(field)) return;
    patchRef.current[field] = value;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const payload = { ...patchRef.current };
      patchRef.current = {};
      timerRef.current = null;
      if (Object.keys(payload).length) {
        send({ msg: { msg_type: "data", content: payload } });
      }
    }, 200);
  };

  const handleInputChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
    pushPatch(field, value);
  };

  return (
    <S.FormContainer>
      <S.Title>발급신청 정보 입력</S.Title>
      <S.Subtitle>
        건설기계조종사 면허증 발급 처리를 위한 정보 입력받습니다.
      </S.Subtitle>

      <S.FormContent>
        <S.FormSection>
          <S.SectionTitle>발급 유형</S.SectionTitle>
          <S.RadioGroup>
            <S.RadioOption>
              <S.RadioInput
                type="radio"
                name="isreissue"
                value="issue"
                checked={formData.isreissue === "issue"}
                onChange={(e) => handleInputChange("isreissue", e.target.value)}
              />
              <S.RadioLabel>발급</S.RadioLabel>
            </S.RadioOption>
            <S.RadioOption>
              <S.RadioInput
                type="radio"
                name="isreissue"
                value="reissue"
                checked={formData.isreissue === "reissue"}
                onChange={(e) => handleInputChange("isreissue", e.target.value)}
              />
              <S.RadioLabel>재발급</S.RadioLabel>
            </S.RadioOption>
          </S.RadioGroup>
        </S.FormSection>

        <S.FormField>
          <S.FieldLabel>
            <S.RequiredMark>*</S.RequiredMark>성명
          </S.FieldLabel>
          <S.Input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="성명을 입력하세요"
          />
        </S.FormField>
        <S.FormField>
          <S.FieldLabel>
            <S.RequiredMark>*</S.RequiredMark>성별
          </S.FieldLabel>
          <S.RadioGroup>
            <S.RadioOption onClick={() => handleInputChange("gender", 0)}>
              <S.RadioInput
                type="radio"
                name="gender"
                value={0}
                checked={formData.gender === 0}
                onChange={() => handleInputChange("gender", 0)}
              />
              <S.RadioLabel>남</S.RadioLabel>
            </S.RadioOption>

            <S.RadioOption onClick={() => handleInputChange("gender", 1)}>
              <S.RadioInput
                type="radio"
                name="gender"
                value={1}
                checked={formData.gender === 1}
                onChange={() => handleInputChange("gender", 1)}
              />
              <S.RadioLabel>여</S.RadioLabel>
            </S.RadioOption>
          </S.RadioGroup>
        </S.FormField>

        <S.FormField>
          <S.FieldLabel>
            <S.RequiredMark>*</S.RequiredMark>주민등록번호(외국인등록번호)
          </S.FieldLabel>
          <S.Input
            type="text"
            value={formData.residentNumber}
            onChange={(e) =>
              handleInputChange("residentNumber", e.target.value)
            }
            placeholder="주민등록번호를 입력하세요"
          />
        </S.FormField>

        <S.FormField>
          <S.FieldLabel>
            <S.RequiredMark>*</S.RequiredMark>주소
          </S.FieldLabel>
          <S.Input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder="주소를 입력하세요"
          />
        </S.FormField>

        <S.FormField>
          <S.FieldLabel>
            <S.RequiredMark>*</S.RequiredMark>전화번호
          </S.FieldLabel>
          <S.Input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="전화번호를 입력하세요. 예시) 010-1234-5678"
          />
        </S.FormField>

        <S.FormField>
          <S.FieldLabel>면허종류</S.FieldLabel>
          <S.Input
            type="text"
            value={formData.licenseType}
            onChange={(e) => handleInputChange("licenseType", e.target.value)}
            placeholder="면허종류를 입력하세요"
          />
        </S.FormField>

        <S.FormField>
          <S.FieldLabel>재발급 사유</S.FieldLabel>
          <S.Input
            type="text"
            value={formData.reissueReason}
            onChange={(e) => handleInputChange("reissueReason", e.target.value)}
            placeholder="재발급 사유를 입력하세요"
          />
        </S.FormField>
      </S.FormContent>
    </S.FormContainer>
  );
};

export default ApplicationFormView;
