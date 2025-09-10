import axios from "axios";

export async function initiateSTTupload(email) {
  // 📅 timestamp 생성
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:]/g, "")
    .replace("T", "_")
    .slice(0, 15); // YYYYMMDD_HHmmss

  // 📄 파일 이름 구성

  //const stt_file_name = sttFileName; // we need to?
  const stt_file_name = `정보공개청구-${timestamp}.wav`;
  console.log("initiateSTTupload start!!!!!!!!!!!!");

  try {
    const response = await axios.post(
      "https://safe-hi.xyz/db/yangchun_stt_upload_policy", // 실제 주소로 수정
      {
        stt_file_name: stt_file_name,
        user_email: email,
      }
    );

    if (response.data.status) {
      console.log("✅ reportid:", response.data.reportid);
      return {
        success: true,
        reportid: response.data.reportid,
        message: response.data.msg,
      };
    } else {
      console.warn("❌ 요청 실패:", response.data.msg);
      return {
        success: false,
        message: response.data.msg,
      };
    }
  } catch (err) {
    console.error("🚫 STT 업로드 요청 오류:", err);
    return {
      success: false,
      message: "요청 중 오류 발생",
    };
  }
}
