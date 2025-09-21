const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// WebSocket 서버 주소 설정
const ws = new WebSocket('ws://localhost:28765');

// 서버 응답 수신
ws.on('open', () => {
    console.log("Connected to WebSocket server.");

    // 파일 경로 설정
    const filePath = path.join(__dirname, 'sample.wav');

    // .wav 파일 읽고 서버로 전송
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            ws.close();
            return;
        }

        // WebSocket을 통해 오디오 데이터 전송
        ws.send(data);
        console.log("Audio data sent to server.");
    });
});

// 서버에서 메시지 수신
ws.on('message', (data) => {
    const response = JSON.parse(data);
    if (response.text) {
        console.log("Server Response:", response.text);
        ws.close();
    } else if (response.message) {
        console.log(response.message);
        ws.close();
    }
});

// WebSocket 연결 종료 시 처리
ws.on('close', () => {
    console.log("Disconnected from WebSocket server.");
});
