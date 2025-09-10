// src/views/tablet/Consultation/components/MethodSelectionView.jsx
import { useState } from "react";
import * as S from "../style";
import { useAuthStore } from "../../../../store/authStore";
import { useRoomBus } from "../../../../ws/useRoomBus";
//import { submitAppReceiveMethodChecklist } from "../../../../services/consultationService";
import { extractDataPayload } from "../../../../ws/parseWs";

const MethodSelectionView = () => {
  const [disclosureMethods, setDisclosureMethods] = useState([]);
  const [receiveMethods, setReceiveMethods] = useState([]);
  //const [loading, setLoading] = useState(false);

  const [disclosureOtherText, setDisclosureOtherText] = useState("");
  const [receiveEmailText, setReceiveEmailText] = useState("");

  const userEmail = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = userEmail ? String(userEmail) : null;

  const { send } = useRoomBus(
    room,
    {
      onMessage: (p) => {
        const patch = extractDataPayload(p);
        if (!patch) return;

        if (Array.isArray(patch.disclosureMethods)) {
          setDisclosureMethods(patch.disclosureMethods);
        }
        if (Array.isArray(patch.receiveMethods)) {
          setReceiveMethods(patch.receiveMethods);
        }
        if (typeof patch.disclosureOtherText === "string") {
          setDisclosureOtherText(patch.disclosureOtherText);
        }
        if (typeof patch.receiveEmailText === "string") {
          setReceiveEmailText(patch.receiveEmailText);
        }
      },
    },
    { tag: "method-view" }
  );

  const toggle = (list, setter, id, field) => {
    const next = list.includes(id)
      ? list.filter((x) => x !== id)
      : [...list, id];
    setter(next);
    send({ msg: { msg_type: "data", content: { [field]: next } } });

    if (id === "other" && !next.includes("other")) {
      setDisclosureOtherText("");
      send({ msg: { msg_type: "data", content: { disclosureOtherText: "" } } });
    }
    if (id === "email" && !next.includes("email")) {
      setReceiveEmailText("");
      send({ msg: { msg_type: "data", content: { receiveEmailText: "" } } });
    }
  };

  const handleDisclosureChange = (id) =>
    toggle(disclosureMethods, setDisclosureMethods, id, "disclosureMethods");
  const handleReceiveChange = (id) =>
    toggle(receiveMethods, setReceiveMethods, id, "receiveMethods");

  // const handleSubmit = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await submitAppReceiveMethodChecklist({
  //       disclosureMethods,
  //       receiveMethods,
  //     });
  //     console.log("체크리스트 전송 완료:", res);
  //     alert("공개/수령 방법이 전송되었습니다.");
  //     onSubmit?.({ disclosureMethods, receiveMethods });
  //   } catch (err) {
  //     console.error("체크리스트 전송 실패:", err);
  //     alert(err.message || "전송 중 오류가 발생했습니다.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <S.FormScreen>
      <S.FormHeader>
        <S.FormTitle>공개 및 수령 방법</S.FormTitle>
        <S.FormSubtitle>
          정보공개청구 업무 처리를 위한 정보 입력란입니다.
        </S.FormSubtitle>
      </S.FormHeader>

      <S.FormContent>
        <S.FormField>
          <S.FieldLabel>공개 방법</S.FieldLabel>
          <S.CheckboxGrid>
            {/* 일반 항목들 */}
            {["view", "copy", "electronic", "copy-print"].map((id) => (
              <S.CheckboxOption
                key={id}
                $checked={disclosureMethods.includes(id)}
                onClick={() => handleDisclosureChange(id)}
              >
                <S.CheckboxInput
                  type="checkbox"
                  checked={disclosureMethods.includes(id)}
                  onChange={() => handleDisclosureChange(id)}
                />
                <S.CheckboxLabel>
                  {id === "view"
                    ? "열람·시청"
                    : id === "copy"
                    ? "사본·출력물"
                    : id === "electronic"
                    ? "전자파일"
                    : "복제·인화물"}
                </S.CheckboxLabel>
              </S.CheckboxOption>
            ))}

            {/* 기타 + 입력칸 */}
            <S.CheckboxOption
              $checked={disclosureMethods.includes("other")}
              onClick={() => handleDisclosureChange("other")}
            >
              <S.CheckboxInput
                type="checkbox"
                checked={disclosureMethods.includes("other")}
                onChange={() => handleDisclosureChange("other")}
              />
              <S.CheckboxLabel>기타</S.CheckboxLabel>
              {disclosureMethods.includes("other") && (
                <S.InlineTextInput
                  type="text"
                  value={disclosureOtherText}
                  placeholder="기타 내용을 입력하세요"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDisclosureOtherText(v);
                    send({
                      msg: {
                        msg_type: "data",
                        content: { disclosureOtherText: v },
                      },
                    });
                  }}
                />
              )}
            </S.CheckboxOption>
          </S.CheckboxGrid>
        </S.FormField>

        {/* 수령 방법 */}
        <S.FormField>
          <S.FieldLabel>수령 방법</S.FieldLabel>
          <S.CheckboxGrid>
            {["direct", "mail", "fax", "notification"].map((id) => (
              <S.CheckboxOption
                key={id}
                $checked={receiveMethods.includes(id)}
                onClick={() => handleReceiveChange(id)}
              >
                <S.CheckboxInput
                  type="checkbox"
                  checked={receiveMethods.includes(id)}
                  onChange={() => handleReceiveChange(id)}
                />
                <S.CheckboxLabel>
                  {id === "direct"
                    ? "직접 방문"
                    : id === "mail"
                    ? "우편"
                    : id === "fax"
                    ? "팩스 전송"
                    : "정보통신망"}
                </S.CheckboxLabel>
              </S.CheckboxOption>
            ))}

            {/* 전자우편 등 + 입력칸 */}
            <S.CheckboxOption
              $checked={receiveMethods.includes("email")}
              onClick={() => handleReceiveChange("email")}
            >
              <S.CheckboxInput
                type="checkbox"
                checked={receiveMethods.includes("email")}
                onChange={() => handleReceiveChange("email")}
              />
              <S.CheckboxLabel>전자우편 등</S.CheckboxLabel>
              {receiveMethods.includes("email") && (
                <S.InlineTextInput
                  type="text"
                  value={receiveEmailText}
                  placeholder="예: your@email.com"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const v = e.target.value;
                    setReceiveEmailText(v);
                    send({
                      msg: {
                        msg_type: "data",
                        content: { receiveEmailText: v },
                      },
                    });
                  }}
                />
              )}
            </S.CheckboxOption>
          </S.CheckboxGrid>
        </S.FormField>

        {/* <S.FormButton onClick={handleSubmit} disabled={loading}>
          {loading ? "전송 중..." : "완료"}
        </S.FormButton> */}
      </S.FormContent>
    </S.FormScreen>
  );
};

export default MethodSelectionView;
