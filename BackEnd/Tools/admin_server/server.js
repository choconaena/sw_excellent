const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 24000;

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// 인증서 경로 설정 (mkcert 등으로 발급된 인증서 사용)
const options = {
  key: fs.readFileSync('/new_data/sw_excellent/BackEnd/keys/211.188.55.88-key.pem'),
  cert: fs.readFileSync('/new_data/sw_excellent/BackEnd/keys/211.188.55.88.pem')
};

// HTTPS 서버 시작
// https.createServer(options, app).listen(PORT, () => {
//   console.log(`HTTPS Admin Server running at https://211.188.55.88`);
// });

// HTTP 서버 시작
app.listen(PORT, () => {
  console.log(`HTTP Admin Server running at http://211.188.55.88:${PORT}`);
});