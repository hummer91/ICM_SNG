# SNG ICM PUSH/FOLD 결정 웹앱 프로젝트 플랜

## 프로젝트 개요
6인 SNG(Sit & Go) 게임에서 ICM(Independent Chip Model)을 기반으로 특정 상황에서 PUSH/FOLD 결정을 도와주는 웹앱

## 핵심 요구사항 명세

### 1. 기능적 요구사항

#### 1.1 ICM 계산 요구사항
- **ICM 공식**: `ICM_i = Σ(P(j) * Prize(j))` where P(j) is probability of finishing in position j
- **정확도**: 계산 결과의 수학적 정확성 99.9% 이상 보장
- **지원 게임**: 6인 SNG 고정 (확장 가능성 고려)
- **입력 데이터**: 각 플레이어의 칩 스택, 현재 핸드, 포지션

#### 1.2 PUSH/FOLD 결정 요구사항
- **결정 기준**: ICM 기반 기대값 비교
- **임계값**: PUSH 기대값 > FOLD 기대값일 때 PUSH 권장
- **신뢰도**: 결정의 신뢰도 표시 (높음/중간/낮음)

#### 1.3 Monte Carlo 시뮬레이션 요구사항
- **시뮬레이션 횟수**: 최소 10,000회 (정확도 95% 신뢰구간)
- **랜덤 시드**: 재현 가능한 결과를 위한 시드 설정
- **병렬 처리**: CPU 코어 활용한 병렬 시뮬레이션

### 2. 성능 요구사항

#### 2.1 응답 시간
- **ICM 계산**: 500ms 이내
- **PUSH/FOLD 결정**: 1초 이내
- **Monte Carlo 시뮬레이션**: 5초 이내 (10,000회)
- **페이지 로딩**: 2초 이내

#### 2.2 동시 사용자
- **동시 사용자**: 100명 이상 지원
- **서버 리소스**: CPU 80% 이하, 메모리 8GB 이하

#### 2.3 브라우저 성능
- **메모리 사용량**: 512MB 이하
- **CPU 사용량**: 30% 이하
- **네트워크**: 3G 환경에서도 사용 가능

### 3. 사용자 경험 요구사항

#### 3.1 사용자 시나리오
**시나리오 1: 토너먼트 중 빠른 결정**
- 사용자: 경험있는 포커 플레이어
- 상황: 블라인드가 높아진 상황에서 빠른 결정 필요
- 목표: 30초 이내에 정확한 PUSH/FOLD 결정
- 입력: 칩 스택, 현재 핸드, 포지션
- 출력: 명확한 PUSH/FOLD 권장사항

**시나리오 2: 학습 및 분석**
- 사용자: 포커 학습자
- 상황: 게임 후 분석 및 학습
- 목표: ICM 개념 이해 및 결정 과정 학습
- 입력: 다양한 게임 상황
- 출력: 상세한 계산 과정 및 시각화

#### 3.2 UI/UX 요구사항
- **직관성**: 포커 플레이어가 익숙한 용어와 인터페이스
- **반응성**: 실시간 피드백 제공
- **접근성**: WCAG 2.1 AA 준수
- **모바일**: 모바일 우선 반응형 디자인

### 4. 기술적 제약사항

#### 4.1 지원 환경
- **브라우저**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **모바일**: iOS 14+, Android 10+
- **네트워크**: 3G 이상 (최소 1Mbps)
- **화면 해상도**: 320px 이상 (모바일), 1024px 이상 (데스크톱)

#### 4.2 보안 요구사항
- **입력 검증**: 모든 사용자 입력 검증
- **XSS 방지**: 사용자 입력의 안전한 처리
- **CSRF 방지**: 토큰 기반 CSRF 방지
- **데이터 보호**: 개인정보 수집 금지

### 5. 검증 방법

#### 5.1 ICM 계산 검증
- **수학적 검증**: 알려진 ICM 계산 예제와 비교
- **경계값 테스트**: 극단적인 칩 스택 분포 테스트
- **정확도 테스트**: 99.9% 정확도 달성 확인

#### 5.2 성능 검증
- **부하 테스트**: 100명 동시 사용자 시뮬레이션
- **스트레스 테스트**: 최대 부하 상황에서의 안정성
- **메모리 누수 테스트**: 장시간 사용 시 메모리 사용량

#### 5.3 사용성 검증
- **사용자 테스트**: 실제 포커 플레이어 10명 대상 테스트
- **접근성 테스트**: 스크린 리더 및 키보드 네비게이션 테스트
- **모바일 테스트**: 다양한 모바일 기기에서의 사용성

## 기술 스택

