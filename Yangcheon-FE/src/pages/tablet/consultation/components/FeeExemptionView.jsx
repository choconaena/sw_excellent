// src/views/tablet/Consultation/components/FeeExemptionView.jsx
import { useState } from "react";
import * as S from "../style";
import { useAuthStore } from "../../../../store/authStore";
import { useRoomBus } from "../../../../ws/useRoomBus";
import { extractDataPayload } from "../../../../ws/parseWs";

const FeeExemptionView = () => {
  const [exemptionType, setExemptionType] = useState("");
  const [exemptionReason, setExemptionReason] = useState("");

  const email = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = email ? String(email) : null;

  const { send } = useRoomBus(
    room,
    {
      onMessage: (p) => {
        const patch = extractDataPayload(p);
        if (!patch) return;

        if (typeof patch.exemptionType === "string") {
          setExemptionType(patch.exemptionType);
          if (patch.exemptionType !== "exempt") setExemptionReason("");
        }
        if (typeof patch.exemptionReason === "string") {
          setExemptionReason(patch.exemptionReason);
        }
      },
    },
    { tag: "fee-view" }
  );

  const changeType = (type) => {
    setExemptionType(type);
    send({ msg: { msg_type: "data", content: { exemptionType: type } } });
    if (type !== "exempt") {
      setExemptionReason("");
      send({ msg: { msg_type: "data", content: { exemptionReason: "" } } });
    }
  };

  const changeReason = (val) => {
    setExemptionReason(val);
    send({ msg: { msg_type: "data", content: { exemptionReason: val } } });
  };

  return (
    <S.FormScreen>
      <S.FormHeader>
        <S.FormTitle>수수료 감면</S.FormTitle>
        <S.FormSubtitle>해당 시 감면 사유를 입력해 주세요.</S.FormSubtitle>
      </S.FormHeader>

      <S.FormContent>
        <S.FormField>
          <S.FieldLabel>수수료 감면 대상 여부</S.FieldLabel>
          <S.CheckboxGrid>
            <S.CheckboxOption onClick={() => changeType("exempt")}>
              <S.CheckboxInput
                type="radio"
                name="exemption"
                checked={exemptionType === "exempt"}
                onChange={() => changeType("exempt")}
              />
              <S.CheckboxLabel>감면 대상임</S.CheckboxLabel>
            </S.CheckboxOption>

            <S.CheckboxOption onClick={() => changeType("not-exempt")}>
              <S.CheckboxInput
                type="radio"
                name="exemption"
                checked={exemptionType === "not-exempt"}
                onChange={() => changeType("not-exempt")}
              />
              <S.CheckboxLabel>감면 대상 아님</S.CheckboxLabel>
            </S.CheckboxOption>
          </S.CheckboxGrid>
        </S.FormField>

        {exemptionType === "exempt" && (
          <S.FormField>
            <S.FieldLabel>감면 사유</S.FieldLabel>
            {/* tablet 스타일의 인풋을 textarea로 사용 */}
            <S.TextArea
              as="textarea"
              rows={3}
              value={exemptionReason}
              placeholder="감면 사유를 입력해주세요"
              onChange={(e) => changeReason(e.target.value)}
            />
          </S.FormField>
        )}
        <S.LegalNotice>
          「공공기관의 정보공개에 관한 법률 시행령」 제17조 제3항에 따라 수수료
          감면 대상에 해당하는 경우에만 작성하며, 감면 사유를 입증할 수 있는
          서류를 첨부하시기 바랍니다.
        </S.LegalNotice>
      </S.FormContent>
    </S.FormScreen>
  );
};

export default FeeExemptionView;
