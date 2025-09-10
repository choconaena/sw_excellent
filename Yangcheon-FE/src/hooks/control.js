// STT 세션을 전역에서 끊고 싶을 때 이벤트만 쏘면 되게
export const requestSttStop = () => {
  try {
    window.dispatchEvent(new CustomEvent("stt:stop"));
  } catch (e) {
    void e;
  }
};
