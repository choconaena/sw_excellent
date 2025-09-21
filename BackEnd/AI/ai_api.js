// ai_api.js


// ./funcs 디렉토리 전체를 불러옴
const funcs = require('./funcs');

function runAiFunction() {
    console.log('this is AI module');
}

// Using Python
async function runAIFunc_local(){
    console.log('Executing local Python function...');
    const result = await funcs.callAiFuncUsingLocalFunc();
    return result;  // 결과 반환
}

async function runAIFunc_stt_abstract(){
    console.log('Executing local Python function...');
    const result = await funcs.callAiFuncUsingSTTAbstractLocalFunc(1, 'asdf');
    return result;  // 결과 반환
}

async function runAIFunc_remote(){
    console.log('Executing Python function via web...');
    const result = await funcs.callAiFuncUsingWeb();
    return result;  // 결과 반환
}

async function runAIFunc_local_file_arg(){
    console.log('Executing local Python function...');
    const result = await funcs.callAiLocalFuncFileArg();
    return result;  // 결과 반환
}


async function runAIFunc_local_file_arg(){
    console.log('Executing local Python function...');
    const result = await funcs.callAiLocalFuncFileArg();
    return result;  // 결과 반환
}


async function runAIFunc_wav_process(){
    console.log('Executing local Python function...');
    const result = await funcs.wavProcess();
    return result;  // 결과 반환
}

