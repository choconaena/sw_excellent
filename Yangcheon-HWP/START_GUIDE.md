# 🚀 Yangcheon-HWP 시작 가이드

## 📋 개요

**바이브 코딩(Vibe Coding)** 시스템을 위한 Windows 전용 HWP 처리 서버입니다.
AI 기반 양식 자동화를 위해 다음 두 가지 주요 기능을 제공합니다:

1. **HWP 파싱**: 업로드된 HWP 파일에서 텍스트를 추출하여 GPT 분석용 데이터 제공
2. **HWP 생성**: 템플릿 기반으로 완성된 HWP 문서 자동 생성

## 🎯 시스템 아키텍처

```
Linux 서버 (네이버 클라우드)          Windows 데스크탑 서버
┌─────────────────────────┐         ┌─────────────────────────┐
│  BackEnd Server         │  SSH    │  HWP Processing         │
│  Port: 23000           │ Tunnel  │  Port: 28091           │
│                        │◄────────┤                        │
│  /ai/analyze-hwp       │ 28090   │  /parse (파싱)         │
│  ├─ 파일 업로드        │         │  /generate (생성)      │
│  ├─ HWP 파싱 요청      │         │                        │
│  └─ GPT 분석 실행      │         │  + pyhwpx 라이브러리   │
└─────────────────────────┘         └─────────────────────────┘
```

## 🛠️ 설치 및 설정

### 1. Windows 환경 구성
```bash
# Python 의존성 설치
pip install flask pyhwpx form-data

# 한글 오피스 설치 필수
# HWP 2020 또는 이상 버전 권장
```

### 2. 서버 실행
```bash
# HWP 파싱 서버 실행 (포트 28092)
python hwp_parser_server.py

# 기존 HWP 생성 서버 실행 (포트 28091)
python generate_server.py
```

### 3. SSH 터널 연결
```bash
# Windows에서 Linux 서버로 SSH 터널 연결
# 파싱용: 28092 -> 28090
ssh -N -R 0.0.0.0:28090:127.0.0.1:28092 root@211.188.56.255

# 생성용: 28091 -> 28091 (직접 연결)
# 또는 별도 터널: ssh -N -R 0.0.0.0:28091:127.0.0.1:28091 root@211.188.56.255

# 연결 확인
curl http://localhost:28090/  # 파싱 서버
curl http://localhost:28091/  # 생성 서버
```

## 🔧 새로운 기능: HWP 파싱 서버

### API 엔드포인트

#### 1. 서버 상태 확인
```http
GET /
```

**응답 예시:**
```json
{
  "status": "running",
  "service": "HWP Parser Server",
  "timestamp": "2024-09-21T21:30:00",
  "port": 28091
}
```

#### 2. HWP 파일 파싱
```http
POST /parse
Content-Type: multipart/form-data
```

**요청 필드:**
- `hwpFile`: HWP 파일 (필수)
- `formName`: 양식명 (선택)

**응답 예시:**
```json
{
  "success": true,
  "message": "HWP 파싱 완료",
  "data": {
    "fileName": "business_form.hwp",
    "formName": "사업자등록증신청",
    "extractedText": "사업자등록증 신청서\n\n1. 신청인 정보\n- 성명: [     ]\n...",
    "textLength": 1024,
    "timestamp": "2024-09-21T21:30:00"
  }
}
```

## 🎨 바이브 코딩 완전 워크플로우

### 1. 양식 생성 단계
```
프론트엔드 (/admin/form-generator)
├─ 서식명 입력: "출생신고서"
├─ HWP 파일 업로드: birth_certificate.hwp
└─ [생성하기] 버튼 클릭
```

