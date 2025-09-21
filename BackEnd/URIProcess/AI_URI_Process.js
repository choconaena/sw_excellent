const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const aiModule = require('../AI/ai_api');

// multer 설정 (메모리 저장소 사용)
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        // HWP 파일만 허용
        if (file.originalname.toLowerCase().endsWith('.hwp')) {
            cb(null, true);
        } else {
            cb(new Error('HWP 파일만 업로드 가능합니다.'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB 제한
    }
});

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

// HWP 분석 관련 라우팅
router.get('/analyze-hwp-test', analyzeHWPTest)
router.post('/analyze-hwp', upload.single('hwpFile'), analyzeHWP)

// React 컴포넌트 생성 라우팅
router.post('/generate-component', generateComponent)

// STT 필드 추출 라우팅
router.post('/extract-stt-fields', extractSTTFieldsRoute)


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

// 테스트용 HWP 분석 함수 (test.hwp 파일 자동 사용)
async function analyzeHWPTest(req, res) {
    try {
        console.log('테스트 HWP 분석 시작...');

        const result = await aiModule.analyzeTestHWP();

        if (result.success) {
            console.log('테스트 HWP 분석 성공:', result.data);
            res.json({
                success: true,
                message: 'HWP 분석 완료',
                formName: 'test',
                analysisResult: result.data,
                rawGptResponse: result.rawResponse
            });
        } else {
            console.error('테스트 HWP 분석 실패:', result.error);
            res.status(500).json({
                success: false,
                error: result.error,
                message: 'HWP 분석 중 오류가 발생했습니다.'
            });
        }

    } catch (error) {
        console.error('테스트 HWP 분석 중 예외 발생:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'HWP 분석 중 예외가 발생했습니다.'
        });
    }
}

// 일반 HWP 분석 함수 (파일 업로드)
async function analyzeHWP(req, res) {
    try {
        console.log('HWP 분석 요청:', {
            body: req.body,
            file: req.file ? {
                originalname: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype
            } : null
        });

        const formName = req.body.formName;
        const hwpFile = req.file;

        if (!formName) {
            return res.status(400).json({
                success: false,
                error: 'formName이 필요합니다.',
                message: '서식명이 누락되었습니다.'
            });
        }

        if (!hwpFile) {
            return res.status(400).json({
                success: false,
                error: 'HWP 파일이 필요합니다.',
                message: 'HWP 파일이 누락되었습니다.'
            });
        }

        console.log('HWP 분석 시작:', {
            formName,
            fileName: hwpFile.originalname,
            fileSize: hwpFile.size
        });

        // 윈도우 데스크탑 서버(28090 포트)로 HWP 파일 전송하여 텍스트 추출
        let hwpContent;
        try {
            console.log('윈도우 HWP 파싱 서버로 파일 전송 중...');

            const FormData = require('form-data');
            const fetch = require('node-fetch');

            const formData = new FormData();
            formData.append('hwpFile', hwpFile.buffer, {
                filename: hwpFile.originalname,
                contentType: hwpFile.mimetype
            });
            formData.append('formName', formName);

            const parseResponse = await fetch('http://localhost:28090/parse', {
                method: 'POST',
                body: formData,
                timeout: 30000 // 30초 타임아웃
            });

            if (!parseResponse.ok) {
                throw new Error(`HWP 파싱 서버 오류: ${parseResponse.status} ${parseResponse.statusText}`);
            }

            const parseResult = await parseResponse.json();

            if (parseResult.success) {
                hwpContent = parseResult.data.extractedText;
                console.log(`HWP 텍스트 추출 성공: ${hwpContent.length}자`);
            } else {
                throw new Error(parseResult.error || 'HWP 파싱 실패');
            }

        } catch (parseError) {
            console.warn('HWP 파싱 서버 연결 실패, Mock 데이터 사용:', parseError.message);

            // 파싱 실패 시 기본 Mock 데이터 사용
            hwpContent = `
            [업로드된 HWP 파일: ${hwpFile.originalname}]
            [⚠️ HWP 파싱 서버 연결 실패로 Mock 데이터 사용]

            ${formName} 신청서

            1. 신청인 정보
            - 성명: [     ]
            - 생년월일: [     ]년 [  ]월 [  ]일
            - 주소: [                    ]
            - 전화번호: [     ]

            2. 신청 내용
            - 신청 사유: [                    ]
            - 용도: [                    ]
            - 발급 구분: □ 신규발급 □ 재발급

            3. 서명
            신청인: _____________ (서명)
            신청일: 202_년 __월 __일
            `;
        }

        const result = await aiModule.analyzeHWPWithGPT(hwpContent, formName);

        if (result.success) {
            console.log('HWP 분석 성공:', result.data);

            // 분석된 양식을 시스템에 영구 저장
            const formDb = require('../database/formSchemas');
            const saveResult = formDb.addForm({
                id: result.data.reportType,
                title: formName,
                formName: formName,
                fileName: hwpFile.originalname,
                schema: result.data
            });

            if (saveResult.success) {
                console.log('✅ 양식이 시스템에 저장되었습니다:', formName);
            } else {
                console.warn('⚠️ 양식 저장 실패 (이미 존재하거나 오류):', saveResult.error);
            }

            res.json({
                success: true,
                message: 'HWP 분석 완료',
                data: result.data,
                formName: formName,
                fileName: hwpFile.originalname,
                rawGptResponse: result.rawResponse,
                savedToSystem: saveResult.success
            });
        } else {
            console.error('HWP 분석 실패:', result.error);
            res.status(500).json({
                success: false,
                error: result.error,
                message: 'HWP 분석 중 오류가 발생했습니다.'
            });
        }

    } catch (error) {
        console.error('HWP 분석 중 예외 발생:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'HWP 분석 중 예외가 발생했습니다.'
        });
    }
}