async function runAIFunc_abstract(reportid, email, txt_file_path){
  const url = 'https://211.188.55.88/db/update_visit_category'; // 서버 주소 수정 필요
  const txtFileData = [
    {
        subject: "건강",
        abstract: "소화 불편 호소",
        detail: "하루 종일 속 쓰림 지속됨"
    },
    {
        subject: "경제",
        abstract: "공과금 납부 어려움",
        detail: "최근 전기/수도 요금 미납 상태"
    }
  ];
  
  const payload = {
    reportid: reportid,
    email: email,
    txt_file: JSON.stringify(txtFileData)
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`  // JWT 토큰 인증 사용하는 경우
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  if (!response.ok) {
    console.error('❌ Error:', result);
  } else {
    console.log('✅ Success:', result);
  }

  return result;
}

// HWP 분석을 위한 GPT API 함수
async function analyzeHWPWithGPT(hwpContent, formName) {
    // API 키 체크 (sk-로 시작하지 않거나 기본값이면 mock 데이터 사용)
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here' || apiKey === 'OPENAI_KEY_PLACEHOLDER' || !apiKey.startsWith('sk-')) {
        console.log('⚠️ OpenAI API 키가 설정되지 않음. Mock 데이터 반환.');
        console.log('💡 실제 GPT 모델을 사용하려면 .env 파일에 올바른 API 키를 설정하세요.');
        return {
            success: true,
            data: {
                reportType: formName,
                file_name: `${formName}_generated.hwp`,
                // 민원인이 태블릿으로 직접 입력해야 하는 필수 정보들 (절대 틀리면 안 되는 중요 데이터)
                directInput: {
                    applicantData: {
                        name: { type: "text", label: "성명", required: true, placeholder: "홍길동", validation: "정확한 본인 성명 입력 필수" },
                        birthDate: { type: "date", label: "생년월일", required: true, validation: "신분증과 일치해야 함" },
                        address: { type: "text", label: "주소", required: true, placeholder: "서울시 양천구...", validation: "현재 거주지 주소" },
                        phone: { type: "text", label: "전화번호", required: true, placeholder: "010-1234-5678", validation: "연락 가능한 번호" },
                        email: { type: "text", label: "이메일", required: false, placeholder: "example@email.com" },
                        residentNumber: { type: "text", label: "주민등록번호", required: true, placeholder: "123456-1234567", validation: "신분증 확인 필수" },
                        gender: { type: "radio", label: "성별", required: true, options: ["남", "여"] }
                    },
                    documentData: {
                        issueType: { type: "radio", label: "발급 구분", required: true, options: ["신규발급", "재발급"] },
                        urgentRequest: { type: "radio", label: "긴급 신청", required: false, options: ["일반", "긴급"] },
                        deliveryMethod: { type: "radio", label: "수령 방법", required: true, options: ["직접수령", "우편발송", "이메일발송"] }
                    },
                    signature: {
                        applicantSignature: { type: "canvas", label: "신청인 서명", required: true, description: "본인 확인용 서명" }
                    }
                },
                // STT 상담 내용을 통해 AI가 자동으로 생성하는 부분
                sttGenerated: {
                    purposeData: {
                        applicationReason: {
                            type: "textarea",
                            label: "신청 사유",
                            required: true,
                            description: "상담 내용을 바탕으로 AI가 신청 이유를 자동 생성",
                            aiPrompt: "민원인의 상담 내용에서 구체적인 신청 사유를 추출하여 공식적인 문체로 작성"
                        },
                        usagePurpose: {
                            type: "textarea",
                            label: "사용 목적",
                            required: true,
                            description: "상담 내용을 바탕으로 AI가 사용 목적을 자동 생성",
                            aiPrompt: "증명서를 어디에 사용할 것인지 상담 내용에서 파악하여 명확하게 작성"
                        },
                        additionalInfo: {
                            type: "textarea",
                            label: "추가 정보",
                            required: false,
                            description: "상담 중 언급된 기타 중요 정보를 AI가 자동 정리",
                            aiPrompt: "상담 과정에서 언급된 특별한 사정이나 추가 정보를 정리"
                        }
                    }
                },
                instructions: [
                    "🔴 직접 입력 정보는 민원인이 태블릿으로 정확히 입력해야 합니다",
                    "🤖 STT 생성 정보는 상담 내용을 바탕으로 AI가 자동으로 작성합니다",
                    "📝 서명은 반드시 본인이 직접 해야 합니다",
                    "⚠️ 신분증과 일치하지 않는 정보는 처리가 불가능합니다"
                ]
            },
            rawResponse: "[Mock Response] OpenAI API 키가 설정되지 않아 샘플 데이터를 반환했습니다."
        };
    }

    const OpenAI = require('openai');

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const analysisPrompt = `
당신은 한국의 행정 민원 양식 전문가입니다. 아래 HWP 파일의 내용을 분석하여 기존 시스템 구조에 맞는 JSON 형식으로 정리해주세요.

**기존 JSON 구조 예시 (정보공개청구서):**
{
  "reportType": "information_open",
  "file_name": "report_test.hwp",
  "items": {
    "applicantData": {
      "name": "홍길동",
      "birthDate": "2000.11.03",
      "address": "서울시 양천구...",
      "phone": "010-1234-5678",
      "email": "test@example.com",
      "gender": "남"
    },
    "summaryData": {
      "content": "상담 내용 기반 자동 생성",
      "isPublic": true
    }
  }
}

**기존 JSON 구조 예시 (건설기계조종사면허):**
{
  "reportType": "construction_machinery_license",
  "file_name": "report_test.hwp",
  "items": {
    "qualificationType": "~~등급",
    "name": "홍길동",
    "residentNumber": "001234-1234567",
    "address": "서울시 양천구...",
    "phone": "010-1234-5678",
    "isreissue": false,
    "reissueReason": null
  }
}

**분류 기준:**
1. **directInput**: 민원인이 직접 입력하는 정확한 개인정보 (name, birthDate, address, phone 등)
2. **signature**: 서명 필요 부분
3. **sttGenerated**: STT 상담 내용으로 AI가 자동 생성하는 부분 (summaryData.content, 사유, 목적 등)

**응답 형식:**
\`\`\`json
{
  "reportType": "${formName}",
  "file_name": "${formName}_generated.hwp",
  "directInput": {
    "applicantData": {
      "name": { "type": "text", "label": "성명", "required": true, "placeholder": "홍길동", "validation": "정확한 본인 성명 입력 필수" },
      "birthDate": { "type": "date", "label": "생년월일", "required": true, "validation": "신분증과 일치해야 함" },
      "address": { "type": "text", "label": "주소", "required": true, "validation": "현재 거주지 주소" },
      "phone": { "type": "text", "label": "전화번호", "required": true, "validation": "연락 가능한 번호" }
    },
    "documentData": {
      "issueType": { "type": "radio", "label": "발급 구분", "required": true, "options": ["신규발급", "재발급"] }
    },
    "signature": {
      "applicantSignature": { "type": "canvas", "label": "신청인 서명", "required": true }
    }
  },
  "sttGenerated": {
    "purposeData": {
      "applicationReason": {
        "type": "textarea",
        "label": "신청 사유",
        "required": true,
        "aiPrompt": "민원인의 상담 내용에서 구체적인 신청 사유를 추출하여 공식적인 문체로 작성"
      },
      "usagePurpose": {
        "type": "textarea",
        "label": "사용 목적",
        "required": true,
        "aiPrompt": "증명서를 어디에 사용할 것인지 상담 내용에서 파악하여 명확하게 작성"
      }
    }
  },
  "instructions": ["양식 작성 안내사항들"]
}
\`\`\`

**분석할 HWP 내용:**
${hwpContent}

위 HWP 내용을 분석하여 기존 시스템 구조와 호환되는 JSON 형식으로 필드 구조를 제공해주세요. items 구조가 실제 HWP 생성 시 사용되므로 정확하게 분석해주세요.
`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "당신은 한국 행정 민원 양식 분석 전문가입니다. HWP 문서의 내용을 분석하여 사용자 입력 필드를 체계적으로 분류하고 JSON 형식으로 정리합니다."
                },
                {
                    role: "user",
                    content: analysisPrompt
                }
            ],
            temperature: 0.1,
            max_tokens: 2000
        });

        const response = completion.choices[0].message.content;
        console.log('GPT Response:', response);

        // JSON 추출 (마크다운 코드 블록에서)
        const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
            const jsonStr = jsonMatch[1];
            const analysisResult = JSON.parse(jsonStr);
            return {
                success: true,
                data: analysisResult,
                rawResponse: response
            };
        } else {
            throw new Error('JSON 형식을 찾을 수 없습니다.');
        }

    } catch (error) {
        console.error('GPT API 에러:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
}

// 테스트용 HWP 분석 함수 (test.hwp 파일 사용)
async function analyzeTestHWP() {
    const fs = require('fs').promises;
    const path = require('path');

    try {
        // test.hwp 파일 경로
        const testHwpPath = path.join(__dirname, '../../templates/test.hwp');

        // 임시로 HWP 내용을 텍스트로 가정 (실제로는 HWP 파싱 필요)
        // 여기서는 mock 데이터로 테스트
        const mockHwpContent = `
사업자등록증명 신청서

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

        const result = await analyzeHWPWithGPT(mockHwpContent, "test");
        return result;

    } catch (error) {
        console.error('테스트 HWP 분석 에러:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
}

// React 컴포넌트 자동 생성을 위한 GPT API 함수
async function generateReactComponent(formSchema, formName) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here' || apiKey === 'OPENAI_KEY_PLACEHOLDER' || !apiKey.startsWith('sk-')) {
        console.log('⚠️ OpenAI API 키가 설정되지 않음. React 컴포넌트 생성 불가.');
        return {
            success: false,
            error: 'OpenAI API 키가 필요합니다.'
        };
    }

    const OpenAI = require('openai');
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const componentPrompt = `
당신은 한국의 행정 민원 양식을 위한 React 컴포넌트 자동 생성 전문가입니다.

주어진 양식 스키마를 바탕으로 완전한 React 컴포넌트 코드를 생성해주세요.

**기존 코드 스타일 및 패턴:**
- styled-components 사용
- useState, useNavigate 훅 활용
- 3단계 스텝 진행 (기본정보 → 신청정보 → 서명)
- 캔버스 서명 기능 포함
- MainLayout 래퍼 사용
- 한국어 UI/UX

**양식 스키마:**
\`\`\`json
${JSON.stringify(formSchema, null, 2)}
\`\`\`

**생성할 파일들:**
1. \`${formName}/index.jsx\` - 메인 컴포넌트
2. \`${formName}/style.js\` - styled-components 스타일

**요구사항:**
- directInput 필드들을 적절한 스텝으로 분리
- 각 필드 타입에 맞는 입력 컴포넌트 생성 (text, date, radio, canvas)
- 필수 필드 검증 및 에러 처리
- 서명 캔버스 기능 완전 구현
- STT 생성 필드 미리보기
- HWP 생성 API 연동 (\`http://localhost:28091/\`)
- 완성된 HWP 파일 자동 다운로드

**응답 형식:**
\`\`\`json
{
  "componentCode": "// React 컴포넌트 전체 코드",
  "styleCode": "// styled-components 스타일 코드",
  "routePath": "/${formName.toLowerCase().replace(/[^a-z0-9]/g, '-')}",
  "componentName": "${formName}Form"
}
\`\`\`

기존 동적 양식 컴포넌트 구조를 참고하되, 이 특정 양식에 최적화된 컴포넌트를 생성해주세요.
`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "당신은 React 전문 개발자로서 한국 행정 양식을 위한 컴포넌트를 자동 생성합니다. 깔끔하고 사용자 친화적인 코드를 작성하며, 기존 프로젝트 패턴을 준수합니다."
                },
                {
                    role: "user",
                    content: componentPrompt
                }
            ],
            temperature: 0.1,
            max_tokens: 4000
        });

        const response = completion.choices[0].message.content;
        console.log('GPT React 컴포넌트 생성 응답:', response);

        // JSON 추출 (마크다운 코드 블록에서)
        const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
            const jsonStr = jsonMatch[1];
            const componentResult = JSON.parse(jsonStr);
            return {
                success: true,
                data: componentResult,
                rawResponse: response
            };
        } else {
            throw new Error('JSON 형식을 찾을 수 없습니다.');
        }

    } catch (error) {
        console.error('React 컴포넌트 생성 오류:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
}

/**
 * STT 내용에서 양식 필드값을 추출하는 함수
 */
async function extractSTTFields(sttContent, formSchema, currentFormData) {
  try {
    console.log('STT 필드 추출 시작:', { sttContent: sttContent.length, formSchema: formSchema.reportType });

    if (!formSchema.sttGenerated) {
      return { success: true, data: {} };
    }

    // sttGenerated 필드들 수집
    const sttFields = {};
    Object.entries(formSchema.sttGenerated).forEach(([groupKey, group]) => {
      Object.entries(group).forEach(([fieldKey, field]) => {
        sttFields[fieldKey] = field;
      });
    });

    if (Object.keys(sttFields).length === 0) {
      return { success: true, data: {} };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here' || apiKey === 'OPENAI_KEY_PLACEHOLDER' || !apiKey.startsWith('sk-')) {
      console.log('⚠️ OpenAI API 키가 설정되지 않음. Mock 데이터 반환.');
      return { success: true, data: {} };
    }

    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // GPT API로 STT 내용 분석
    const prompt = `
상담 내용을 분석하여 다음 양식 필드들의 값을 추출해주세요.

양식: ${formSchema.reportType}

STT 상담 내용:
${sttContent}

추출해야 할 필드들:
${Object.entries(sttFields).map(([key, field]) =>
  `- ${key}: ${field.label} (${field.aiPrompt || '관련 내용 추출'})`
).join('\n')}

현재 입력된 값들:
${Object.entries(currentFormData).map(([key, value]) =>
  `- ${key}: ${value || '(비어있음)'}`
).join('\n')}

지침:
1. STT 내용에서 각 필드에 해당하는 정보를 정확히 추출
2. 이미 입력된 값이 있으면 덮어쓰지 말고 비워둠
3. 정보가 없으면 빈 문자열 반환
4. 공식적인 문체로 변환하여 반환
5. JSON 형태로만 응답 (다른 설명 없이)

응답 형식:
{
  "fieldName1": "추출된 값",
  "fieldName2": "추출된 값",
  ...
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'STT 내용을 분석하여 양식 필드값을 추출하는 전문가입니다. 정확하고 공식적인 문체로 응답합니다.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const content = response.choices[0].message.content.trim();

    try {
      const extractedFields = JSON.parse(content);

      // 빈 값들과 이미 입력된 값들 제거
      const filteredFields = {};
      Object.entries(extractedFields).forEach(([key, value]) => {
        if (value && value.trim() && !currentFormData[key]) {
          filteredFields[key] = value.trim();
        }
      });

      console.log('STT 필드 추출 완료:', filteredFields);
      return { success: true, data: filteredFields };

    } catch (parseError) {
      console.error('STT 필드 추출 JSON 파싱 실패:', parseError);
      return { success: false, error: 'JSON 파싱 실패' };
    }

  } catch (error) {
    console.error('STT 필드 추출 오류:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
    runAiFunction,
    runAIFunc_local,
    runAIFunc_remote,
    runAIFunc_local_file_arg,
    runAIFunc_wav_process,
    runAIFunc_abstract,
    analyzeHWPWithGPT,
    analyzeTestHWP,
    generateReactComponent,
    extractSTTFields
};
