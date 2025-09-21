# HWP 문서 생성기

한글(HWP) 문서 템플릿에 JSON 데이터를 치환하여 자동으로 문서를 생성하는 Flask 기반 웹 서비스입니다.

## 주요 기능

- JSON 데이터를 기반으로 HWP 템플릿 자동 치환
- 서명 이미지 자동 삽입 (최대 2개)
- 조건부 체크박스 처리
- 날짜 자동 삽입
- 완성된 HWP 파일 다운로드

## 지원 문서 유형

현재 지원되는 템플릿:
- `construction_machinery_license.hwp` - 건설기계면허 관련 문서
- `information_open.hwp` - 정보공개 관련 문서

## 시스템 요구사항

⚠️ **중요**: 이 서비스는 **Windows 환경에서만 실행 가능**합니다.
- Windows OS
- Python 3.7+
- 한글 오피스 (HWP) 설치 필요
- pyhwpx 라이브러리

## 설치 및 설정

### 1. 의존성 설치
```bash
pip install flask pyhwpx
```

### 2. 디렉토리 구조
```
scripts/
├── clear.py            # 마커 정리 모듈
├── templates/          # HWP 템플릿 파일
│   ├── construction_machinery_license.hwp
│   └── information_open.hwp
└── output/             # 생성된 파일 저장 (자동 생성)
    └── signs/          # 업로드된 서명 이미지 저장
```

## 원격 서버 연결

이 서비스는 Windows 데스크톱 서버에서 실행되며, 네이버 클라우드 서버와 SSH 터널을 통해 연결됩니다.

### SSH 터널 설정
Windows 데스크톱 서버에서 다음 명령어를 실행하여 네이버 서버와 연결:

```bash
ssh -N -R 0.0.0.0:8090:127.0.0.1:8091 root@211.188.56.255
```

이 명령어는:
- 네이버 서버의 8090 포트를 Windows 서버의 8091 포트로 포워딩
- 외부에서 네이버 서버의 8090 포트로 접근 시 Windows 서버의 Flask 애플리케이션으로 전달

## API 사용법

### 엔드포인트
```
POST /
```

### 요청 형식
- Content-Type: `multipart/form-data`
- 필수 필드:
  - `data`: JSON 문자열 형태의 폼 데이터
  - `images` (선택): 서명 이미지 파일 (최대 2개)

### JSON 데이터 구조 예시

#### 건설기계면허 문서
```json
{
  "reportType": "construction_machinery_license",
  "file_name": "construction_license.hwp",
  "items": {
    "applicantInfo": {
      "name": "홍길동",
      "birthDate": "1990-01-01",
      "address": "서울시 강남구"
    },
    "feeData": {
      "exemptionType": "exempt"
    },
    "isreissue": false,
    "reissueReason": ""
  }
}
```

#### 정보공개 문서
```json
{
  "reportType": "information_open",
  "file_name": "info_open.hwp",
  "items": {
    "requesterInfo": {
      "name": "김철수",
      "contact": "010-1234-5678"
    },
    "requestDetails": {
      "subject": "공개 요청 제목",
      "content": "상세 내용"
    }
  }
}
```

### 응답
- 성공 시: 생성된 HWP 파일 다운로드
- 실패 시: JSON 에러 메시지

## 데이터 치환 규칙

### 1. 기본 치환
JSON의 중첩 구조를 점(.) 표기법으로 평탄화하여 템플릿의 `<키>` 마커와 치환

예시:
```json
{
  "applicantInfo": {
    "name": "홍길동"
  }
}
```
→ `<applicantInfo.name>` 마커가 "홍길동"으로 치환

### 2. 배열 처리
배열의 각 요소는 인덱스 번호로 접근:
```json
{
  "checkList": [true, false, true]
}
```
→ `<checkList.0>`: "√", `<checkList.1>`: " ", `<checkList.2>`: "√"

### 3. 조건부 처리
특정 필드에 대해 조건부 체크박스 처리:
- `feeData.exemptionType`: "exempt"이면 첫 번째 체크, 아니면 두 번째 체크
- `isreissue`: true/false에 따른 체크박스 처리

### 4. 자동 날짜 삽입
현재 날짜가 자동으로 삽입:
- `<YYYY>`: 연도 (4자리)
- `<MM>`: 월 (2자리)
- `<DD>`: 일 (2자리)

## 서명 이미지 처리

### 지원 형식
- PNG, JPG, JPEG 등 일반적인 이미지 형식

### 마커
- `<sign>`: 첫 번째 서명 이미지 위치
- `<sign2>`: 두 번째 서명 이미지 위치

### 이미지 설정
- 기본 크기: 27.6mm × 12.6mm
- 텍스트 뒤에 배치
- 이미지가 없는 마커는 자동으로 제거

## 에러 처리

일반적인 에러 케이스:
- `Missing data field`: JSON 데이터가 없음
- `Invalid JSON format`: 잘못된 JSON 형식
- `Missing reportType or items`: 필수 필드 누락
- 템플릿 파일이 존재하지 않음
- HWP 프로세스 관련 오류

## 개발 참고사항

### 주요 함수
- `flatten_json()`: JSON 구조 평탄화
- `build_replacements()`: 치환 딕셔너리 생성
- `insert_sign_image()`: 서명 이미지 삽입
- `clear_leftover_markers()`: 사용되지 않은 마커 정리

### HWP 조작
pyhwpx 라이브러리를 사용하여 HWP 파일 조작:
- 텍스트 치환
- 이미지 삽입
- 개체 속성 조정
