import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useReportStore } from "../store/useReportStore";
import { useRoomBus } from "../ws/useRoomBus";

export function useReportMetaSync(tag = "report-sync") {
  const setReportMeta = useReportStore((s) => s.setReportMeta);
  const setReportId = useReportStore((s) => s.setReportId);

  // room
  const email = useAuthStore(
    (s) => s.user?.email ?? s.user?.user_email ?? s.user?.mail ?? null
  );
  const room = email ? String(email) : null;

  // ① WS 수신: web -> tablet 브로드캐스트(report_meta) 수신해서 저장
  useRoomBus(
    room,
    {
      onMessage: (p) => {
        let m = p?.msg;
        if (typeof m === "string") {
          try {
            m = JSON.parse(m);
          } catch {
            m = { msg_type: "text", content: { text: m } };
          }
        }
        if (!m && (p?.msg_type || p?.content)) {
          m = { msg_type: p.msg_type, content: p.content };
        }
        if (!m || typeof m !== "object") return;

        if (m.msg_type === "report_meta" && m.content) {
          const { reportId, status, msg } = m.content;
          setReportMeta({ reportId, status, msg });
          console.log("[tablet] report_meta <-", m.content);
        }
      },
    },
    { tag }
  );

  // ② URL 파라미터 백업: /tablet/...?rid=123 들어오면 저장 (WS가 늦거나 놓친 경우용)
  const location = useLocation();
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const ridRaw = sp.get("rid");
    if (!ridRaw) return;
    const rid = Number(ridRaw);
    if (Number.isFinite(rid) && rid > 0) {
      setReportId(rid);
      console.log("[tablet] rid from URL ->", rid);
    }
  }, [location.search, setReportId]);
}
