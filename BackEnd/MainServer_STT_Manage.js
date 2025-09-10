// pm2 start python3 --name STT_AI -- -u /home/BackEnd/AI/funcs/stt_AI/server.py
// pm2 start /home/BackEnd/MainServer_STT_Manage.js --name STT-manage-server

const express = require('express');
const http = require('http');
const { Server } = require('ws');
const path = require('path');
const { spawn, exec } = require('child_process');

const app = express();
const server = http.createServer(app);
const wss = new Server({ server });

const pythonLogPath = path.join(process.env.HOME, '.pm2', 'logs', 'STT-AI-out.log');

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// 클라이언트 관리
const clients = new Set();

// Python 로그 tail로 실시간 스트리밍`
const tail = spawn('tail', ['-n', '0', '-F', pythonLogPath]);

tail.stdout.on('data', (data) => {
    const msg = data.toString();
    clients.forEach(ws => {
        if (ws.readyState === ws.OPEN) {
            ws.send(msg);
        }
    });
});

tail.stderr.on('data', (data) => {
    console.error(`[TAIL stderr]: ${data.toString().trim()}`);
});

// WebSocket 연결
wss.on('connection', (ws) => {
    console.log('✅ WebSocket client connected');
    clients.add(ws);

    ws.on('close', () => {
        console.log('❌ WebSocket client disconnected');
        clients.delete(ws);
    });
});

// PM2 상태 체크 라우터
app.get('/pm2-status', (req, res) => {
    exec('pm2 list', (error, stdout, stderr) => {
        if (error) {
            console.error(`[pm2-status error]: ${error.message}`);
            res.status(500).send(`[ERROR] ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`[pm2-status stderr]: ${stderr}`);
        }
        res.type('text/plain').send(stdout);
    });
});

// PM2 재시작 라우터
app.get('/pm2-restart', (req, res) => {
    const serviceName = req.query.name;
    if (!serviceName) {
        res.status(400).send('Missing service name.');
        return;
    }

    exec(`pm2 restart ${serviceName}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`[pm2-restart error]: ${error.message}`);
            res.status(500).send(`[ERROR] ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`[pm2-restart stderr]: ${stderr}`);
        }
        res.type('text/plain').send(stdout);
    });
});

// 서버 실행
server.listen(3030, () => {
    console.log('🚀 Server listening on http://localhost:3030');
});
