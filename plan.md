# SNG ICM PUSH/FOLD 결정 웹앱 프로젝트 플랜

## 프로젝트 개요
6인 SNG(Sit & Go) 게임에서 ICM(Independent Chip Model)을 기반으로 특정 상황에서 PUSH/FOLD 결정을 도와주는 웹앱

## 기술 스택

### 프론트엔드
- **React** (TypeScript)
- **Tailwind CSS** (스타일링)
- **Chart.js** (ICM 계산 결과 시각화)
- **React Hook Form** (폼 관리)

### 백엔드
- **Node.js** + **Express** (TypeScript)
- **Monte Carlo Simulation** (ICM 계산)
- **Poker Hand Evaluator** (핸드 랭킹)

## 프로젝트 구조

```
sng-icm-app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GameSetup.tsx
│   │   │   ├── PlayerInput.tsx
│   │   │   ├── HandSelector.tsx
│   │   │   ├── ICMCalculator.tsx
│   │   │   ├── PushFoldDecision.tsx
│   │   │   └── Results.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── pokerUtils.ts
│   │   └── App.tsx
│   ├── package.json
│   └── tailwind.config.js
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── icmController.ts
│   │   │   └── simulationController.ts
│   │   ├── services/
│   │   │   ├── icmService.ts
│   │   │   ├── monteCarloService.ts
│   │   │   └── pokerHandService.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── app.ts
│   └── package.json
└── README.md
```

## 개발 단계

### Phase 1: 프로젝트 설정 및 기본 구조
1. **프로젝트 초기화**
   - Frontend React 프로젝트 생성
   - Backend Node.js 프로젝트 생성
   - TypeScript 설정
   - Tailwind CSS 설정

2. **기본 타입 정의**
   - Player 인터페이스
   - GameState 인터페이스
   - ICM 계산 결과 타입

### Phase 2: 백엔드 핵심 기능 개발
1. **ICM 계산 서비스**
   - ICM 공식 구현
   - 포지션별 승률 계산
   - 칩 스택별 가치 계산

2. **Monte Carlo 시뮬레이션**
   - 랜덤 핸드 생성
   - 대량 시뮬레이션 실행
   - 승률 통계 계산

3. **포커 핸드 평가**
   - 핸드 랭킹 시스템
   - 핸드 vs 핸드 승률 계산

4. **API 엔드포인트**
   - `/api/icm/calculate` - ICM 계산
   - `/api/simulation/run` - 시뮬레이션 실행
   - `/api/hand/evaluate` - 핸드 평가

### Phase 3: 프론트엔드 UI 개발
1. **게임 설정 컴포넌트**
   - 플레이어 수 입력 (6인 고정)
   - 각 플레이어 칩 스택 입력
   - 포지션 설정

2. **핸드 선택 컴포넌트**
   - 카드 선택 인터페이스
   - 핸드 표시
   - 포지션 표시

3. **결과 표시 컴포넌트**
   - PUSH/FOLD 결정 표시
   - ICM 계산 결과
   - 승률 차트

### Phase 4: 고급 기능
1. **ICM 계산 최적화**
   - 캐싱 시스템
   - 병렬 처리
   - 메모리 최적화

2. **사용자 경험 개선**
   - 반응형 디자인
   - 로딩 상태 표시
   - 에러 처리

3. **추가 기능**
   - 게임 히스토리 저장
   - 다양한 SNG 구조 지원
   - 실시간 업데이트

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
}
```

### Monte Carlo 시뮬레이션
1. 현재 게임 상태에서 랜덤 핸드 생성
2. 각 플레이어의 핸드 강도 계산
3. 승자 결정 및 칩 분배
4. 10,000회 이상 반복하여 통계 생성

### PUSH/FOLD 결정 로직
1. 현재 핸드의 강도 평가
2. ICM 기반 기대값 계산
3. PUSH와 FOLD의 기대값 비교
4. 임계값 기반 결정

## API 설계

### POST /api/icm/calculate
```typescript
Request:
{
  playerStacks: number[];
  positions: number[];
  playerHand: string;
  playerPosition: number;
}

Response:
{
  pushFoldDecision: 'PUSH' | 'FOLD';
  expectedValue: number;
  winProbability: number;
  icmValues: number[];
}
```

### POST /api/simulation/run
```typescript
Request:
{
  playerStacks: number[];
  positions: number[];
  iterations: number;
}

Response:
{
  results: SimulationResult[];
  statistics: {
    pushWinRate: number;
    foldWinRate: number;
    averageICM: number;
  };
}
```

## 개발 일정

- **Week 1**: 프로젝트 설정 및 기본 구조
- **Week 2**: 백엔드 ICM 계산 및 Monte Carlo 시뮬레이션
- **Week 3**: 프론트엔드 기본 UI 및 API 연동
- **Week 4**: 고급 기능 및 최적화
- **Week 5**: 테스트 및 버그 수정

## 성공 지표

1. **정확성**: ICM 계산의 수학적 정확성
2. **성능**: 1초 이내 응답 시간
3. **사용성**: 직관적인 UI/UX
4. **확장성**: 다양한 SNG 구조 지원 가능

## 기술적 도전 과제

1. **ICM 계산 복잡성**: 6인 게임의 모든 가능한 시나리오 계산
2. **Monte Carlo 최적화**: 대량 시뮬레이션의 성능 최적화
3. **실시간 계산**: 사용자 입력에 따른 즉시 결과 제공
4. **정확한 핸드 평가**: 포커 핸드 랭킹 시스템 구현