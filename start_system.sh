#!/bin/bash

# 🏛️ 양천구청 바이브 코딩 시스템 - 전체 시스템 시작 스크립트
# 사용법: ./start_system.sh [옵션]

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# 함수 정의
print_header() {
    echo -e "${PURPLE}$1${NC}"
}

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

# 도움말 표시
show_help() {
    echo "🏛️ 양천구청 바이브 코딩 시스템 - 전체 시스템 시작"
    echo ""
    echo "사용법: $0 [옵션]"
    echo ""
    echo "옵션:"
    echo "  --backend-only     백엔드만 시작"
    echo "  --frontend-only    프론트엔드만 시작"
    echo "  --skip-build       프론트엔드 빌드 생략"
    echo "  --help            이 도움말 표시"
    echo ""
    echo "이 스크립트는 다음을 수행합니다:"
    echo "1. 백엔드 서비스 시작 (PM2)"
    echo "2. 프론트엔드 빌드 및 배포 (Docker)"
    echo "3. 서비스 상태 확인"
    exit 0
}

# 파라미터 처리
BACKEND_ONLY=false
FRONTEND_ONLY=false
SKIP_BUILD=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --backend-only)
            BACKEND_ONLY=true
            shift
            ;;
        --frontend-only)
            FRONTEND_ONLY=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --help)
            show_help
            ;;
        *)
            print_error "알 수 없는 옵션: $1. --help로 도움말을 확인하세요."
            ;;
    esac
done

# 시작 메시지
clear
print_header "████████████████████████████████████████████████████████"
print_header "█                                                      █"
print_header "█    🏛️  양천구청 바이브 코딩 시스템 - 전체 시작        █"
print_header "█                                                      █"
print_header "█    AI 기반 HWP 양식 자동화 및 상담 시스템             █"
print_header "█                                                      █"
print_header "████████████████████████████████████████████████████████"
echo ""

# 현재 디렉토리 확인
if [[ ! -d "BackEnd" ]] || [[ ! -d "Yangcheon-FE" ]]; then
    print_error "sw_excellent 프로젝트 루트 디렉토리에서 실행하세요."
fi

# 시작 시간 기록
START_TIME=$(date +%s)

echo "🚀 시스템 시작 프로세스를 시작합니다..."
echo "시작 시간: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 1. 백엔드 서비스 시작
if [[ "$FRONTEND_ONLY" != "true" ]]; then
    print_header "════════════════════════════════════════════════════════"
    print_header "📦 1단계: 백엔드 서비스 시작"
    print_header "════════════════════════════════════════════════════════"
    echo ""

    if [[ ! -f "BackEnd/pm2_start/start_all.sh" ]]; then
        print_error "백엔드 시작 스크립트를 찾을 수 없습니다: BackEnd/pm2_start/start_all.sh"
    fi

    cd BackEnd/pm2_start
    ./start_all.sh || print_error "백엔드 서비스 시작 실패"
    cd ../..

    print_success "백엔드 서비스 시작 완료"
    echo ""
fi

# 2. 프론트엔드 빌드 및 배포
if [[ "$BACKEND_ONLY" != "true" ]]; then
    print_header "════════════════════════════════════════════════════════"
    print_header "🌐 2단계: 프론트엔드 빌드 및 배포"
    print_header "════════════════════════════════════════════════════════"
    echo ""

    if [[ ! -f "Yangcheon-FE/deploy.sh" ]]; then
        print_error "프론트엔드 배포 스크립트를 찾을 수 없습니다: Yangcheon-FE/deploy.sh"
    fi

    cd Yangcheon-FE

    # 빌드 옵션 설정
    DEPLOY_ARGS=""
    if [[ "$SKIP_BUILD" == "true" ]]; then
        DEPLOY_ARGS="--skip-build"
    fi

    ./deploy.sh $DEPLOY_ARGS || print_error "프론트엔드 배포 실패"
    cd ..

    print_success "프론트엔드 배포 완료"
    echo ""
fi

