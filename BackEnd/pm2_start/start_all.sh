#!/bin/bash

# 🚀 양천구청 백엔드 서비스 일괄 시작 스크립트
# 사용법: ./start_all.sh [옵션]

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 함수 정의
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 시작 메시지
echo "🏛️ 양천구청 바이브 코딩 시스템 - 백엔드 서비스 시작"
echo "======================================================"
echo ""

# 1. PM2 설치 확인
print_step "PM2 설치 확인"
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2가 설치되지 않았습니다. 설치 중..."
    npm install -g pm2 || print_error "PM2 설치 실패"
    print_success "PM2 설치 완료"
else
    print_success "PM2가 이미 설치되어 있습니다"
fi

# 2. 작업 디렉토리 확인
if [[ ! -f "../MainServer.js" ]]; then
    print_error "MainServer.js를 찾을 수 없습니다. BackEnd/pm2_start 디렉토리에서 실행하세요."
fi

# 3. Node.js 의존성 설치
print_step "Node.js 의존성 확인"
cd ..
if [[ ! -d "node_modules" ]] || [[ "package.json" -nt "node_modules" ]]; then
    npm install || print_error "npm install 실패"
    print_success "의존성 설치 완료"
else
    print_success "의존성이 이미 최신 상태"
fi

# 4. 환경 변수 확인
print_step "환경 변수 확인"
if [[ ! -f ".env" ]]; then
    print_warning ".env 파일이 없습니다. 기본값으로 생성..."
    cat > .env << EOF
# OpenAI API 키 (실제 키로 교체 필요)
OPENAI_API_KEY=your_openai_api_key_here

# 서버 설정
NODE_ENV=production
PORT=23000
HTTPS_PORT=20443
EOF
    print_warning ".env 파일이 생성되었습니다. OPENAI_API_KEY를 실제 키로 변경하세요!"
else
    print_success ".env 파일 존재 확인"
fi

# 5. SSL 인증서 확인
print_step "SSL 인증서 확인"
if [[ ! -f "keys/privkey.pem" ]] || [[ ! -f "keys/fullchain.pem" ]]; then
    print_warning "SSL 인증서가 없습니다. HTTPS 서버는 시작되지 않을 수 있습니다."
    print_warning "인증서를 keys/ 디렉토리에 배치하세요."
else
    print_success "SSL 인증서 확인 완료"
fi

# 6. 기존 PM2 프로세스 정리
print_step "기존 PM2 프로세스 확인"
pm2 delete all 2>/dev/null || print_success "기존 프로세스 없음"

# 7. 메인 서버 시작
print_step "메인 API 서버 시작"
pm2 start MainServer.js --name "MainServer_test" || print_error "메인 서버 시작 실패"
print_success "메인 서버 시작 완료"

# 8. WebSocket 서버들 시작
print_step "WebSocket 서버들 시작"

# HTTP WebSocket 서버
if [[ -f "WS/ws_server.js" ]]; then
    pm2 start WS/ws_server.js --name "ws_server_test" || print_warning "HTTP WebSocket 서버 시작 실패"
    print_success "HTTP WebSocket 서버 시작"
fi

# HTTPS WebSocket 서버
if [[ -f "WS/ws_server_https.js" ]]; then
    pm2 start WS/ws_server_https.js --name "ws_server_https_test" || print_warning "HTTPS WebSocket 서버 시작 실패"
    print_success "HTTPS WebSocket 서버 시작"
fi

# 9. PM2 설정 저장
print_step "PM2 설정 저장"
pm2 save || print_warning "PM2 설정 저장 실패"
pm2 startup || print_warning "PM2 자동 시작 설정 실패"

# 10. 서비스 상태 확인
print_step "서비스 상태 확인"
sleep 3

echo ""
pm2 status
echo ""

# 11. 포트 확인
print_step "포트 상태 확인"

ports_to_check=(23000 20443)
for port in "${ports_to_check[@]}"; do
    if lsof -i :$port > /dev/null 2>&1; then
        print_success "포트 $port: 사용 중 ✓"
    else
        print_warning "포트 $port: 사용되지 않음"
    fi
done

# 12. API 테스트
print_step "API 접속 테스트"

# HTTP API 테스트
if curl -s -I http://localhost:23000/ai/ | grep -q "200 OK"; then
    print_success "HTTP API 테스트 성공"
else
    print_warning "HTTP API 테스트 실패"
fi

# HTTPS API 테스트 (인증서가 있는 경우)
if [[ -f "keys/privkey.pem" ]]; then
    if curl -s -k -I https://localhost:20443/ai/ | grep -q "200 OK"; then
        print_success "HTTPS API 테스트 성공"
    else
        print_warning "HTTPS API 테스트 실패"
    fi
fi

# 완료 메시지
echo ""
echo "🎉 백엔드 서비스 시작 완료!"
echo "=================================================="
echo ""
echo "📍 서비스 정보:"
echo "   • 메인 API: http://localhost:23000"
echo "   • HTTPS API: https://localhost:20443"
echo "   • 양식 API: http://localhost:23000/forms"
echo "   • AI 분석 API: http://localhost:23000/ai/analyze-hwp"
echo ""
echo "🔧 관리 명령어:"
echo "   • 상태 확인: pm2 status"
echo "   • 로그 확인: pm2 logs"
echo "   • 서비스 재시작: pm2 restart all"
echo "   • 서비스 중지: pm2 stop all"
echo "   • 서비스 삭제: pm2 delete all"
echo ""
echo "📊 실행 중인 프로세스:"
pm2 list
echo ""

print_success "백엔드 서비스 시작 스크립트 완료! 🚀"