// React 컴포넌트 자동 생성 함수
async function generateComponent(req, res) {
    try {
        console.log('React 컴포넌트 생성 요청:', req.body);

        const { formSchema, formName } = req.body;

        if (!formSchema || !formName) {
            return res.status(400).json({
                success: false,
                error: 'formSchema와 formName이 필요합니다.',
                message: '필수 파라미터가 누락되었습니다.'
            });
        }

        console.log('React 컴포넌트 생성 시작:', { formName, schemaType: formSchema.reportType });

        const result = await aiModule.generateReactComponent(formSchema, formName);

        if (result.success) {
            console.log('React 컴포넌트 생성 성공');

            // 파일 시스템에 실제 컴포넌트 파일 저장
            const fs = require('fs');
            const path = require('path');

            const componentDir = path.join(__dirname, '../../generated-components', formName.toLowerCase().replace(/[^a-z0-9]/g, '-'));

            // 디렉토리 생성
            if (!fs.existsSync(componentDir)) {
                fs.mkdirSync(componentDir, { recursive: true });
            }

            // 컴포넌트 파일들 저장
            const indexPath = path.join(componentDir, 'index.jsx');
            const stylePath = path.join(componentDir, 'style.js');

            fs.writeFileSync(indexPath, result.data.componentCode);
            fs.writeFileSync(stylePath, result.data.styleCode);

            console.log(`컴포넌트 파일 저장 완료: ${componentDir}`);

            res.json({
                success: true,
                message: 'React 컴포넌트 생성 완료',
                data: {
                    ...result.data,
                    savedPath: componentDir,
                    files: ['index.jsx', 'style.js']
                },
                rawGptResponse: result.rawResponse
            });
        } else {
            console.error('React 컴포넌트 생성 실패:', result.error);
            res.status(500).json({
                success: false,
                error: result.error,
                message: 'React 컴포넌트 생성 중 오류가 발생했습니다.'
            });
        }

    } catch (error) {
        console.error('React 컴포넌트 생성 중 예외 발생:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'React 컴포넌트 생성 중 예외가 발생했습니다.'
        });
    }
}


// STT 필드 추출 API 함수
async function extractSTTFieldsRoute(req, res) {
    try {
        const { sttContent, formSchema, currentFormData } = req.body;

        console.log('STT 필드 추출 요청:', {
            sttContentLength: sttContent?.length || 0,
            formSchema: formSchema?.reportType || 'unknown',
            currentFormDataKeys: Object.keys(currentFormData || {})
        });

        // 입력 검증
        if (!sttContent || !formSchema) {
            return res.status(400).json({
                success: false,
                error: 'STT 내용과 폼 스키마가 필요합니다.'
            });
        }

        const result = await aiModule.extractSTTFields(sttContent, formSchema, currentFormData || {});

        if (result.success) {
            console.log('STT 필드 추출 성공:', result.data);
            res.json({
                success: true,
                message: 'STT 필드 추출 완료',
                data: result.data
            });
        } else {
            console.error('STT 필드 추출 실패:', result.error);
            res.status(500).json({
                success: false,
                error: result.error,
                message: 'STT 필드 추출 중 오류가 발생했습니다.'
            });
        }

    } catch (error) {
        console.error('STT 필드 추출 라우트 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'STT 필드 추출 요청 처리 중 오류가 발생했습니다.'
        });
    }
}

module.exports = router;
