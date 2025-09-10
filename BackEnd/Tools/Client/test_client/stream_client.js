const ws = new WebSocket('ws://localhost:8085');

ws.onopen = () => {
  console.log('WebSocket 연결 성공');

  // 음성 스트리밍 시작
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          ws.send(event.data);
        }
      };

      mediaRecorder.start(500); // 500ms마다 데이터 전송

      ws.onclose = () => {
        console.log('WebSocket 연결 종료');
        mediaRecorder.stop();
      };
    })
    .catch((err) => {
      console.error('마이크 접근 실패:', err);
    });
};

ws.onerror = (error) => {
  console.error('WebSocket 오류:', error);
};