### 프론트엔드
- **HTML5* + **JavaScript** (ES6 - 간단하고 빠른 개발
- **CSS3* (스타일링) - 모던한 디자인과 반응형 레이아웃
- **Chart.js** (ICM 계산 결과 시각화) - 직관적인 차트 표시
- **Vanilla JavaScript** (DOM 조작) - 가벼운 프론트엔드 구현
- **Fetch API** (HTTP 클라이언트) - 네이티브 API 통신

### 백엔드
- **Node.js** + **Express** (TypeScript) - 빠른 개발과 확장성
- **Monte Carlo Simulation** (ICM 계산) - 정확한 확률 계산
- **Poker Hand Evaluator** (핸드 랭킹) - 정확한 핸드 평가
- **Redis** (캐싱) - 계산 결과 캐싱으로 성능 향상
- **Jest** (테스팅) - 단위 및 통합 테스트

## 프로젝트 구조

```
sng-icm-app/
├── frontend/
│   ├── index.html
│   ├── css/
│   │   ├── style.css
│   │   └── responsive.css
│   ├── js/
│   │   ├── app.js
│   │   ├── gameSetup.js
│   │   ├── handSelector.js
│   │   ├── icmCalculator.js
│   │   ├── results.js
│   │   ├── utils.js
│   │   └── api.js
│   ├── assets/
│   │   └── cards/ (카드 이미지)
│   └── lib/
│       └── chart.js
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── icmController.ts
│   │   │   └── simulationController.ts
│   │   ├── services/
│   │   │   ├── icmService.ts
│   │   │   ├── monteCarloService.ts
│   │   │   ├── pokerHandService.ts
│   │   │   └── cacheService.ts
│   │   ├── middleware/
│   │   │   ├── validation.ts
│   │   │   └── errorHandler.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── mathUtils.ts
│   │   └── app.ts
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   └── package.json
├── docs/
│   ├── api.md
│   ├── deployment.md
│   └── testing.md
└── README.md
```

## 개발 단계

### Phase 1: 프로젝트 설정 및 기본 구조 (Week 1)
1. **프로젝트 초기화**
   - Frontend React 프로젝트 생성 (TypeScript)
   - Backend Node.js 프로젝트 생성 (TypeScript)
   - 개발 환경 설정 (ESLint, Prettier, Husky)
   - CI/CD 파이프라인 설정

2. **기본 타입 정의**
   - `Player` 인터페이스 (칩 스택, 포지션)
   - `GameState` 인터페이스 (게임 상태)
   - `ICMCalculation` 인터페이스 (계산 결과)
   - `SimulationResult` 인터페이스 (시뮬레이션 결과)

3. **검증 시스템 구축**
   - 입력 검증 미들웨어
   - 에러 핸들링 시스템
   - 로깅 시스템

### Phase 2: 백엔드 핵심 기능 개발 (Week 2)
1. **ICM 계산 서비스**
   - 정확한 ICM 공식 구현
   - 포지션별 승률 계산
   - 칩 스택별 가치 계산
   - 캐싱 시스템 구현

2. **Monte Carlo 시뮬레이션**
   - 랜덤 핸드 생성 (시드 기반)
   - 병렬 처리 구현
   - 대량 시뮬레이션 실행
   - 결과 통계 계산

3. **포커 핸드 평가**
   - 핸드 랭킹 시스템
   - 핸드 vs 핸드 승률 계산
   - 성능 최적화

4. **API 엔드포인트**
   - `/api/icm/calculate` - ICM 계산
   - `/api/simulation/run` - 시뮬레이션 실행
   - `/api/hand/evaluate` - 핸드 평가
   - `/api/health` - 헬스 체크

### Phase 3: 프론트엔드 UI 개발 (Week 3)
1. **게임 설정 컴포넌트**
   - 플레이어 수 입력 (6인 고정)
   - 각 플레이어 칩 스택 입력 (실시간 검증)
   - 포지션 설정 (드래그 앤 드롭)
   - 입력 데이터 검증

2. **핸드 선택 컴포넌트**
   - 카드 선택 인터페이스 (시각적 카드)
   - 핸드 표시 (텍스트 + 시각적)
   - 포지션 표시
   - 핸드 유효성 검사

3. **결과 표시 컴포넌트**
   - PUSH/FOLD 결정 표시 (색상 코딩)
   - ICM 계산 결과 (차트)
   - 승률 표시 (퍼센트)
   - 신뢰도 표시

### Phase 4: 고급 기능 및 최적화 (Week 4)
1. **성능 최적화**
   - 계산 결과 캐싱
   - 컴포넌트 메모이제이션
   - 번들 크기 최적화
   - 이미지 최적화

2. **사용자 경험 개선**
   - 반응형 디자인 완성
   - 로딩 상태 표시
   - 에러 처리 개선
   - 접근성 향상

3. **추가 기능**
   - 게임 히스토리 저장 (로컬 스토리지)
   - 다양한 SNG 구조 지원 준비
   - 실시간 업데이트

### Phase 5: 테스트 및 배포 (Week 5)
1. **종합 테스트**
   - 단위 테스트 (Jest)
   - 통합 테스트
   - 성능 테스트
   - 사용성 테스트

2. **배포 준비**
   - 프로덕션 환경 설정
   - 모니터링 시스템 구축
   - 백업 시스템 설정

3. **런칭**
   - 프로덕션 배포
   - 사용자 피드백 수집
   - 성능 모니터링

## 핵심 알고리즘

### ICM 계산
```typescript
interface ICMCalculation {
  playerStacks: number[];
  positions: number[];
  playerHand: string;
  pushFoldDecision: 'PUSH' | 'FOLD';
  expectedValue: number;
  winProbability: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

// ICM 공식 구현
function calculateICM(stacks: number[], prizes: number[]): number[] {
  // ICM 계산 로직
  // P(j) = 각 플레이어가 j위에 올 확률
  // ICM_i = Σ(P(j) * Prize(j))
}
```

### Monte Carlo 시뮬레이션
1. 현재 게임 상태에서 랜덤 핸드 생성 (시드 기반)
2. 각 플레이어의 핸드 강도 계산
3. 승자 결정 및 칩 분배
4. 10,000회 이상 반복하여 통계 생성
5. 신뢰구간 계산

### PUSH/FOLD 결정 로직
1. 현재 핸드의 강도 평가
2. ICM 기반 기대값 계산
3. PUSH와 FOLD의 기대값 비교
4. 임계값 기반 결정
5. 신뢰도 계산

## API 설계

### POST /api/icm/calculate
```typescript
Request:
{
  playerStacks: number[]; // [1000, 1500, 2000, 1200, 800, 500]
  positions: number[]; // [1, 2, 3, 4, 5, 6]
  playerHand: string; // "AhKs"
  playerPosition: number; // 1
}

Response:
{
  pushFoldDecision: 'PUSH' | 'FOLD';
  expectedValue: number;
  winProbability: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  icmValues: number[];
  calculationTime: number;
}
```

### POST /api/simulation/run
```typescript
Request:
{
  playerStacks: number[];
  positions: number[];
  iterations: number; // 기본값: 10000
  seed?: number; // 선택사항
}

Response:
{
  results: SimulationResult[];
  statistics: {
    pushWinRate: number;
    foldWinRate: number;
    averageICM: number;
    confidenceInterval: [number, number];
  };
  executionTime: number;
}
```

### GET /api/health
```typescript
Response:
{
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
  };
}
```

## 성능 지표

### 기술적 지표
- **응답 시간**: ICM 계산 500ms, 시뮬레이션 5초 이내
- **정확도**: ICM 계산 99.9% 이상
- **가용성**: 99.9% 이상
- **동시 사용자**: 100명 이상 지원

### 사용자 경험 지표
- **사용성**: 직관적인 인터페이스 (사용자 테스트 4.5/5.0 이상)
- **접근성**: WCAG 2.1 AA 준수
- **반응성**: 실시간 피드백 제공
- **안정성**: 에러 없는 사용 경험

### 비즈니스 지표
- **사용자 만족도**: 4.5/5.0 이상
- **재사용률**: 80% 이상
- **추천률**: 70% 이상

## 리스크 관리

### 고위험 항목
1. **ICM 계산 복잡성**: 수학적 정확성 보장 필요
   - 대응: 수학 전문가 검토, 단위 테스트 강화
2. **성능 이슈**: 대량 시뮬레이션 성능 최적화 필요
   - 대응: 병렬 처리, 캐싱 시스템 구현
3. **사용자 경험**: 직관적인 UI/UX 설계 중요
   - 대응: 사용자 테스트, 반복적 개선

### 중위험 항목
1. **API 연동**: 프론트엔드-백엔드 통신 안정성
   - 대응: 에러 핸들링, 재시도 로직
2. **브라우저 호환성**: 다양한 브라우저 지원
   - 대응: 폴리필, 크로스 브라우저 테스트
3. **모바일 최적화**: 반응형 디자인 완성도
   - 대응: 모바일 우선 설계, 터치 인터페이스

### 저위험 항목
1. **배포 환경**: 클라우드 서비스 활용
   - 대응: 자동화된 배포 파이프라인
2. **문서화**: 체계적인 문서 관리
   - 대응: 자동 문서 생성, 버전 관리
3. **테스트**: 자동화된 테스트 시스템
   - 대응: CI/CD 파이프라인 통합

## 개발 일정

- **Week 1**: 프로젝트 설정 및 기본 구조
- **Week 2**: 백엔드 ICM 계산 및 Monte Carlo 시뮬레이션
- **Week 3**: 프론트엔드 기본 UI 및 API 연동
- **Week 4**: 고급 기능 및 최적화
- **Week 5**: 테스트 및 배포

## 성공 지표

1. **정확성**: ICM 계산의 수학적 정확성 99.9% 이상
2. **성능**: 1초 이내 응답 시간 (시뮬레이션 제외)
3. **사용성**: 직관적인 UI/UX (사용자 테스트 통과)
4. **확장성**: 다양한 SNG 구조 지원 가능
5. **안정성**: 99.9% 가용성 달성

## 기술적 도전 과제

1. **ICM 계산 복잡성**: 6인 게임의 모든 가능한 시나리오 계산
2. **Monte Carlo 최적화**: 대량 시뮬레이션의 성능 최적화
3. **실시간 계산**: 사용자 입력에 따른 즉시 결과 제공
4. **정확한 핸드 평가**: 포커 핸드 랭킹 시스템 구현
5. **사용자 경험**: 포커 플레이어가 익숙한 인터페이스 제공