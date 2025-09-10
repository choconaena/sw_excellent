// EnhancedSummaryStep.jsx
import { useEffect, useRef, useCallback, useState } from "react";
import * as S from "./ConsultationComponentStyles";
import Toggle from "./TogglePanel";
import { getSttAbstract } from "../../api/stt";
import { useReportStore } from "../../store/useReportStore";
import { useAuthStore } from "../../store/authStore";
import { useRoomBus } from "../../ws/useRoomBus";
// ✅ 추가
import { submitSummaryEditWeb } from "../../services/consultationService";

const EnhancedSummaryStep = ({
  onNext,
  onPrev,
  summaryData,
  onSummaryDataChange,
  isTabletPublic,
  onToggleChange,
}) => {
  const reportId = useReportStore((s) => s.reportId);

  // ✅ room 준비
  const email = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = email ? String(email) : null;
  const { send } = useRoomBus(room, {}, { tag: "summary-web" });

  const [summaryContent, setSummaryContent] = useState(
    summaryData?.content || ""
  );
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true); // 조회 로딩
  const [submitting, setSubmitting] = useState(false); // ✅ 전송 로딩
  const [pendingMsg, setPendingMsg] = useState("");
  const [error, setError] = useState("");

  // ✅ 원본 필드 상태(서버에서 받은 subject/abstract/detail 보관)
  const [fields, setFields] = useState({
    subject: "",
    abstract: "",
    detail: "",
  });

  const onChangeRef = useRef(onSummaryDataChange);
  useEffect(() => {
    onChangeRef.current = onSummaryDataChange;
  }, [onSummaryDataChange]);

  const lastPushedRef = useRef("");

  // ✅ combined -> subject/abstract/detail 파서
  const parseCombined = useCallback(
    (combined) => {
      let subject = fields.subject || "";
      let body = (combined || "").trim();

      // 첫 줄이 "제목: ..." 이면 subject로 인식
      const lines = body.split("\n");
      if (lines[0]?.trim().startsWith("제목:")) {
        subject = lines[0].replace(/^제목:\s*/, "").trim();
        body = lines.slice(1).join("\n").trim();
      }

      // 빈 줄(두 줄 이상)을 경계로 abstract / detail 분리
      const parts = body.split(/\n{2,}/);
      const abstract = (parts[0] || "").trim();
      const detail = (parts.slice(1).join("\n\n") || "").trim();

      return { subject, abstract, detail };
    },
    [fields.subject]
  );

  const fetchSummary = useCallback(
    async (retryCount = 0) => {
      if (!reportId) {
        setLoading(false);
        setPendingMsg("");
        setError("요약을 조회할 reportId가 없습니다. (STT 세션을 먼저 시작해 주세요)");
        return;
      }

      setLoading(true);
      setError("");
      setPendingMsg("");

      try {
        const res = await getSttAbstract(reportId);

        if (res?.status && Array.isArray(res.items) && res.items.length > 0) {
          const { subject, abstract, detail } = res.items[0];

          // ✅ 로컬 필드/combined 동기화
          setFields({
            subject: subject ?? "",
            abstract: abstract ?? "",
            detail: detail ?? "",
          });
          const combined = [subject ? `제목: ${subject}` : null, abstract, detail]
            .filter(Boolean)
            .join("\n\n");
          setSummaryContent(combined);

          if (lastPushedRef.current !== combined) {
            lastPushedRef.current = combined;
            onChangeRef.current?.("content", combined);
          }

          // ✅ 요약을 WS로 전파
          send({
            msg: {
              msg_type: "data",
              content: {
                summary: {
                  subject: subject ?? "",
                  abstract: abstract ?? "",
                  detail: detail ?? "",
                  combined,
                },
              },
            },
          });
        } else {
          const msg = res?.msg || "요약 항목이 없습니다.";
          setPendingMsg(msg);
          send({ msg: { msg_type: "data", content: { summary: { pending: msg } } } });

          // ✅ 진행 중이면 카운터 확인 후 재시도
          if (msg === "요약이 진행중입니다." && retryCount < 10) {
            setTimeout(() => fetchSummary(retryCount + 1), 1000);
          }
        }
      } catch (e) {
        const em = e?.message || "요약 조회 실패";
        setError(em);
        send({ msg: { msg_type: "data", content: { summary: { error: em } } } });
      } finally {
        setLoading(false);
      }
    },
    [reportId, send, onChangeRef]
  );

  // reportId당 1회
  const fetchedForRef = useRef(null);
  useEffect(() => {
    if (!reportId || fetchedForRef.current === reportId) return;
    fetchedForRef.current = reportId;
    fetchSummary();
  }, [reportId, fetchSummary]);

  // ✅ 편집 시 상태/WS 반영
  const handleSummaryChange = (content) => {
    setSummaryContent(content);
    onChangeRef.current?.("content", content);
    send({
      msg: { msg_type: "data", content: { summary: { combined: content } } },
    });
  };

  const handleSummaryEdit = () => setIsEditing(true);

  // ✅ "다음"에서 서버에 수정본 전송
  const handleSubmitAndNext = async () => {
    try {
      setSubmitting(true);

      // 현재 combined를 기준으로 subject/abstract/detail 구성
      const { subject, abstract, detail } = parseCombined(summaryContent);

      // 서버 전송
      const resp = await submitSummaryEditWeb({
        items: [{ subject, abstract, detail }],
      });

      alert(resp.message || "요약결과가 수정되었습니다.");
      onNext?.();
    } catch (e) {
      alert(e?.message || "요약결과 수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <S.RightPanel>
      <S.StepHeader>
        <S.StepNavigation>
          <S.BackButton onClick={onPrev}>← 이전</S.BackButton>
          <S.StepTitle>정보공개청구_4. 요약 생성 및 수정</S.StepTitle>
        </S.StepNavigation>
      </S.StepHeader>

      <S.SummarySection>
        <S.SummaryHeader>
          <S.SummaryHeaderText>
            <S.SummaryTitle>요약 결과</S.SummaryTitle>
            <S.SummarySubtitle>
              요약 결과를 수정 할 수 있습니다.
            </S.SummarySubtitle>
          </S.SummaryHeaderText>
          <Toggle
            label="요약 결과 공개 여부"
            isOn={isTabletPublic}
            onToggle={onToggleChange}
          />
        </S.SummaryHeader>

        <S.SummaryBox>
          {loading ? (
            <S.SummaryMessage>
              불러오는 중입니다.
              <br />
              잠시만 기다려주세요.
            </S.SummaryMessage>
          ) : pendingMsg ? (
            <S.SummaryMessage>{pendingMsg}</S.SummaryMessage>
          ) : error ? (
            <S.SummaryMessage style={{ color: "#d33" }}>
              {error}
            </S.SummaryMessage>
          ) : isEditing ? (
            <S.SummaryTextArea
              value={summaryContent}
              onChange={(e) => handleSummaryChange(e.target.value)}
              rows={10}
            />
          ) : summaryContent ? (
            <S.SummaryContent>
              {summaryContent.split("\n").map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </S.SummaryContent>
          ) : (
            <S.SummaryMessage>요약 결과가 없습니다.</S.SummaryMessage>
          )}
        </S.SummaryBox>

        <S.SummaryButtonGroup>
          {loading || pendingMsg || error ? (
            <S.SummaryButton onClick={fetchSummary}>
              다시 불러오기
            </S.SummaryButton>
          ) : isEditing ? (
            <S.SummaryButton onClick={() => setIsEditing(false)}>
              수정 완료
            </S.SummaryButton>
          ) : summaryContent ? (
            <S.SummaryButton onClick={handleSummaryEdit}>
              수정하기
            </S.SummaryButton>
          ) : null}
        </S.SummaryButtonGroup>

        <S.ButtonGroup>
          <S.PrevButton onClick={onPrev} disabled={submitting}>
            이전
          </S.PrevButton>
          <S.NextButton
            onClick={handleSubmitAndNext} // ✅ 여기!
            disabled={loading || submitting} // ✅ 전송 중 비활성화
            style={
              loading || submitting
                ? { opacity: 0.5, cursor: "not-allowed" }
                : {}
            }
          >
            {submitting ? "전송 중..." : "다음"}
          </S.NextButton>
        </S.ButtonGroup>
      </S.SummarySection>
    </S.RightPanel>
  );
};

export default EnhancedSummaryStep;