# 3. 전체 시스템 상태 확인
print_header "════════════════════════════════════════════════════════"
print_header "🔍 3단계: 전체 시스템 상태 확인"
print_header "════════════════════════════════════════════════════════"
echo ""

# 백엔드 상태 확인
if [[ "$FRONTEND_ONLY" != "true" ]]; then
    print_step "백엔드 서비스 상태"
    if command -v pm2 &> /dev/null; then
        pm2 status 2>/dev/null || print_warning "PM2 상태 확인 실패"
    else
        print_warning "PM2가 설치되지 않음"
    fi
    echo ""
fi

# 프론트엔드 상태 확인
if [[ "$BACKEND_ONLY" != "true" ]]; then
    print_step "프론트엔드 컨테이너 상태"
    if command -v docker &> /dev/null; then
        docker ps | grep yangcheon || print_warning "프론트엔드 컨테이너를 찾을 수 없음"
    else
        print_warning "Docker가 설치되지 않음"
    fi
    echo ""
fi

# 포트 상태 확인
print_step "포트 사용 현황"
important_ports=(23000 20443 28080 28443)
for port in "${important_ports[@]}"; do
    if command -v lsof &> /dev/null && lsof -i :$port > /dev/null 2>&1; then
        print_success "포트 $port: 사용 중 ✓"
    else
        print_warning "포트 $port: 사용되지 않음"
    fi
done
echo ""

# 서비스 접속 테스트
print_step "서비스 접속 테스트"

# 백엔드 API 테스트
if [[ "$FRONTEND_ONLY" != "true" ]]; then
    if curl -s -I http://localhost:23000/ai/ | grep -q "200 OK"; then
        print_success "백엔드 API: 정상 ✓"
    else
        print_warning "백엔드 API: 접속 불가"
    fi
fi

# 프론트엔드 웹사이트 테스트
if [[ "$BACKEND_ONLY" != "true" ]]; then
    if curl -s -k -I https://localhost:28443/ | grep -q "200"; then
        print_success "프론트엔드 웹사이트: 정상 ✓"
    else
        print_warning "프론트엔드 웹사이트: 접속 불가"
    fi
fi

# 완료 시간 계산
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

# 최종 완료 메시지
echo ""
print_header "████████████████████████████████████████████████████████"
print_header "█                                                      █"
print_header "█               🎉 시스템 시작 완료! 🎉                █"
print_header "█                                                      █"
print_header "████████████████████████████████████████████████████████"
echo ""

echo "📊 시스템 정보:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ "$FRONTEND_ONLY" != "true" ]]; then
    echo "🔗 백엔드 서비스:"
    echo "   • API 서버: http://localhost:23000"
    echo "   • HTTPS API: https://localhost:20443"
    echo "   • 양식 관리: http://localhost:23000/forms"
    echo "   • AI 분석: http://localhost:23000/ai/analyze-hwp"
    echo ""
fi

if [[ "$BACKEND_ONLY" != "true" ]]; then
    echo "🌐 프론트엔드 서비스:"
    echo "   • 메인 사이트: https://yangcheon.ai.kr:28443"
    echo "   • 관리자: https://yangcheon.ai.kr:28443/admin"
    echo "   • 양식 생성기: https://yangcheon.ai.kr:28443/admin/form-generator"
    echo ""
fi

echo "🔧 관리 명령어:"
echo "   • 전체 상태: pm2 status && docker ps"
echo "   • 백엔드 재시작: pm2 restart all"
echo "   • 프론트엔드 재시작: docker restart yangcheon-fe-test"
echo "   • 전체 중지: pm2 stop all && docker stop yangcheon-fe-test"
echo ""

echo "⏱️  소요 시간: ${MINUTES}분 ${SECONDS}초"
echo "🕐 완료 시간: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

print_success "양천구청 바이브 코딩 시스템이 성공적으로 시작되었습니다! 🚀"
print_success "이제 https://yangcheon.ai.kr:28443 에서 서비스를 이용하실 수 있습니다."

echo ""
echo "📞 추가 지원이 필요하시면 README.md를 참조하세요."