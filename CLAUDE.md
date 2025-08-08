# 6인 SNG ICM 포커 학습 앱

## 프로젝트 개요
6인 Sit & Go (SNG) 토너먼트에서 ICM (Independent Chip Model) 기반 최적 전략을 **퀴즈 형태로 학습**할 수 있는 교육용 웹 애플리케이션입니다. 미리 정의된 시나리오를 제시하고, 사용자의 Push/Fold 결정에 대해 즉시 피드백과 해설을 제공합니다.

## 핵심 기능
1. **퀴즈 기반 학습**: 다양한 SNG 상황을 시나리오로 제시하고 Push/Fold 결정 평가
2. **ICM 계산 엔진**: 각 시나리오의 토너먼트 equity와 최적 전략 계산
3. **즉시 피드백**: 사용자 답변에 대한 정답/오답과 상세한 해설 제공
4. **학습 진도 추적**: 정답률, 취약 포지션, 개선 영역 분석
5. **시나리오 데이터베이스**: 초보자부터 고급자까지 단계별 학습 시나리오

## 기술 스택
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **빌드 도구**: Vite
- **패키지 매니저**: pnpm
- **테스트**: Vitest, Testing Library, Playwright
- **코드 품질**: ESLint, Prettier, Husky
- **모니터링**: Sentry, PostHog/Amplitude
- **서버**: Apache/Nginx (리눅스 서버)

## 프로젝트 구조
```
ICM_SNG/
├── index.html              # 메인 진입점
├── components.html         # 컴포넌트 데모 페이지
├── src/
│   ├── js/
│   │   ├── main.js        # 앱 초기화 및 메인 로직
│   │   ├── icm.js         # ICM 계산 엔진
│   │   ├── pushfold.js    # Push/Fold 차트 로직
│   │   ├── ui.js          # UI 컨트롤러
│   │   └── components/    # Linear Design System 컴포넌트
│   │       ├── index.js   # 컴포넌트 중앙 관리
│   │       ├── Theme.js   # 테마 및 디자인 토큰
│   │       ├── Button.js  # 버튼 컴포넌트
│   │       ├── Input.js   # 입력 필드 컴포넌트
│   │       ├── Card.js    # 카드 컴포넌트
│   │       ├── Modal.js   # 모달 컴포넌트
│   │       └── Toast.js   # 토스트 알림 컴포넌트
│   ├── css/
│   │   ├── main.css       # 메인 스타일 (Linear 디자인 시스템)
│   │   ├── components.css # 컴포넌트 스타일
│   │   └── demo.css       # 데모 페이지 스타일
│   └── data/
│       └── ranges.json    # Push/Fold 범위 데이터
├── public/
│   └── assets/           # 이미지, 아이콘 등
├── linear_app.json        # Linear 디자인 시스템 정의
└── package.json
```

## ICM 계산 로직

### 1. 토너먼트 Equity 계산
```javascript
// 각 플레이어의 상금 기대값 계산
// Prize pool: [50%, 30%, 20%] for 1st, 2nd, 3rd
function calculateICM(stacks) {
  // 각 플레이어가 1위, 2위, 3위할 확률 계산
  // Malmuth-Harville 공식 사용
}
```

### 2. 시나리오 구성 요소
- **포지션**: BTN, SB, BB, UTG, MP, CO (미리 설정됨)
- **스택 분포**: 각 플레이어의 칩 수량 (시나리오별 고정값)
- **이전 액션**: Fold, Call, Raise (시나리오에 포함)
- **버블 팩터**: 상금 구조와 현재 상황 (시나리오별 설정)
- **플레이어 핸드**: 제시되는 홀카드 (시나리오별)

### 3. Nash Equilibrium 범위
- 각 상황별 최적 push/fold 범위 사전 계산
- 실시간 조정 가능한 파라미터

## 사용자 인터페이스

### 퀴즈 모드 화면 구성
1. **시나리오 표시**: 현재 상황 설명 및 플레이어 홀카드
2. **테이블 뷰**: 6인 테이블과 각 플레이어 스택 (시나리오별 고정값)
3. **액션 히스토리**: 현재 핸드까지의 액션 기록 (시나리오 일부)
4. **선택지**: Push 또는 Fold 버튼
5. **학습 패널**: ICM Equity 정보와 현재 상황 분석

