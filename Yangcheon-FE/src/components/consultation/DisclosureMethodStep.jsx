// src/components/consultation/DisclosureMethodStep.jsx
import { useEffect, useRef, useState } from "react";
import * as S from "./ConsultationComponentStyles";
import { submitWebReceiveMethodChecklist } from "../../services/consultationService";
import { useAuthStore } from "../../store/authStore";
import { useRoomBus } from "../../ws/useRoomBus";
import { extractDataPayload } from "../../ws/parseWs";

const DisclosureMethodStep = ({
  onNext,
  onPrev,
  methodData,
  onMethodDataChange,
}) => {
  const [disclosureMethods, setDisclosureMethods] = useState(
    methodData?.disclosureMethods || []
  );
  const [receiveMethods, setReceiveMethods] = useState(
    methodData?.receiveMethods || []
  );
  const [loading, setLoading] = useState(false);

  const [disclosureOtherText, setDisclosureOtherText] = useState(
    methodData?.disclosureOtherText ?? ""
  );
  const [receiveEmailText, setReceiveEmailText] = useState(
    methodData?.receiveEmailText ?? ""
  );

  useEffect(() => {
    setDisclosureMethods(methodData?.disclosureMethods || []);
  }, [methodData?.disclosureMethods]);

  useEffect(() => {
    setReceiveMethods(methodData?.receiveMethods || []);
  }, [methodData?.receiveMethods]);

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

        if (Array.isArray(patch.disclosureMethods)) {
          setDisclosureMethods(patch.disclosureMethods);
          onMethodDataChange?.("disclosureMethods", patch.disclosureMethods);
        }
        if (Array.isArray(patch.receiveMethods)) {
          setReceiveMethods(patch.receiveMethods);
          onMethodDataChange?.("receiveMethods", patch.receiveMethods);
        }
        if (typeof patch.disclosureOtherText === "string") {
          setDisclosureOtherText(patch.disclosureOtherText);
          onMethodDataChange?.(
            "disclosureOtherText",
            patch.disclosureOtherText
          );
        }
        if (typeof patch.receiveEmailText === "string") {
          setReceiveEmailText(patch.receiveEmailText);
          onMethodDataChange?.("receiveEmailText", patch.receiveEmailText);
        }
      },
    },
    { tag: "web-method" }
  );

  const patchRef = useRef({});
  const timerRef = useRef(null);
  const pushPatch = (patch) => {
    Object.assign(patchRef.current, patch);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const payload = { ...patchRef.current };
      patchRef.current = {};
      timerRef.current = null;
      send({ msg: { msg_type: "data", content: payload } });
    }, 200);
  };

  const handleDisclosureMethodChange = (method) => {
    const updated = disclosureMethods.includes(method)
      ? disclosureMethods.filter((m) => m !== method)
      : [...disclosureMethods, method];
    setDisclosureMethods(updated);
    onMethodDataChange?.("disclosureMethods", updated);
    pushPatch({ disclosureMethods: updated });

    if (!updated.includes("other")) {
      setDisclosureOtherText("");
      onMethodDataChange?.("disclosureOtherText", "");
      pushPatch({ disclosureOtherText: "" });
    }
  };

  const handleReceiveMethodChange = (method) => {
    const updated = receiveMethods.includes(method)
      ? receiveMethods.filter((m) => m !== method)
      : [...receiveMethods, method];
    setReceiveMethods(updated);
    onMethodDataChange?.("receiveMethods", updated);
    pushPatch({ receiveMethods: updated });

    if (!updated.includes("email")) {
      setReceiveEmailText("");
      onMethodDataChange?.("receiveEmailText", "");
      pushPatch({ receiveEmailText: "" });
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await submitWebReceiveMethodChecklist({
        disclosureMethods,
        receiveMethods,
        disclosureOtherText, // 추가
        receiveEmailText, // 추가
      });
      // ✅ 태블릿에게 "수수료감면" 화면으로 가라고 지시
      const dst = "/tablet/consultation?view=form&step=fee";
      send({
        msg: {
          msg_type: "page_move",
          content: { dst },
        },
      });
      console.log("[web] page_move ->", dst);
      console.log("✅ 웹 체크리스트 전송 완료:", res);
      alert("공개 및 수령방법 정보가 전송되었습니다.");
      if (res?.msg) alert(res.msg);
      onNext?.();
    } catch (err) {
      console.error("❌ 웹 체크리스트 전송 실패:", err);
      alert(err?.message || "전송 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <S.RightPanel>
      <S.StepHeader>
        <S.StepNavigation>
          <S.BackButton onClick={onPrev}>← 이전</S.BackButton>
          <S.StepTitle>정보공개청구_4. 공개 및 수령 방법</S.StepTitle>
        </S.StepNavigation>
      </S.StepHeader>

      <S.MethodSection>
        <S.MethodGroup>
          <S.MethodGroupTitle>공개 방법</S.MethodGroupTitle>
          <S.CheckboxGrid>
            <S.CheckboxOption>
              <S.CheckboxInput
                type="checkbox"
                checked={disclosureMethods.includes("view")}
                onChange={() => handleDisclosureMethodChange("view")}
              />
              <S.CheckboxLabel>열람·시청</S.CheckboxLabel>
            </S.CheckboxOption>
            <S.CheckboxOption>
              <S.CheckboxInput
                type="checkbox"
                checked={disclosureMethods.includes("copy")}
                onChange={() => handleDisclosureMethodChange("copy")}
              />
              <S.CheckboxLabel>사본·출력물</S.CheckboxLabel>
            </S.CheckboxOption>
            <S.CheckboxOption>
              <S.CheckboxInput
                type="checkbox"
                checked={disclosureMethods.includes("electronic")}
                onChange={() => handleDisclosureMethodChange("electronic")}
              />
              <S.CheckboxLabel>전자파일</S.CheckboxLabel>
            </S.CheckboxOption>
            <S.CheckboxOption>
              <S.CheckboxInput
                type="checkbox"
                checked={disclosureMethods.includes("copy-print")}
                onChange={() => handleDisclosureMethodChange("copy-print")}
              />
              <S.CheckboxLabel>복제·인화물</S.CheckboxLabel>
            </S.CheckboxOption>
            <S.CheckboxOption>
              <S.CheckboxInput
                type="checkbox"
                checked={disclosureMethods.includes("other")}
                onChange={() => handleDisclosureMethodChange("other")}
              />
              <S.OptionBody>
                <S.CheckboxLabel>기타</S.CheckboxLabel>
                {disclosureMethods.includes("other") && (
                  <S.InlineTextInput
                    type="text"
                    value={disclosureOtherText}
                    placeholder="기타 내용을 입력하세요"
                    onChange={(e) => {
                      setDisclosureOtherText(e.target.value);
                      onMethodDataChange?.(
                        "disclosureOtherText",
                        e.target.value
                      );
                      pushPatch({ disclosureOtherText: e.target.value });
                    }}
                  />
                )}
              </S.OptionBody>
            </S.CheckboxOption>
          </S.CheckboxGrid>
        </S.MethodGroup>

        <S.MethodGroup>
          <S.MethodGroupTitle>수령 방법</S.MethodGroupTitle>
          <S.CheckboxGrid>
            <S.CheckboxOption>
              <S.CheckboxInput
                type="checkbox"
                checked={receiveMethods.includes("direct")}
                onChange={() => handleReceiveMethodChange("direct")}
              />
              <S.CheckboxLabel>직접 방문</S.CheckboxLabel>
            </S.CheckboxOption>
            <S.CheckboxOption>
              <S.CheckboxInput
                type="checkbox"
                checked={receiveMethods.includes("mail")}
                onChange={() => handleReceiveMethodChange("mail")}
              />
              <S.CheckboxLabel>우편</S.CheckboxLabel>
            </S.CheckboxOption>
            <S.CheckboxOption>
              <S.CheckboxInput
                type="checkbox"
                checked={receiveMethods.includes("fax")}
                onChange={() => handleReceiveMethodChange("fax")}
              />
              <S.CheckboxLabel>팩스 전송</S.CheckboxLabel>
            </S.CheckboxOption>
            <S.CheckboxOption>
              <S.CheckboxInput
                type="checkbox"
                checked={receiveMethods.includes("notification")}
                onChange={() => handleReceiveMethodChange("notification")}
              />
              <S.CheckboxLabel>정보통신망</S.CheckboxLabel>
            </S.CheckboxOption>
            <S.CheckboxOption>
              <S.CheckboxInput
                type="checkbox"
                checked={receiveMethods.includes("email")}
                onChange={() => handleReceiveMethodChange("email")}
              />
              <S.OptionBody>
                <S.CheckboxLabel>전자우편 등</S.CheckboxLabel>
                {receiveMethods.includes("email") && (
                  <S.InlineTextInput
                    type="text"
                    value={receiveEmailText}
                    placeholder="예: your@email.com"
                    onChange={(e) => {
                      setReceiveEmailText(e.target.value);
                      onMethodDataChange?.("receiveEmailText", e.target.value);
                      pushPatch({ receiveEmailText: e.target.value });
                    }}
                  />
                )}
              </S.OptionBody>
            </S.CheckboxOption>
          </S.CheckboxGrid>
        </S.MethodGroup>

        <S.ButtonGroup>
          <S.PrevButton onClick={onPrev} disabled={loading}>
            이전
          </S.PrevButton>
          <S.NextButton onClick={handleSubmit} disabled={loading}>
            {loading ? "전송 중..." : "다음"}
          </S.NextButton>
        </S.ButtonGroup>
      </S.MethodSection>
    </S.RightPanel>
  );
};

export default DisclosureMethodStep;
