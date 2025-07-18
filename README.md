# Backend Project

Node.js + Express + TypeScript 백엔드 프로젝트

## 🚀 빠른 시작

### 사전 요구사항

- Node.js 18+
- Docker & Docker Compose
- Git

### 개발 환경 설정

1. **저장소 클론**
```bash
git clone <repository-url>
cd backend-project
```

2. **환경 변수 설정**
```bash
cp .env.example .env
# .env 파일을 편집하여 필요한 환경 변수를 설정하세요
```

3. **Docker를 사용한 개발 환경 시작**
```bash
# 방법 1: 스크립트 사용
npm run docker:dev

# 방법 2: 직접 실행
docker-compose up -d
```

4. **로컬 개발 환경 시작**
```bash
npm install
npm run dev
```

## 🐳 Docker 환경

### 개발 환경
```bash
# 개발 환경 시작
npm run docker:dev

# 또는 직접 실행
docker-compose up -d

# 로그 확인
npm run docker:logs

# 컨테이너 중지
npm run docker:down
```

### 프로덕션 환경
```bash
# 프로덕션 환경 시작
npm run docker:prod

# 또는 직접 실행
docker-compose -f docker-compose.prod.yml up -d
```

## 📁 프로젝트 구조

```
├── src/
│   ├── controllers/     # 컨트롤러
│   ├── middleware/      # 미들웨어
│   ├── routes/          # 라우트
│   ├── services/        # 비즈니스 로직
│   ├── types/           # TypeScript 타입 정의
│   ├── utils/           # 유틸리티 함수
│   └── server.ts        # 서버 진입점
├── config/
│   └── environment.ts   # 환경 설정
├── docker/
│   ├── nginx/           # Nginx 설정
│   └── postgres/        # PostgreSQL 설정
├── scripts/
│   ├── dev.sh           # 개발 환경 스크립트
│   └── prod.sh          # 프로덕션 환경 스크립트
├── Dockerfile           # Docker 이미지 정의
├── docker-compose.yml   # 개발 환경 Docker Compose
├── docker-compose.prod.yml # 프로덕션 환경 Docker Compose
└── .env.example         # 환경 변수 예시
```

## 🔧 사용 가능한 스크립트

### 개발 스크립트
```bash
npm run dev              # 개발 서버 시작
npm run build            # TypeScript 빌드
npm run build:watch      # TypeScript 빌드 (감시 모드)
npm run lint             # ESLint 검사
npm run lint:fix         # ESLint 자동 수정
npm run format           # Prettier 포맷팅
npm run test             # 테스트 실행
npm run test:watch       # 테스트 실행 (감시 모드)
```

### Docker 스크립트
```bash
npm run docker:dev       # 개발 환경 시작
npm run docker:prod      # 프로덕션 환경 시작
npm run docker:build     # Docker 이미지 빌드
npm run docker:up        # 컨테이너 시작
npm run docker:down      # 컨테이너 중지
npm run docker:logs      # 로그 확인
npm run docker:clean     # 컨테이너 및 이미지 정리
```

### 데이터베이스 스크립트
```bash
npm run db:migrate       # 데이터베이스 마이그레이션
npm run db:seed          # 데이터베이스 시드 데이터
```

## 🌐 서비스 접속 정보

### 개발 환경
- **애플리케이션**: http://localhost:3000
- **API**: http://localhost:3000/api
- **헬스 체크**: http://localhost:3000/health
- **pgAdmin**: http://localhost:5050
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### 프로덕션 환경
- **애플리케이션**: http://localhost
- **API**: http://localhost/api
- **헬스 체크**: http://localhost/health

## 🔒 환경 변수

주요 환경 변수들:

```bash
# 서버 설정
NODE_ENV=development
PORT=3000
HOST=localhost

# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp_dev
DB_USER=postgres
DB_PASSWORD=password

# JWT 설정
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Redis 설정
REDIS_HOST=localhost
REDIS_PORT=6379

# CORS 설정
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

## 🧪 테스트

```bash
# 모든 테스트 실행
npm test

# 테스트 감시 모드
npm run test:watch

# 커버리지 포함 테스트
npm run test -- --coverage
```

## 📝 코드 품질

```bash
# 린트 검사
npm run lint

# 린트 자동 수정
npm run lint:fix

# 코드 포맷팅
npm run format

# 포맷팅 검사
npm run format:check
```

## 🚀 배포

### Docker를 사용한 배포

1. **프로덕션 환경 변수 설정**
```bash
cp .env.example .env.production
# .env.production 파일을 편집하여 프로덕션 환경 변수를 설정
```

2. **프로덕션 환경 시작**
```bash
npm run docker:prod
```

### 수동 배포

1. **빌드**
```bash
npm run build
```

2. **프로덕션 서버에서 실행**
```bash
NODE_ENV=production npm start
```

## 🔧 문제 해결

### 일반적인 문제들

1. **포트 충돌**
   - 다른 서비스가 3000번 포트를 사용 중인 경우 `.env` 파일에서 `PORT`를 변경

2. **Docker 권한 문제**
   ```bash
   sudo usermod -aG docker $USER
   # 로그아웃 후 다시 로그인
   ```

3. **데이터베이스 연결 실패**
   - PostgreSQL 컨테이너가 완전히 시작될 때까지 기다리세요
   - 환경 변수가 올바르게 설정되었는지 확인

4. **메모리 부족**
   ```bash
   # Docker 리소스 정리
   npm run docker:clean
   ```

## 📚 추가 문서

- [API 문서](./docs/api.md)
- [데이터베이스 스키마](./docs/database.md)
- [배포 가이드](./docs/deployment.md)

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.