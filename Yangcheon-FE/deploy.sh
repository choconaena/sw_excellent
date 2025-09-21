#!/bin/bash

# 🚀 양천구청 프론트엔드 자동 배포 스크립트
# 사용법: ./deploy.sh [옵션]
# 옵션:
#   --skip-build    빌드 생략 (이미 빌드된 dist 사용)
#   --no-cache      Docker 캐시 없이 빌드
#   --help          도움말 표시

set -e  # 오류 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 설정 변수
CONTAINER_NAME="yangcheon-fe-test"
IMAGE_NAME="yangcheon-fe-web:test"
WEB_PORT="28080"
HTTPS_PORT="28443"

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

# 도움말 표시
show_help() {
    echo "🏛️ 양천구청 프론트엔드 자동 배포 스크립트"
    echo ""
    echo "사용법: $0 [옵션]"
    echo ""
    echo "옵션:"
    echo "  --skip-build    빌드 생략 (이미 빌드된 dist 사용)"
    echo "  --no-cache      Docker 캐시 없이 빌드"
    echo "  --help          이 도움말 표시"
    echo ""
    echo "예시:"
    echo "  $0                    # 전체 빌드 및 배포"
    echo "  $0 --skip-build       # 빌드 생략하고 배포만"
    echo "  $0 --no-cache         # 캐시 없이 새로 빌드"
    exit 0
}

# 파라미터 처리
SKIP_BUILD=false
NO_CACHE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --no-cache)
            NO_CACHE=true
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
echo "🏛️ 양천구청 바이브 코딩 시스템 - 프론트엔드 배포"
echo "=================================================="
echo ""

# 1. 현재 디렉토리 확인
if [[ ! -f "package.json" ]]; then
    print_error "package.json을 찾을 수 없습니다. Yangcheon-FE 디렉토리에서 실행하세요."
fi

# 2. 기존 컨테이너 상태 확인
print_step "기존 컨테이너 상태 확인"
if docker ps -a | grep -q "$CONTAINER_NAME"; then
    print_warning "기존 컨테이너 발견: $CONTAINER_NAME"

    # 실행 중인 컨테이너 중지
    if docker ps | grep -q "$CONTAINER_NAME"; then
        print_step "실행 중인 컨테이너 중지: $CONTAINER_NAME"
        docker stop "$CONTAINER_NAME" || print_warning "컨테이너 중지 실패"
    fi

    # 기존 컨테이너 제거
    print_step "기존 컨테이너 제거: $CONTAINER_NAME"
    docker rm "$CONTAINER_NAME" || print_warning "컨테이너 제거 실패"
else
    print_success "기존 컨테이너 없음"
fi

# 3. 의존성 설치
print_step "Node.js 의존성 설치"
if [[ ! -d "node_modules" ]] || [[ "package.json" -nt "node_modules" ]]; then
    npm install || print_error "npm install 실패"
    print_success "의존성 설치 완료"
else
    print_success "의존성이 이미 최신 상태"
fi

# 4. 프론트엔드 빌드
if [[ "$SKIP_BUILD" == "false" ]]; then
    print_step "React 앱 빌드 (프로덕션)"

    # 이전 빌드 결과 정리
    if [[ -d "dist" ]]; then
        rm -rf dist
        print_success "기존 빌드 파일 정리 완료"
    fi

    # 새 빌드 실행
    npm run build || print_error "빌드 실패"

    # 빌드 결과 확인
    if [[ ! -d "dist" ]] || [[ ! -f "dist/index.html" ]]; then
        print_error "빌드 결과물(dist)을 찾을 수 없습니다"
    fi

    print_success "React 앱 빌드 완료"
else
    print_warning "빌드 생략됨 (--skip-build 옵션)"
    if [[ ! -d "dist" ]]; then
        print_error "dist 디렉토리가 없습니다. --skip-build 없이 다시 실행하세요."
    fi
fi