### 2. 백엔드 분석 과정
```
Linux BackEnd (POST /ai/analyze-hwp)
├─ 1단계: 파일 유효성 검사
├─ 2단계: Windows 서버로 HWP 파싱 요청
│   └─ http://localhost:28090/parse (포트 28092)
├─ 3단계: 추출된 텍스트로 GPT 분석 실행
├─ 4단계: JSON 스키마 생성
│   ├─ directInput: 민원인 직접 입력 필드
│   └─ sttGenerated: AI 자동 생성 필드
├─ 5단계: 템플릿 HWP 파일 저장
│   └─ http://localhost:28090/save-template
└─ 6단계: 프론트엔드로 결과 반환 및 양식 페이지 이동
```

### 3. 동적 양식 작성 단계
```
프론트엔드 (/dynamic-form)
├─ 1단계: 기본 정보 입력 (이름, 생년월일, 주소, 전화번호)
├─ 2단계: 신청 정보 입력 (발급 구분, 수령 방법 등)
├─ 3단계: 전자 서명 입력
│   ├─ 마우스/터치로 캔버스에 서명
│   └─ 서명 데이터 Base64 변환
└─ [HWP 문서 생성] 버튼 클릭
```

### 4. React 컴포넌트 자동 생성 과정 🎨
```
Linux BackEnd (POST /ai/generate-component)
├─ 1단계: 양식 스키마 받아서 GPT API 호출
├─ 2단계: 프롬프트 엔지니어링으로 완전한 React 코드 생성
│   ├─ styled-components 스타일
│   ├─ 3단계 스텝 진행 로직
│   ├─ 필드 검증 및 에러 처리
│   ├─ 캔버스 서명 기능
│   └─ HWP 생성 API 연동
├─ 3단계: 생성된 코드를 실제 파일로 저장
│   ├─ index.jsx (메인 컴포넌트)
│   └─ style.js (스타일드 컴포넌트)
└─ 4단계: 파일 경로 및 메타데이터 반환
```

### 5. HWP 문서 생성 과정
```
Windows 서버 (generate_server.py, 포트 28091)
├─ 1단계: 폼 데이터 수신 (JSON + 서명 이미지)
├─ 2단계: 템플릿 HWP 파일 로드
├─ 3단계: 토큰 치환 (<name>, <address> 등)
├─ 4단계: 서명 이미지 삽입 (<sign> 마커)
├─ 5단계: 완성된 HWP 파일 생성
└─ 6단계: 브라우저로 파일 다운로드 제공
```

### 3. 생성된 JSON 구조 예시
```json
{
  "reportType": "birth_certificate",
  "file_name": "birth_certificate_generated.hwp",
  "directInput": {
    "applicantData": {
      "name": { "type": "text", "label": "신청인 성명", "required": true },
      "address": { "type": "text", "label": "주소", "required": true }
    },
    "signature": {
      "applicantSignature": { "type": "canvas", "label": "신청인 서명", "required": true }
    }
  },
  "sttGenerated": {
    "purposeData": {
      "reason": {
        "type": "textarea",
        "label": "신고 사유",
        "aiPrompt": "상담 내용에서 출생신고 사유를 추출하여 공식 문체로 작성"
      }
    }
  }
}
```

## 🔄 오류 처리

### HWP 파싱 실패 시
```javascript
// Linux 서버에서 자동 Fallback
try {
  // Windows 서버로 HWP 파싱 요청
  const result = await fetch('http://localhost:28090/parse', ...)
} catch (error) {
  // 연결 실패 시 Mock 데이터 사용
  console.warn('HWP 파싱 서버 연결 실패, Mock 데이터 사용')
  hwpContent = generateMockContent(fileName, formName)
}
```

### 자동 재연결 시스템
```bash
# SSH 터널 자동 재연결 스크립트 (권장)
while true; do
  ssh -N -R 0.0.0.0:28090:127.0.0.1:28091 root@211.188.56.255
  echo "연결이 끊어졌습니다. 5초 후 재연결합니다..."
  sleep 5
done
```

## 📊 테스트 방법

