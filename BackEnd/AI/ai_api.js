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

module.exports = {
    runAiFunction,
    runAIFunc_local,
    runAIFunc_remote,
    runAIFunc_local_file_arg,
    runAIFunc_wav_process,
    runAIFunc_abstract
};
