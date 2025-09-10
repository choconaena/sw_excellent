import { useEffect, useState } from "react";
import * as S from "../style";
import { useAuthStore } from "../../../../store/authStore";
import { useRoomBus } from "../../../../ws/useRoomBus";
import { extractDataPayload } from "../../../../ws/parseWs";

const SummaryView = () => {
  const [loading, setLoading] = useState(true);
  const [pendingMsg, setPendingMsg] = useState("요약 전송 대기중...");
  const [error, setError] = useState("");
  const [item, setItem] = useState(null); // { subject, abstract, detail, combined }

  const email = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = email ? String(email) : null;

  useRoomBus(
    room,
    {
      onMessage: (p) => {
        const data = extractDataPayload(p); // ✅ msg_type === "data" 만 파싱
        if (!data) return;

        const s = data.summary; // ✅ summary만 관심
        if (!s) return;

        if (s.error) {
          setError(s.error);
          setPendingMsg("");
          setLoading(false);
          return;
        }
        if (s.pending) {
          setPendingMsg(s.pending);
          setError("");
          setLoading(false);
          return;
        }

        const subject = s.subject ?? "";
        const abstract = s.abstract ?? "";
        const detail = s.detail ?? "";
        const combined =
          s.combined ?? [abstract, detail].filter(Boolean).join("\n\n");

        setItem({ subject, abstract, detail, combined });
        setPendingMsg("");
        setError("");
        setLoading(false);
      },
    },
    { tag: "summary-tablet-recv", parse: extractDataPayload }
  );

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(id);
  }, []);

  const title = item?.subject || "요약 결과";
  const body = item?.combined || "";

  return (
    <S.SummaryScreen>
      <S.FormHeader>
        <S.FormTitle>요약 결과</S.FormTitle>
        <S.FormSubtitle>
          방문 상담 내용을 요약한 결과입니다. 내용을 확인해 주세요.
        </S.FormSubtitle>
      </S.FormHeader>

      <S.SummaryContent>
        {loading ? (
          <S.SummaryText>불러오는 중...</S.SummaryText>
        ) : pendingMsg ? (
          <S.SummaryText>{pendingMsg}</S.SummaryText>
        ) : error ? (
          <S.SummaryText style={{ color: "#d33" }}>{error}</S.SummaryText>
        ) : item ? (
          <>
            <S.SummaryTitle>{title}</S.SummaryTitle>
            <S.SummaryText>{body}</S.SummaryText>
          </>
        ) : (
          <S.SummaryText>요약 결과가 없습니다.</S.SummaryText>
        )}
      </S.SummaryContent>
    </S.SummaryScreen>
  );
};

export default SummaryView;
