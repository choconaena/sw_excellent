# Yangcheon-FE

AI 기반 양천구 민원 상담 웹 서비스 프론트엔드 레포입니다.  
정보공개청구, 건설기계조종사면허(재)발급 등 다양한 민원 절차를 쉽게 진행할 수 있는 UI를 제공합니다.

---

## 🛠 실행 방법

```bash
# 1. 레포지토리 클론
git clone https://github.com/SAFE-HI/Yangcheon-FE.git
cd Yangcheon-FE

# 2. 패키지 설치
npm install

# 3. 개발 서버 실행
npm run dev
```


## 📌 주요 기술 스택
- React 19
- React Router DOM 7
- Styled Components
- Vite
- ESLint


## 📁 폴더 구조
```bash
src/
├── components/       # 재사용 컴포넌트
├── pages/            # 라우팅되는 페이지
├── hooks/            # 커스텀 훅
├── layouts/          # 공통 레이아웃
├── styles/           # 전역 및 모듈 스타일
├── router/           # 라우터 설정
└── main.jsx          # 앱 엔트리 포인트
```


## 🌿 브랜치 전략
기본 브랜치: main

기능 개발 브랜치: feature/*
예) feature/construction-license-ui

PR(Pull Request)을 통해 main 브랜치에 병합합니다.