### 학습 컨트롤
- **새 시나리오** 버튼: 다음 학습 문제로 이동
- **정답 확인** 버튼: 선택 후 해설과 피드백 표시
- **난이도 선택**: 초보자/중급자/고급자 시나리오
- **진도 표시**: 현재까지의 정답률과 학습 진행률


## 개발 가이드라인

### Linear Design System 사용 규칙 (필수)
이 프로젝트는 Linear.app의 디자인 시스템을 기반으로 합니다. **모든 UI 구현 시 반드시 아래 규칙을 따라야 합니다:**

#### 1. 컴포넌트 사용 원칙
- **절대 규칙**: 새로운 UI 요소를 만들 때 항상 `/src/js/components/` 디렉토리의 컴포넌트를 우선 사용
- HTML 요소를 직접 생성하는 대신 컴포넌트 클래스 사용
- 커스텀 스타일링이 필요한 경우에도 기존 컴포넌트를 확장

#### 2. 필수 사용 컴포넌트
```javascript
// ❌ 잘못된 예시 - 직접 HTML 생성
const button = document.createElement('button');
button.className = 'my-button';
button.textContent = 'Click me';

// ✅ 올바른 예시 - Button 컴포넌트 사용
import { Button } from './components/Button.js';
const button = Button.create({
    text: 'Click me',
    variant: 'primary',
    onClick: () => console.log('clicked')
});
```

#### 3. 디자인 토큰 사용
- 색상: Theme.colors 객체의 값만 사용 (하드코딩 금지)
- 스페이싱: Theme.spacing 값 사용 (4px 단위)
- 애니메이션: Theme.animation 설정 준수

#### 4. 컴포넌트 임포트 규칙
```javascript
// 모든 페이지에서 컴포넌트 사용 시
import { Button, Input, Card, Modal, Toast, Theme } from './components/index.js';
```

#### 5. 스타일 규칙
- 새로운 CSS 클래스 생성 최소화
- 컴포넌트의 variant와 size 옵션 활용
- 필요시 className 옵션으로 추가 스타일 적용

### 코드 스타일
- ES6+ 문법 사용
- 함수형 프로그래밍 선호
- 명확한 변수/함수 네이밍
- JSDoc 주석 활용

### 성능 최적화
- ICM 계산 결과 캐싱
- 대용량 범위 데이터 지연 로딩
- Web Worker를 통한 복잡한 계산 처리

### 보안 고려사항
- 사용자 입력 검증
- XSS 공격 방지
- 민감한 데이터 클라이언트 저장 금지

## 향후 확장 계획
1. **적응형 학습**: AI 기반 사용자 취약점 분석 및 맞춤형 시나리오 제공
2. **상세 통계**: 포지션별/상황별 정답률, 학습 패턴 분석 대시보드
3. **시나리오 확장**: 9-max, HU, 다양한 상금 구조 시나리오
4. **대화형 해설**: 각 시나리오의 상세한 전략적 해설과 대안 분석
5. **진도 시스템**: 레벨 업, 배지, 성취도 기반 동기부여 시스템
6. **커뮤니티**: 시나리오 토론, 전략 공유, 리더보드

## 배포 및 환경 설정

### 개발 환경
```bash
# 의존성 설치
npm install

# 로컬 개발 서버 실행 (선택사항)
# Python 서버 사용
python3 -m http.server 8000
# 또는 Node.js 서버 사용
npx serve .
```

### 프로덕션 배포
```bash
# 서버의 웹 디렉토리로 파일 복사
sudo cp -r * /var/www/html/icm-sng/

# Apache/Nginx 설정
# 서브도메인 설정 예시: icm.yourdomain.com
```

### 환경 설정
```javascript
// config.js
const config = {
  // ICM 계산 관련 설정
  PRIZE_STRUCTURE: [0.5, 0.3, 0.2], // 1st, 2nd, 3rd
  STARTING_CHIPS: 1500,
  STARTING_BLINDS: 25/50
};
```

