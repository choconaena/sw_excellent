import { useRef, useState } from "react";
import * as S from "../style";
//import { submitApplicantData } from "../../../../services/consultationService";
import { useAuthStore } from "../../../../store/authStore";
import { useRoomBus } from "../../../../ws/useRoomBus";
import { extractDataPayload } from "../../../../ws/parseWs";

const ApplicantFormView = () => {
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    fax: "",
    businessNumber: "",
  });
  //const [loading, setLoading] = useState(false);

  const userEmail = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = userEmail ? String(userEmail) : null;

  // ✅ 태블릿 → 웹 송신(기존)
  const { send } = useRoomBus(room, {}, { tag: "applicant-app-send" });

  // ✅ 웹 → 태블릿 수신
  useRoomBus(
    room,
    {
      onMessage: (p) => {
        const patch = extractDataPayload(p);
        if (!patch || typeof patch !== "object") return;
        setFormData((prev) => {
          const next = { ...prev };
          if ("phone" in patch) next.phone = patch.phone ?? "";
          if ("email" in patch) next.email = patch.email ?? "";
          if ("fax" in patch) next.fax = patch.fax ?? "";
          if ("businessNumber" in patch)
            next.businessNumber = patch.businessNumber ?? "";
          return next;
        });
      },
    },
    { tag: "applicant-app-recv" }
  );

  // ✅ 디바운스 송신(기존)
  const patchRef = useRef({});
  const timerRef = useRef(null);
  const pushPatch = (field, value) => {
    patchRef.current[field] = value;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const payload = { ...patchRef.current };
      patchRef.current = {};
      timerRef.current = null;
      send({ msg: { msg_type: "data", content: payload } });
    }, 200);
  };

  const handleInputChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
    pushPatch(field, value); // ← 즉시 송신
  };

  // const handleSubmit = async () => {
  //   if (!formData.phone || !formData.email) {
  //     alert("전화번호와 이메일은 필수입니다.");
  //     return;
  //   }
  //   try {
  //     setLoading(true);
  //     const res = await submitApplicantData(formData);
  //     console.log(res);
  //     alert("청구인 정보가 전송되었습니다.");
  //     onSubmit?.(formData);
  //   } catch (err) {
  //     alert(err.message || "전송 중 오류가 발생했습니다.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <S.FormScreen>
      <S.FormHeader>
        <S.FormTitle>청구인 정보 입력</S.FormTitle>
        <S.FormSubtitle>
          정보공개청구 업무 처리를 위한 정보 입력란입니다.
        </S.FormSubtitle>
      </S.FormHeader>
      <S.FormContent>
        <S.FormField>
          <S.FieldLabel>
            <S.Required>*</S.Required>전화번호
            <span style={{ fontSize: "1rem", fontWeight: "normal" }}>
              (또는 휴대전화번호)
            </span>
          </S.FieldLabel>
          <S.FormInput
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="전화번호를 입력하세요. 예시) 010-1234-5678"
          />
        </S.FormField>

        <S.FormField>
          <S.FieldLabel>
            <S.Required>*</S.Required>전자우편주소
          </S.FieldLabel>
          <S.FormInput
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="이메일 주소를 입력하세요"
          />
        </S.FormField>

        <S.FormField>
          <S.FieldLabel>팩스번호</S.FieldLabel>
          <S.FormInput
            type="tel"
            value={formData.fax}
            onChange={(e) => handleInputChange("fax", e.target.value)}
            placeholder="팩스번호를 입력하세요"
          />
        </S.FormField>

        <S.FormField>
          <S.FieldLabel>
            사업자<span style={{ fontSize: "1rem" }}>(법인·단체)</span> 등록번호
          </S.FieldLabel>
          <S.FormInput
            type="text"
            value={formData.businessNumber}
            onChange={(e) =>
              handleInputChange("businessNumber", e.target.value)
            }
            placeholder="사업자등록번호를 입력하세요"
          />
        </S.FormField>

        {/* <S.FormButton onClick={handleSubmit} disabled={loading}>
          {loading ? "전송 중..." : "완료"}
        </S.FormButton> */}
      </S.FormContent>
    </S.FormScreen>
  );
};

export default ApplicantFormView;