### 1. HWP 파싱 테스트
```bash
# Windows 서버에서 직접 테스트
curl -X POST http://localhost:28091/parse \
  -F "hwpFile=@test.hwp" \
  -F "formName=테스트양식"

# Linux 서버에서 SSH 터널 통해 테스트
curl -X POST http://localhost:28090/parse \
  -F "hwpFile=@test.hwp" \
  -F "formName=테스트양식"
```

### 2. 전체 시스템 테스트
```bash
# Linux 서버에서 완전한 워크플로우 테스트
curl -X POST http://localhost:23000/ai/analyze-hwp \
  -F "hwpFile=@business_form.hwp" \
  -F "formName=사업자등록증신청"
```

## 📝 개발 노트

### 핵심 함수들

**hwp_parser_server.py:**
- `extract_hwp_text()`: HWP 파일에서 텍스트 추출
- `parse_hwp()`: Flask 엔드포인트, 파일 업로드 처리
- `health_check()`: 서버 상태 확인

**generate_server.py:**
- `build_replacements()`: JSON 데이터를 HWP 토큰으로 변환
- `insert_sign_image()`: 전자서명 이미지 삽입
- `flatten_json()`: 중첩 JSON 구조 평탄화

### 보안 고려사항
- SSH 키 기반 인증 사용
- 임시 파일 자동 정리
- 파일 크기 제한 (10MB)
- 안전한 파일명 처리

## 🚨 문제 해결

### 자주 발생하는 오류

1. **"pyhwpx 모듈을 찾을 수 없음"**
   ```bash
   pip install pyhwpx
   # 또는 한글 오피스 재설치
   ```

2. **"HWP 프로세스 오류"**
   ```bash
   # 한글 오피스 프로세스 종료 후 재시도
   taskkill /f /im Hwp.exe
   ```

3. **"SSH 터널 연결 실패"**
   ```bash
   # 방화벽 설정 확인
   # SSH 키 권한 확인
   chmod 600 ~/.ssh/id_rsa
   ```

4. **"28090 포트 접근 불가"**
   ```bash
   # 포트 사용 확인
   netstat -an | grep 28090
   # SSH 터널 재연결
   ```

## 🎨 **진짜 바이브 코딩 완성!**

### React 컴포넌트 자동 생성 결과

GPT API를 통해 자동 생성되는 완전한 React 코드:

```javascript
// 자동 생성된 컴포넌트 구조
테스트양식Form/
├── index.jsx     // 메인 컴포넌트 (3단계 스텝, 검증, 서명)
└── style.js      // styled-components 스타일

// 특징:
✅ 3단계 스텝 진행 UI
✅ 필드별 타입 자동 매칭
✅ 필수 필드 검증 로직
✅ 캔버스 서명 기능
✅ HWP 생성 API 연동
✅ 에러 처리 및 다운로드
```

### 완전한 자동화 달성 🚀

1. **HWP 업로드** → **텍스트 추출** (Windows 서버)
2. **GPT 분석** → **JSON 스키마 생성** (Linux 서버)
3. **React 코드 생성** → **완전한 컴포넌트** (GPT API)
4. **파일 저장** → **라우팅 준비** (백엔드)
5. **사용자 작성** → **HWP 다운로드** (완성!)

### 파일 저장 위치

```bash
# 생성된 React 컴포넌트
/new_data/sw_excellent/BackEnd/generated-components/
├── 사업자등록증신청/
│   ├── index.jsx
│   └── style.js
├── 출생신고서/
│   ├── index.jsx
│   └── style.js
└── ... (무제한 양식 추가 가능)

# 템플릿 HWP 파일
/new_data/sw_excellent/Yangcheon-HWP/templates/
├── 사업자등록증신청.hwp
├── 출생신고서.hwp
└── ... (자동 저장)
```

---

**🎉 이제 진짜로 바이브 코딩이 완성되었습니다!**

어떤 HWP 양식이든 → 몇 분 안에 → 완전한 React 양식으로 자동 변환! ✨