const express = require('express');
const cors = require('cors'); // CORS 미들웨어 추가
const multer = require('multer');
const path = require('path');
const https = require('https');
const fs = require('fs');

const { spawn } = require('child_process');

const app = express();
const port = 23000;
require('dotenv').config();

// CORS 미들웨어 사용 (모든 출처에 대해 허용)
app.use(cors());

// 라우팅 파일 불러오기
const aiRoutes = require('./URIProcess/AI_URI_Process');
const dbRoutes = require('./URIProcess/DB_URI_Process');
const remoteDataRoutes = require('./URIProcess/RD_URI_Process');

///////////////////////////////////////////////
//////////////////// 라우팅 ////////////////////
///////////////////////////////////////////////

app.use('/ai', aiRoutes);
app.use('/db', dbRoutes);
app.use('/remotedata', remoteDataRoutes);

// http server
// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
// });

/////////////////////////////////////////////////
//////////////////// https //////////////////////
/////////////////////////////////////////////////

// 인증서 로드
// 경로 유출 금지
const options = {
  key:  fs.readFileSync('./keys/privkey.pem'),
  cert: fs.readFileSync('./keys/fullchain.pem')
};

// HTTPS 서버 실행 (포트 20443)
https.createServer(options, app)
  .listen(20443, () => {
    console.log('HTTPS server is running on port 20443');
  });

// (선택) HTTP 요청을 HTTPS로 강제 리다이렉트
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(301, { Location: 'https://' + req.headers.host + req.url });
  res.end();
}).listen(20080);


///////////////// Client Connection ////////////


// 저장 위치와 파일 이름을 지정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
  
  const upload = multer({ storage });
  const { wavProcess } = require('./AI/funcs/wav_process');
  
  // .wav 파일을 받을 엔드포인트 생성
  app.post('/upload', upload.single('audio'), (req, res) => {
    if (req.file) {
      console.log('File received:', req.file);
      console.log('File received:', req.file.path);
      const tmp_upload_path = path.join(__dirname, req.file.path);
      wavProcess(tmp_upload_path);
      res.status(200).json({ message: 'File uploaded successfully' });
    } else {
      res.status(400).json({ message: 'No file received' });
    }
  });

  //////////////////////////////////////////////////

  // Observing 제거 (25.2.6)


// 안심하이가 자랑하는 AI 모델들 -> 아래 코드에서 model load
// 1. LLM(요약/정책추천) 2. embedding 3. STT

// AI 요약 모듈
// 4.11 요약 모듈은 ollama로 대체
// embedding_model_path = '/new_data/sw_excellent/BackEnd/AI/funcs/llm/server_abstract_embedding.py'
// stt_model_path = 'websocket_vosk_server.py'

// const pythonEmbeddingModel = spawn('python3', [embedding_model_path]);

// // Python stdout, stderr를 로그로 남김
// pythonEmbeddingModel.stdout.on('data', (data) => {
//   console.log(`[Python stdout]: ${data}`);
// });

// pythonEmbeddingModel.stderr.on('data', (data) => {
//   console.error(`[Python stderr]: ${data}`);
// });

// pythonEmbeddingModel.on('close', (code) => {
//   console.log(`[Python] process exited with code ${code}`);
// });

// STT stream 처리 모듈
// ws stt_ai 로 대체
// const pythonSttModel = spawn('python3', [stt_model_path]);

// pythonSttModel.stdout.on('data', (data) => {
//   console.log(`[Python STDOUT]: ${data}`);
// });

// pythonSttModel.stderr.on('data', (data) => {
//   console.error(`[Python STDERR]: ${data}`);
// });

// pythonSttModel.on('close', (code) => {
//   console.log(`Python server exited with code ${code}`);
// });


/////////////////////////////////////////////////////////
///// real-time stream using ws(websocket) //////////////

// const WebSocket = require('ws');

// uploads 폴더가 없으면 생성합니다.
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// === 종료 시 모든 Python 프로세스를 정리 === //
function cleanup() {
  console.log('Cleaning up child Python processes...');
  pythonEmbeddingModel.kill();
  pythonSttModel.kill();
  process.exit(); // Node 자체 종료
}

// 일반 종료 시그널
process.on('SIGINT', cleanup);    // Ctrl+C
process.on('SIGTERM', cleanup);   // kill 명령