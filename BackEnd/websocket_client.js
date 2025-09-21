const WebSocket = require('ws');

// 서버 주소
const ws = new WebSocket('ws://localhost:28085');

ws.on('open', () => {
  console.log('✅ Connected to WebSocket server');

  // ✅ 메타데이터 전송
  const metadata = {
    reportid: 8,
    email: 'jenny@naver.com'
  };

  ws.send(JSON.stringify(metadata));
  console.log('📤 Sent metadata:', metadata);

  // 🔊 (예시) 이후 오디오 바이너리 전송 시작 가능
  // const dummyAudio = Buffer.from([0x00, 0x01, 0x02]);
  // ws.send(dummyAudio);
});

ws.on('message', (message) => {
  console.log('📩 Message from server:', message.toString());
});

ws.on('close', () => {
  console.log('❌ Disconnected from server');
});

ws.on('error', (err) => {
  console.error('⚠️ WebSocket error:', err);
});
