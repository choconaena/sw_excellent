// client.js
import WebSocket from "ws";
import fs from "fs";

// 서버 주소
const WS_URL = "wss://safe-hi.xyz:28084"; // self-signed면 rejectUnauthorized: false 필요

// WebSocket 생성
const ws = new WebSocket(WS_URL, {
  rejectUnauthorized: false, // ⚠️ self-signed 인증서 테스트용 (운영에서는 true 권장)
});

// 연결 성공
ws.on("open", () => {
  console.log("✅ Connected to STT server");

  // 1) 연결 직후 메타데이터 전송
  ws.send(
    JSON.stringify({
      reportid: 1234,
      email: "user@example.com",
    })
  );

  console.log("📤 Sent metadata");

  // 2) 오디오 파일에서 청크 단위로 읽어서 전송 (예: raw PCM 데이터)
  const audioStream = fs.createReadStream("./sample_audio.pcm"); // 16kHz, 16bit PCM, mono
  audioStream.on("data", (chunk) => {
    ws.send(chunk); // 서버에 바이너리 청크 전송
  });

  audioStream.on("end", () => {
    console.log("📤 Audio stream finished");
  });
});

// 서버로부터 메시지 수신
ws.on("message", (msg) => {
  console.log("📥 STT Result:", msg.toString());
});

// 연결 종료
ws.on("close", (code, reason) => {
  console.log(`❌ Connection closed: ${code} ${reason}`);
});

// 에러 핸들링
ws.on("error", (err) => {
  console.error("⚠️ Connection error:", err);
});