## 테스트 전략
1. **단위 테스트**: ICM 계산, Push/Fold 로직
2. **통합 테스트**: UI 상호작용, 데이터 흐름
3. **E2E 테스트**: 전체 사용자 플로우

## Linear Design System 컴포넌트 사용 예시

### 버튼 사용
```javascript
// Primary 버튼
const pushButton = Button.create({
    text: 'All-in',
    variant: 'primary',
    size: 'lg',
    onClick: () => handlePush()
});

// Secondary 버튼
const foldButton = Button.create({
    text: 'Fold',
    variant: 'secondary',
    size: 'lg',
    onClick: () => handleFold()
});
```

### 퀴즈 컨트롤 사용
```javascript
// 새 시나리오 버튼
const newScenarioBtn = Button.create({
    text: '새 시나리오',
    variant: 'secondary',
    size: 'lg',
    onClick: () => loadNewScenario()
});

// 정답 확인 버튼  
const checkAnswerBtn = Button.create({
    text: '정답 확인',
    variant: 'primary',
    size: 'lg',
    disabled: true, // 선택 전까지 비활성화
    onClick: () => showAnswerExplanation()
});
```

### 카드 컴포넌트 사용
```javascript
// 플레이어 정보 카드
const playerCard = Card.create({
    title: 'Player 1',
    subtitle: 'BTN Position',
    content: `
        <div class="player-stats">
            <div>스택: 1500</div>
            <div>ICM EV: 33.3%</div>
        </div>
    `,
    variant: 'default'
});

// 포커 카드
const pokerCard = Card.createPokerCard({
    rank: 'A',
    suit: '♠'
});
```

### 모달 사용
```javascript
// 설정 모달
const settingsModal = Modal.create({
    title: '게임 설정',
    content: settingsForm,
    footer: [
        { text: '취소', variant: 'secondary', onClick: (e, modal) => modal.close() },
        { text: '저장', variant: 'primary', onClick: (e, modal) => saveSettings(modal) }
    ]
});
settingsModal.open();
```

### 학습 피드백 토스트 사용
```javascript
// 정답 시 성공 알림
Toast.success('정답! 이 상황에서 Push가 +2.5% EV를 제공합니다.');

// 오답 시 학습 알림
Toast.error('아쉽네요. 이 상황에서는 Fold가 더 유리합니다. (-1.8% EV)');

// 시나리오 정보 알림
Toast.info('버블 상황: 4명 남았으며 3명이 상금을 받습니다.');

// 학습 진도 알림
Toast.success('5문제 연속 정답! 레벨이 향상되었습니다.');
```

## 기여 가이드
- 기능 브랜치 전략 사용
- PR 전 테스트 필수
- 코드 리뷰 프로세스 준수
- **Linear Design System 컴포넌트 사용 필수**

# important-instruction-reminders
이 프로젝트에서 작업할 때 반드시 따라야 할 규칙:

1. **퀴즈 기반 학습 앱 원칙**
   - 사용자가 직접 값을 입력하는 기능은 구현하지 마세요 (스택 편집, 블라인드 조정 등)
   - 모든 상황은 미리 정의된 시나리오로 제공해야 합니다
   - 사용자는 Push 또는 Fold만 선택할 수 있습니다
   - 선택 후 즉시 정답과 해설을 제공해야 합니다

2. **UI 구현 시 Linear Design System 컴포넌트 필수 사용**
   - 절대 document.createElement로 직접 UI 요소를 만들지 마세요
   - 항상 /src/js/components/ 디렉토리의 컴포넌트를 사용하세요
   - Button, Input, Card, Modal, Toast 컴포넌트가 이미 구현되어 있습니다

3. **디자인 일관성 유지**
   - linear_app.json에 정의된 색상과 스타일만 사용
   - Theme.js의 디자인 토큰 활용
   - 새로운 색상이나 스타일 하드코딩 금지

4. **학습 앱 특화 기능**
   - 시나리오 데이터는 JSON 형태로 관리
   - 학습 진도와 정답률 추적 시스템 구현
   - 교육적 피드백과 해설 제공에 중점

5. **코드 작성 시**
   - ES6 모듈 시스템 사용 (import/export)
   - 컴포넌트는 항상 index.js를 통해 임포트
   - JSDoc 주석으로 문서화