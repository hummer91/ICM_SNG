# Backend Project

Node.js + Express + TypeScript 백엔드 프로젝트

## 기술 스택

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Code Quality**: ESLint, Prettier
- **Testing**: Jest
- **Development**: Nodemon, ts-node

## 프로젝트 구조

```
src/
├── controllers/     # 컨트롤러 (요청 처리)
├── middleware/      # 미들웨어 (에러 핸들링, 인증 등)
├── routes/         # 라우터 (API 경로 정의)
├── services/       # 서비스 (비즈니스 로직)
├── models/         # 모델 (데이터 구조)
├── types/          # TypeScript 타입 정의
├── utils/          # 유틸리티 함수
├── config/         # 설정 파일
└── server.ts       # 서버 진입점
```

## 설치 및 실행

### 의존성 설치
```bash
npm install
```

### 환경 변수 설정
```bash
cp .env.example .env
# .env 파일을 편집하여 필요한 환경 변수를 설정하세요
```

### 개발 서버 실행
```bash
npm run dev
```

### 프로덕션 빌드
```bash
npm run build
npm start
```

## 사용 가능한 스크립트

- `npm run dev` - 개발 서버 실행 (nodemon + ts-node)
- `npm run build` - TypeScript 컴파일
- `npm run start` - 프로덕션 서버 실행
- `npm run lint` - ESLint 검사
- `npm run lint:fix` - ESLint 자동 수정
- `npm run format` - Prettier 포맷팅
- `npm run format:check` - Prettier 포맷팅 체크
- `npm run test` - Jest 테스트 실행
- `npm run test:watch` - Jest 테스트 감시 모드

## API 엔드포인트

### 기본 정보
- `GET /health` - 헬스 체크
- `GET /api` - API 정보

### 사용자 관리
- `GET /api/users` - 사용자 목록 조회
- `GET /api/users/:id` - 특정 사용자 조회
- `POST /api/users` - 사용자 생성
- `PUT /api/users/:id` - 사용자 수정
- `DELETE /api/users/:id` - 사용자 삭제

## API 응답 형식

```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

에러 시:
```json
{
  "success": false,
  "error": {
    "message": "Error message"
  }
}
```

## 개발 가이드

### 새로운 API 추가

1. `src/types/` 에서 타입 정의
2. `src/services/` 에서 비즈니스 로직 구현
3. `src/controllers/` 에서 컨트롤러 구현
4. `src/routes/` 에서 라우터 등록
5. `src/routes/index.ts` 에서 메인 라우터에 추가

### 코드 품질

프로젝트는 다음과 같은 코드 품질 도구를 사용합니다:

- **ESLint**: 코드 스타일 및 잠재적 오류 검사
- **Prettier**: 코드 포맷팅
- **TypeScript**: 타입 안전성

커밋 전에 다음 명령어를 실행하여 코드 품질을 확인하세요:
```bash
npm run lint
npm run format:check
npm run build
```

## 라이센스

MIT