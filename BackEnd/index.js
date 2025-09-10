const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const HOST = "localhost"

app.use(bodyParser.json()); // JSON 형식의 요청을 파싱

// 사용자 입력을 받아서 API 요청을 처리하는 엔드포인트
app.post('/request', async (req, res) => {
    const userInput = req.body.input; // 사용자의 입력

    if (!userInput) {
        return res.status(400).json({ error: 'Input is required' });
    }

    try {
        // API 요청을 보낼 URL을 설정 (예시로 jsonplaceholder API를 사용)
        const apiUrl = `${HOST}/posts/${userInput}`;

        // Axios로 외부 API 요청
        const response = await axios.get(apiUrl);

        // API 응답을 사용자에게 반환
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from API' });
    }
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
