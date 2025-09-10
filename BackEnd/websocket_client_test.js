const WebSocket = require('ws');
const mic = require('mic');

const ws = new WebSocket('ws://localhost:8085');

ws.on('open', () => {
  console.log('서버에 연결됨');

  // 마이크 설정
  const micInstance = mic({
    rate: '16000',       // 샘플링 레이트 (16kHz)
    channels: '1',       // 모노 채널
    encoding: 'raw',     // RAW PCM 데이터
    debug: false,
    exitOnSilence: 6     // 침묵 시 종료
  });

  const micInputStream = micInstance.getAudioStream();

  micInputStream.on('data', (data) => {
    console.log(`전송 중: ${data.length} bytes`);
    ws.send(data); // WebSocket을 통해 오디오 데이터를 서버로 전송
  });

  micInputStream.on('error', (err) => {
    console.error('마이크 오류:', err);
  });

  ws.on('close', () => {
    console.log('서버 연결 종료');
    micInstance.stop();
  });

  micInstance.start(); // 마이크 스트리밍 시작
});

ws.on('error', (err) => {
  console.error('WebSocket 오류:', err);
});
