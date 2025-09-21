// client-axios.js
import axios from "axios";

const BASE_URL = "https://safe-hi.xyz:20443";

async function sendLicenseInfo() {
  const payload = {
    reportid: 1111,
    qualificationType: "1종",
    registrationNumber: "REG-0001",
    licenseNumber: "01-123-123",
    issueDate: "2024-03-03", // YYYY-MM-DD
    name: "홍길동",
    residentNumber: "001234-12412414",
    address: "대전시 서구 ~~",
    phone: "010-1234-5678",
    licenseType: "일반",
    isreissue: true,
    reissueReason: "분실 재발급 요청"
  };

  const url = `${BASE_URL}/db/yangchun_license_info_edit`;

  try {
    const { data } = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 10_000
    });

    // 기대 응답: { status: true|false, reportid: number|null, msg: string }
    console.log("✅ response:", data);
    if (data.status) {
      console.log("생성된 reportid:", data.reportid);
    } else {
      console.log("실패 메시지:", data.msg);
    }
  } catch (err) {
    // 네트워크/타임아웃/서버 에러
    const res = err.response?.data;
    console.error("❌ request failed:", err.message);
    if (res) console.error("server says:", res);
  }
}

sendLicenseInfo();
