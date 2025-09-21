# 🏛️ 양천구청 바이브 코딩 시스템

AI 기반 HWP 양식 자동화 및 상담 시스템

## 📋 목차

- [📖 프로젝트 개요](#-프로젝트-개요)
- [🏗️ 시스템 구조](#️-시스템-구조)
- [⚙️ 설치 및 실행](#️-설치-및-실행)
- [🚀 빠른 시작](#-빠른-시작)
- [📁 디렉토리 구조](#-디렉토리-구조)
- [🔧 개발 가이드](#-개발-가이드)
- [📱 사용법](#-사용법)
- [🐛 문제 해결](#-문제-해결)

## 📖 프로젝트 개요

**바이브 코딩**은 양천구청을 위한 AI 기반 양식 자동화 시스템입니다:

- 📄 **HWP 양식 자동 분석**: GPT API로 HWP 파일을 분석하여 입력 필드를 자동 추출
- 🎤 **STT 상담 연동**: 음성 상담 내용을 텍스트로 변환하여 양식에 자동 입력
- 📱 **태블릿 연동**: 민원인이 태블릿에서 직접 입력하고 서명
- 🤖 **React 컴포넌트 자동 생성**: 분석된 양식을 바탕으로 자동으로 UI 생성
- 📋 **정보공개청구, 건설기계조종사면허** 등 기본 양식 지원

## 🏗️ 시스템 구조

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web (상담원)   │    │  Tablet (민원인) │    │   BackEnd API   │
│                │    │                │    │                │
│ - 양식 생성기    │◄──►│ - 정보 입력     │◄──►│ - HWP 분석      │
│ - STT 상담      │    │ - 전자 서명     │    │ - AI 처리       │
│ - 진행 관리     │    │ - 실시간 동기화  │    │ - 데이터 저장    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   WebSocket     │
                    │   실시간 통신    │
                    └─────────────────┘
```

### 주요 컴포넌트

- **Yangcheon-FE**: React 기반 프론트엔드 (웹 + 태블릿)
- **BackEnd**: Node.js Express API 서버
- **Yangcheon-HWP**: Python HWP 파싱 서버
- **AI**: GPT 기반 양식 분석 모듈
- **WebSocket**: 실시간 상담원-민원인 연동

## ⚙️ 설치 및 실행

### 📋 사전 요구사항

- **Node.js** 18+
- **Python** 3.8+
- **Docker** & **Docker Compose**
- **nginx**
- **PM2** (프로세스 관리)
- **SSL 인증서** (Let's Encrypt)

### 🔧 환경 설정

1. **환경 변수 설정**
```bash
# BackEnd/.env 파일 생성
OPENAI_API_KEY=your_openai_api_key_here
```

2. **SSL 인증서 준비**
```bash
# BackEnd/keys/ 디렉토리에 인증서 배치
./keys/privkey.pem
./keys/fullchain.pem
```

## 🚀 빠른 시작

### 1단계: 백엔드 서비스 시작

```bash
cd BackEnd
npm install

# PM2로 백엔드 서비스들 시작
./pm2_start/start_all.sh
```

### 2단계: 프론트엔드 빌드 및 배포

```bash
cd Yangcheon-FE

# 자동 배포 스크립트 실행 (권장)
./deploy.sh

# 또는 수동 실행
npm install
npm run build
docker build -t yangcheon-fe-web:test .
docker stop yangcheon-fe-test
docker rm yangcheon-fe-test
docker run -d --name yangcheon-fe-test \
  -p 28080:20080 -p 28443:28443 \
  -v $(pwd)/deploy/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  -v $(pwd)/certbot-etc:/etc/letsencrypt:ro \
  yangcheon-fe-web:test
```

### 3단계: 접속 확인

- **메인 사이트**: https://yangcheon.ai.kr:28443
- **관리자 페이지**: https://yangcheon.ai.kr:28443/admin
- **양식 생성기**: https://yangcheon.ai.kr:28443/admin/form-generator

## 📁 디렉토리 구조

```
sw_excellent/
├── 📁 BackEnd/                 # Node.js API 서버
│   ├── 📁 AI/                 # GPT 기반 양식 분석
│   ├── 📁 database/           # 양식 데이터베이스
│   ├── 📁 URIProcess/         # API 라우팅
│   ├── 📁 WS/                 # WebSocket 서버
│   ├── 📁 pm2_start/          # PM2 시작 스크립트
│   └── 📄 MainServer.js       # 메인 서버
│
├── 📁 Yangcheon-FE/           # React 프론트엔드
│   ├── 📁 src/pages/web/      # 웹 (상담원) 화면
│   ├── 📁 src/pages/tablet/   # 태블릿 (민원인) 화면
│   ├── 📁 deploy/             # 배포 설정
│   └── 📄 deploy.sh           # 자동 배포 스크립트
│
├── 📁 Yangcheon-HWP/          # Python HWP 파싱
│   ├── 📄 hwp_parser_server.py # HWP 파싱 서버
│   └── 📄 generate_server_test.py # HWP 생성 서버
│
└── 📄 README.md               # 이 파일
```

## 🔧 개발 가이드

### 🎯 새로운 양식 추가

1. **HWP 파일 준비**
   - 태깅 형식: `<applicantData.name>`, `<YYYY>`, `<MM>`, `<DD>`
   - 서명 위치: `<sign>` 태그

2. **양식 생성기 사용**
   ```
   https://yangcheon.ai.kr:28443/admin/form-generator
   → HWP 파일 업로드
   → 양식명 입력
   → "양식 생성" 클릭
   ```

3. **자동 생성되는 것들**
   - JSON 스키마 (필드 정의)
   - React 컴포넌트
   - 태블릿 연동 코드
   - API 엔드포인트

### 🔄 개발 워크플로우

1. **프론트엔드 수정 시**
```bash
cd Yangcheon-FE
npm run dev        # 개발 서버 (localhost:5173)
npm run build      # 프로덕션 빌드
./deploy.sh        # 자동 배포
```

2. **백엔드 수정 시**
```bash
cd BackEnd
pm2 restart MainServer    # 서버 재시작
pm2 logs MainServer       # 로그 확인
```

3. **WebSocket 서버 재시작**
```bash
cd BackEnd
pm2 restart ws_server
pm2 restart ws_server_https
```

## 📱 사용법

### 👨‍💼 상담원 (웹 화면)

1. **로그인**: https://yangcheon.ai.kr:28443
2. **상담 시작**:
   - 정보공개청구 → `/consultation?flow=info-request&step=1`
   - 건설기계조종사면허 → `/construction-equipment-operator?step=1`
   - 동적 양식 → 생성한 양식 선택
3. **진행 관리**: STT 녹음, 태블릿 연동, 문서 생성

### 📱 민원인 (태블릿 화면)

1. **자동 이동**: 상담원이 단계 진행 시 자동으로 화면 전환
2. **정보 입력**:
   - 신청인 정보 (이름, 생년월일, 주소, 전화번호 등)
   - 신청 내용 (발급 구분, 수령 방법 등)
3. **전자 서명**: 태블릿에 직접 손가락으로 서명
4. **완료**: HWP 문서 자동 생성 및 다운로드

### 🎤 STT 상담 연동

1. **음성 녹음**: 상담원이 "녹음 시작" 버튼 클릭
2. **AI 분석**: 상담 내용을 텍스트로 변환
3. **자동 입력**:
   - 신청 사유 자동 생성
   - 사용 목적 자동 생성
   - 추가 정보 추출

## 🐛 문제 해결

### 🔌 서버 접속 문제

```bash
# 서버 상태 확인
pm2 status

# 포트 확인
lsof -i :23000    # 백엔드 API
lsof -i :28443    # 프론트엔드

# 서비스 재시작
pm2 restart all
docker restart yangcheon-fe-test
```

### 🌐 Mixed Content 오류

**문제**: HTTPS 페이지에서 HTTP 리소스 요청
**해결**: 브라우저에서 "안전하지 않은 콘텐츠" 허용

1. 주소창 자물쇠 아이콘 클릭
2. "사이트 설정" → "안전하지 않은 콘텐츠" → "허용"

### 📄 HWP 파싱 오류

```bash
# HWP 파서 서버 확인
cd Yangcheon-HWP
python hwp_parser_server.py

# Windows 데스크탑에서 SSH 터널 확인
ssh -L 28091:localhost:28091 user@server
```

### 🗃️ 데이터베이스 초기화

```bash
cd BackEnd/database
# 양식 데이터 백업
cp generated_forms.json generated_forms.json.backup

# 기본 양식으로 초기화 (주의!)
# rm generated_forms.json
```

## 📞 지원

- **개발팀**: claude-code@anthropic.com
- **문서 업데이트**: 2025-09-22
- **버전**: v2.0.0

---

## ⚡ 빠른 명령어 모음

```bash
# 전체 시스템 시작
cd BackEnd && ./pm2_start/start_all.sh
cd ../Yangcheon-FE && ./deploy.sh

# 상태 확인
pm2 status
docker ps
curl -I https://yangcheon.ai.kr:28443

# 로그 확인
pm2 logs MainServer
docker logs yangcheon-fe-test

# 재시작
pm2 restart all
docker restart yangcheon-fe-test
```

🎉 **바이브 코딩 시스템이 성공적으로 실행되면 양천구 민원 서비스가 시작됩니다!**