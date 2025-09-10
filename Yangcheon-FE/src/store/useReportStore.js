// src/store/useReportStore.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useReportStore = create(
  persist(
    (set) => ({
      // --- state ---
      reportId: null, // number|null
      status: null, // boolean|null (서버 status)
      msg: null, // string|null   (서버 메시지)

      // --- actions ---
      setReportMeta: ({ reportId, status, msg }) =>
        set({ reportId: reportId ?? null, status: !!status, msg: msg ?? null }),

      setReportId: (reportId) => set({ reportId }),
      setStatusMsg: ({ status, msg }) => set({ status, msg }),
      clearReport: () => set({ reportId: null, status: null, msg: null }),
    }),
    {
      name: "report_meta_v1",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        reportId: s.reportId,
        status: s.status,
        msg: s.msg,
      }),
    }
  )
);
