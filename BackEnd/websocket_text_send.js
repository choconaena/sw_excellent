const WebSocket = require('ws');

const PORT = 8085;
const server = new WebSocket.Server({ port: PORT });

console.log(`WebSocket server started on ws://localhost:${PORT}`);

server.on('connection', (ws) => {
  console.log('Client connected');

  const messages = [
    "첫 번째로 인사드립니다.",
    "오늘은 몸이 좀 어떠신가요?",
    "요즘 식사는 잘 챙겨드시는지 궁금합니다.",
    "밤에 잠은 잘 주무시나요?",
    "날씨가 많이 풀렸는데 산책은 자주 나가시는지요?",
    "집안에 불편한 점은 없으신가요?",
    "요즘 특별히 걱정되시는 일은 없으신가요?",
    "가끔 전화 드리는 게 괜찮으신지요?",
    "최근에 즐겁게 지내신 일 있으신가요?",
    "필요한 물건이나 도움이 필요하신 건 없나요?",
    "혹시 요즘 외롭다고 느끼실 때가 있으신가요?",
    "저희가 더 자주 찾아뵈면 좋으시겠어요?",
  ];  

  let count = 0;

  const intervalId = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN && count < messages.length) {
      ws.send(messages[count]);
      count++;
    }

    if (count >= messages.length) {
      clearInterval(intervalId); // 3개 다 보내면 타이머 정지
      console.log('Finished sending messages to client');
    }
  }, 1000);

  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(intervalId);
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
    clearInterval(intervalId);
  });
});
