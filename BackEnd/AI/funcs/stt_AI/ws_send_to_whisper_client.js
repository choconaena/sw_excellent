const WebSocket = require('ws');
const mic = require('mic');

// 귀하가 제공한 WebSocket 서버 주소와 포트
const ws = new WebSocket('ws://211.188.55.88:8085');

ws.on('open', () => {
    console.log('서버와 연결되었습니다. 마이크 입력 스트리밍 시작...');

    const micInstance = mic({
        rate: '16000',          // 16kHz 샘플링 레이트
        channels: '1',          // 모노 채널
        bitwidth: '16',         // 16비트
        encoding: 'signed-integer',
        endian: 'little',
        fileType: 'raw'         // WAV 형식 스트리밍 //여기 변경!!!!!!!!!!!!!!
    });

    const micInputStream = micInstance.getAudioStream();

    micInputStream.on('data', (data) => {
        ws.send(data);
        console.log("전송된 오디오 데이터 크기: ${data.length}");
    });

    micInputStream.on('error', (err) => {
        console.error('마이크 스트림 에러:', err);
    });

    micInputStream.on('startComplete', () => {
        console.log('마이크 스트림 시작됨');
    });

    micInputStream.on('stopComplete', () => {
        console.log('마이크 스트림 종료됨');
    });

    micInstance.start();

    ws.on('close', () => {
        console.log('서버와의 연결이 종료되었습니다. 마이크 스트림을 중단합니다.');
        micInstance.stop();
    });
});
// ✅ 서버가 보내는 이벤트 메시지 수신 처리
ws.on('message', (message) => {
    console.log('서버로부터 받은 메시지:', message.toString());
});

ws.on('error', (error) => {
    console.error('WebSocket 에러:', error);
});