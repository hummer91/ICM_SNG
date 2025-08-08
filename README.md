# ICM SNG 포커 학습 앱

6인 Sit & Go (SNG) 토너먼트에서 ICM (Independent Chip Model) 기반 최적 Push/Fold 전략을 학습할 수 있는 웹 애플리케이션입니다.

## 🚀 빠른 시작

### 전제 조건

- Node.js 18.0.0 이상
- pnpm 8.0.0 이상

### 설치 및 실행

1. pnpm 설치 (아직 설치하지 않은 경우)

```bash
npm install -g pnpm
```

2. 의존성 설치

```bash
pnpm install
```

3. 개발 서버 실행

```bash
pnpm dev
```

4. 브라우저에서 http://localhost:3000 접속

### 시나리오 검증

개발 중 시나리오 데이터 오류를 방지하기 위한 자동 검증 시스템:

```bash
# 개발 모드에서 자동 검증됨
pnpm dev

# 브라우저 콘솔에서 수동 검증
validateScenarios()
```

**검증 항목**:

- ✅ 블라인드 포스팅 규칙 (SB/BB 필수 포스팅)
- ✅ 안테 계산 정확성
- ✅ 스택 일관성 (올인 플레이어 검증)
- ✅ 포지션 로직 (딜러 포지션, 플레이어 수)
- ✅ 팟 계산 무결성
- ✅ ICM 데이터 일관성 (equity 합계, EV 정답 매치)

### 빌드

프로덕션 빌드:

```bash
pnpm build
```

빌드 결과 미리보기:

```bash
pnpm preview
```

## 📁 프로젝트 구조

```
ICM_SNG/
├── index.html              # 메인 진입점
├── src/
│   ├── js/
│   │   ├── main.js        # 앱 초기화
│   │   ├── icm.js         # ICM 계산 엔진 (예정)
│   │   ├── pushfold.js    # Push/Fold 로직 (예정)
│   │   └── ui.js          # UI 컨트롤러 (예정)
│   ├── css/
│   │   ├── main.css       # 메인 스타일 (Linear 디자인 시스템)
│   │   └── components.css # 컴포넌트 스타일
│   └── data/
│       └── ranges.json    # Push/Fold 범위 데이터 (예정)
├── public/
│   └── assets/           # 이미지, 아이콘 등
├── vite.config.js        # Vite 설정
├── package.json          # 프로젝트 설정
└── .npmrc               # pnpm 설정
```

## 🛠️ 기술 스택

- **프론트엔드**: Vanilla JavaScript, HTML5, CSS3
- **빌드 도구**: Vite
- **패키지 매니저**: pnpm
- **디자인 시스템**: Linear.app 기반 다크 테마
- **차트**: Chart.js (예정)

## 🎨 디자인 시스템

Linear.app의 다크 테마를 기반으로 한 모던한 디자인을 적용했습니다:

- 다크 배경 색상 계층
- 보라색 브랜드 컬러 (#5e6ad2)
- 부드러운 애니메이션 전환
- 높은 대비율로 가독성 확보

## 📝 개발 명령어

- `pnpm dev` - 개발 서버 실행 (HMR 지원)
- `pnpm build` - 프로덕션 빌드
- `pnpm preview` - 빌드 결과 미리보기
- `pnpm lint` - ESLint 실행 (예정)
- `pnpm format` - Prettier 포맷팅 (예정)
- `pnpm test` - 테스트 실행 (예정)

## 🔧 환경 설정

Vite는 다음과 같이 설정되어 있습니다:

- 포트 3000에서 개발 서버 실행
- HMR (Hot Module Replacement) 지원
- 경로 별칭 설정 (@, @js, @css 등)
- 구형 브라우저 지원 (legacy plugin)
- 청크 분할 최적화

## 📄 라이선스

MIT License