# 5. Docker 이미지 빌드
print_step "Docker 이미지 빌드: $IMAGE_NAME"

# Docker 빌드 옵션 설정
DOCKER_BUILD_ARGS=""
if [[ "$NO_CACHE" == "true" ]]; then
    DOCKER_BUILD_ARGS="--no-cache"
    print_warning "캐시 없이 빌드 (--no-cache 옵션)"
fi

# Dockerfile 존재 확인
if [[ ! -f "Dockerfile" ]]; then
    print_error "Dockerfile을 찾을 수 없습니다"
fi

# Docker 이미지 빌드
docker build $DOCKER_BUILD_ARGS -t "$IMAGE_NAME" . || print_error "Docker 이미지 빌드 실패"
print_success "Docker 이미지 빌드 완료"

# 6. 필수 파일 존재 확인
print_step "배포 파일 확인"

required_files=(
    "deploy/nginx.conf"
    "certbot-etc"
)

for file in "${required_files[@]}"; do
    if [[ ! -e "$file" ]]; then
        print_error "필수 파일이 없습니다: $file"
    fi
done

print_success "배포 파일 확인 완료"

# 7. Docker 컨테이너 실행
print_step "Docker 컨테이너 실행: $CONTAINER_NAME"

docker run -d \
    --name "$CONTAINER_NAME" \
    -p "${WEB_PORT}:20080" \
    -p "${HTTPS_PORT}:28443" \
    -v "$(pwd)/deploy/nginx.conf:/etc/nginx/conf.d/default.conf:ro" \
    -v "$(pwd)/certbot-etc:/etc/letsencrypt:ro" \
    "$IMAGE_NAME" || print_error "컨테이너 실행 실패"

print_success "컨테이너 실행 완료"

# 8. 서비스 상태 확인
print_step "서비스 상태 확인"

# 컨테이너가 실행 중인지 확인
sleep 3
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    print_error "컨테이너가 실행되지 않았습니다. 로그를 확인하세요: docker logs $CONTAINER_NAME"
fi

# 포트 바인딩 확인
if ! docker port "$CONTAINER_NAME" | grep -q "$HTTPS_PORT"; then
    print_error "포트 바인딩 실패: $HTTPS_PORT"
fi

print_success "서비스 상태 정상"

# 9. 접속 테스트 (선택적)
print_step "접속 테스트"

# localhost 테스트
if curl -s -k -I "https://localhost:$HTTPS_PORT" > /dev/null; then
    print_success "로컬 접속 테스트 성공"
else
    print_warning "로컬 접속 테스트 실패 (서비스는 정상일 수 있음)"
fi

# 10. 배포 완료 메시지
echo ""
echo "🎉 배포 완료!"
echo "=================================================="
echo ""
echo "📍 접속 정보:"
echo "   • 메인 사이트: https://yangcheon.ai.kr:$HTTPS_PORT"
echo "   • 관리자 페이지: https://yangcheon.ai.kr:$HTTPS_PORT/admin"
echo "   • 양식 생성기: https://yangcheon.ai.kr:$HTTPS_PORT/admin/form-generator"
echo ""
echo "🔧 관리 명령어:"
echo "   • 컨테이너 상태: docker ps | grep $CONTAINER_NAME"
echo "   • 로그 확인: docker logs $CONTAINER_NAME"
echo "   • 컨테이너 중지: docker stop $CONTAINER_NAME"
echo "   • 컨테이너 재시작: docker restart $CONTAINER_NAME"
echo ""
echo "📊 포트 정보:"
echo "   • HTTP: $WEB_PORT"
echo "   • HTTPS: $HTTPS_PORT"
echo ""

# 실행 시간 표시
if command -v date >/dev/null 2>&1; then
    echo "⏰ 배포 완료 시간: $(date '+%Y-%m-%d %H:%M:%S')"
fi

echo ""
print_success "배포 스크립트 실행 완료! 🚀"