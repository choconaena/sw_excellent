# 1) 빌드 스테이지
FROM node:20-alpine AS build
WORKDIR /app

# 패키지 메타 먼저 복사 → 캐시 활용
COPY package*.json ./
# CI 환경이면 npm ci 권장(재현성)
RUN npm ci

# 소스 복사 & 빌드
COPY . .
# Vite 기준; CRA면 npm run build 동일
RUN npm run build

# 2) 런타임 스테이지
FROM nginx:1.27-alpine
# Nginx 설정 교체
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# Vite면 dist, CRA면 build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 20080
EXPOSE 28443

# 간단 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://localhost:20080/healthz || exit 1