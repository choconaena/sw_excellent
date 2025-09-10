const express = require('express');
const router = express.Router();
const aiModule = require('../AI/ai_api');

// AI 모듈 라우팅
router.get('/', (req, res) => {
    aiModule.runAiFunction();
    res.send('AI module executed');
});

// AI 모듈 라우팅
router.get('/runlocalfunc', runAIFunc_local);

// AI 모듈 라우팅
router.get('/runremotefunc', runAIFunc_remote);
router.get('/arg_file', arg_file_ai)

router.post('/runAI_abstract', runAI_abstract)


// async 함수 수정 - result를 res로 보내기
async function runAIFunc_local(req, res) {
    try {
        console.log('Executing local Python function...');
        const result = await aiModule.runAIFunc_local();
        console.log(`Local function result: ${result}`);
        // 결과와 함께 응답 보내기
        res.send(`AI local module executed. Result: ${result}`);
    } catch (error) {
        console.error('Error executing local Python function:', error);
        res.status(500).send('Error executing AI local module');
    }
}


// async 함수 수정 - result를 res로 보내기
async function runAIFunc_remote(req, res) {
    try {
        console.log('Executing local Python function...');
        const result = await aiModule.runAIFunc_remote();
        console.log(`Remote function result: ${result}`);
        // 결과와 함께 응답 보내기
        res.send(`AI remote module executed. Result: ${result}`);
    } catch (error) {
        console.error('Error executing remote Python function:', error);
        res.status(500).send('Error executing AI remote module');
    }
}

// async 함수 수정 - result를 res로 보내기
async function arg_file_ai(req, res) {
    try {
        console.log('Executing arg_file_ai Python function...');
        const result = await aiModule.runAIFunc_wav_process();
        console.log(`Remote function result: ${result}`);
        // 결과와 함께 응답 보내기
        res.send(`AI remote module executed. Result: ${result}`);
    } catch (error) {
        console.error('Error executing remote Python function:', error);
        res.status(500).send('Error executing AI remote module');
    }
}

// async 함수 수정 - result를 res로 보내기
async function runAI_abstract(req, res) {
    try {
        console.log("reportid, email, txt_file : ", req.body)
        const { reportid, email, txt_file } = req.body;

        if (!reportid || !email || !txt_file) {
            return res.status(400).json({ error: 'reportid, email, txt_file are required' });
        }

        console.log('Executing local Python function with input:', { reportid, email });

        // Python 함수에 세 파라미터 전달
        const result = await aiModule.runAIFunc_abstract(reportid, email, txt_file);

        console.log(`Remote function result: ${result}`);

        // 결과 반환
        res.json({ message: 'AI remote module executed', result });

    } catch (error) {
        console.error('Error executing remote Python function:', error);
        res.status(500).send('Error executing AI remote module');
    }
}


module.exports = router;
