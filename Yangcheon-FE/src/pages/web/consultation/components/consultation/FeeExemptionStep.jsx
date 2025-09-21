// src/components/consultation/FeeExemptionStep.jsx
import { useState, useRef } from "react";
import * as S from "./ConsultationComponentStyles";
import { useAuthStore } from "../../../../../store/authStore";
import { useRoomBus } from "../../../../../ws/useRoomBus";
import { extractDataPayload } from "../../../../../ws/parseWs";
import { submitFeeExemptionWeb } from "../../../../../services/consultationService";

const FeeExemptionStep = ({ onNext, onPrev, feeData, onFeeDataChange }) => {
  const [exemptionType, setExemptionType] = useState(
    feeData?.exemptionType || ""
  );
  const [exemptionReason, setExemptionReason] = useState(
    feeData?.exemptionReason || ""
  );
  const [loading, setLoading] = useState(false);

  // --- room & ws
  const email = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = email ? String(email) : null;

  // 수신: 태블릿에서 보낸 패치 반영
  const { send } = useRoomBus(
    room,
    {
      onMessage: (p) => {
        const patch = extractDataPayload(p);
        if (!patch) return;

        if (typeof patch.exemptionType === "string") {
          setExemptionType(patch.exemptionType);
          onFeeDataChange?.("exemptionType", patch.exemptionType);
          if (patch.exemptionType !== "exempt") {
            setExemptionReason("");
            onFeeDataChange?.("exemptionReason", "");
          }
        }
        if (typeof patch.exemptionReason === "string") {
          setExemptionReason(patch.exemptionReason);
          onFeeDataChange?.("exemptionReason", patch.exemptionReason);
        }
      },
    },
    { tag: "web-fee" }
  );

  // 송신: 입력 변경 시 디바운스 패치
  const patchRef = useRef({});
  const timerRef = useRef(null);
  const pushPatch = (partial) => {
    Object.assign(patchRef.current, partial);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      send({ msg: { msg_type: "data", content: { ...patchRef.current } } });
      patchRef.current = {};
      timerRef.current = null;
    }, 150);
  };

  const handleExemptionTypeChange = (type) => {
    setExemptionType(type);
    onFeeDataChange?.("exemptionType", type);
    pushPatch({ exemptionType: type });

    if (type !== "exempt") {
      setExemptionReason("");
      onFeeDataChange?.("exemptionReason", "");
      pushPatch({ exemptionReason: "" });
    }
  };

  const handleReasonChange = (reason) => {
    setExemptionReason(reason);
    onFeeDataChange?.("exemptionReason", reason);
    pushPatch({ exemptionReason: reason });
  };

  const handleSubmit = async () => {
    if (exemptionType === "exempt" && !exemptionReason.trim()) {
      alert("감면 대상이면 감면 사유를 입력해 주세요.");
      return;
    }
    try {
      setLoading(true);
      const res = await submitFeeExemptionWeb({
        exemptionType,
        exemptionReason,
      });
      if (res?.status) {
        alert(res.msg || "수수료 감면 정보가 전송되었습니다.");
        onNext?.();
      } else {
        alert(res?.msg || "전송에 실패했습니다.");
      }
    } catch (e) {
      alert(e.message || "전송 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <S.RightPanel>
      <S.StepHeader>
        <S.StepNavigation>
          <S.BackButton onClick={onPrev}>← 이전</S.BackButton>
          <S.StepTitle>정보공개청구_5. 수수료 감면</S.StepTitle>
        </S.StepNavigation>
      </S.StepHeader>

      <S.FeeSection>
        <S.FormField>
          <S.FieldLabel>수수료 감면 대상 여부</S.FieldLabel>
          <S.RadioGroup>
            <S.RadioOption>
              <S.RadioInput
                type="radio"
                name="exemption"
                value="exempt"
                checked={exemptionType === "exempt"}
                onChange={() => handleExemptionTypeChange("exempt")}
              />
              <S.RadioLabel>감면 대상임</S.RadioLabel>
            </S.RadioOption>
            <S.RadioOption>
              <S.RadioInput
                type="radio"
                name="exemption"
                value="not-exempt"
                checked={exemptionType === "not-exempt"}
                onChange={() => handleExemptionTypeChange("not-exempt")}
              />
              <S.RadioLabel>감면 대상 아님</S.RadioLabel>
            </S.RadioOption>
          </S.RadioGroup>
        </S.FormField>

        {exemptionType === "exempt" && (
          <S.FormField>
            <S.FieldLabel>감면 사유</S.FieldLabel>
            <S.TextArea
              value={exemptionReason}
              onChange={(e) => handleReasonChange(e.target.value)}
              placeholder="감면 사유를 입력해주세요"
              rows={4}
            />
          </S.FormField>
        )}

        <S.LegalNotice>
          「공공기관의 정보공개에 관한 법률 시행령」 제17조 제3항에 따라 수수료
          감면 대상에 해당하는 경우에만 작성하며, 감면 사유를 입증할 수 있는
          서류를 첨부하시기 바랍니다.
        </S.LegalNotice>

        <S.ButtonGroup>
          <S.PrevButton onClick={onPrev} disabled={loading}>
            이전
          </S.PrevButton>
          <S.NextButton
            onClick={handleSubmit}
            disabled={loading || !exemptionType}
          >
            {loading ? "전송 중..." : "다음"}
          </S.NextButton>
        </S.ButtonGroup>
      </S.FeeSection>
    </S.RightPanel>
  );
};

export default FeeExemptionStep;
