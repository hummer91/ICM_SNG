# Phase 1 테스트 체크리스트

Phase 1 (기초 설정) 완료 시점에서 수행해야 할 테스트 항목들입니다.

## 자동 테스트 (Automated Tests)

### 1. 빌드 및 린트 테스트

```bash
# 프로젝트 빌드 성공 여부 (Vite 프로덕션 빌드)
npm run build
# 빌드 결과물 확인
ls -la dist/

# 개발 서버 실행 테스트
npm run dev
# 또는 정적 서버로 실행
python3 -m http.server 8000
# 또는 npx serve dist (빌드 후)

# ESLint 검사
npm run lint

# Prettier 포맷팅 검사
npm run format:check

# TypeScript 타입 체크 (설정된 경우)
npm run typecheck

# 모든 테스트 실행
npm test
```

### 2. CSS 변수 및 디자인 토큰 테스트

```javascript
// test/css-variables.test.js
describe('CSS Variables', () => {
  test('모든 CSS 변수가 정의되어 있는지 확인', () => {
    const requiredVariables = [
      '--bg-primary',
      '--bg-secondary',
      '--bg-tertiary',
      '--text-primary',
      '--text-secondary',
      '--border-primary',
      '--brand-purple',
      '--success',
      '--warning',
      '--error',
    ];

    // 각 변수가 :root에 정의되어 있는지 확인
  });
});
```

### 3. 컴포넌트 스타일 테스트

```javascript
// test/components.test.js
describe('Component Styles', () => {
  test('버튼 컴포넌트 클래스 존재 여부', () => {
    const buttonClasses = ['.btn', '.btn-primary', '.btn-secondary', '.btn-ghost', '.btn-outline'];
    // CSS 파일에 클래스가 정의되어 있는지 확인
  });

  test('입력 필드 컴포넌트 클래스 존재 여부', () => {
    const inputClasses = ['.input', '.input-group', '.input-label', '.input-error'];
    // CSS 파일에 클래스가 정의되어 있는지 확인
  });
});
```

### 4. 파일 구조 검증

```bash
# 필수 파일 존재 여부 확인
test -f index.html && echo "✓ index.html exists" || echo "✗ index.html missing"
test -f src/css/main.css && echo "✓ main.css exists" || echo "✗ main.css missing"
test -f src/css/components.css && echo "✓ components.css exists" || echo "✗ components.css missing"
test -f package.json && echo "✓ package.json exists" || echo "✗ package.json missing"
```

### 5. 의존성 보안 검사

```bash
# npm audit으로 보안 취약점 검사
npm audit

# Snyk 검사 (설정된 경우)
npm run security:check
```

### 6. 성능 메트릭 기본 테스트

```javascript
// test/performance.test.js
describe('Performance Metrics', () => {
  test('CSS 파일 크기가 제한 이내인지 확인', () => {
    const maxSize = 50 * 1024; // 50KB
    // main.css와 components.css 크기 확인
  });

  test('번들 크기가 제한 이내인지 확인', () => {
    const maxBundleSize = 500 * 1024; // 500KB
    // 빌드된 번들 크기 확인
  });
});
```

## 수동 테스트 (Manual Tests)

### 1. 브라우저 호환성 테스트

#### 데스크톱 브라우저

- [ ] Chrome (최신 버전)
- [ ] Firefox (최신 버전)
- [ ] Safari (최신 버전)
- [ ] Edge (최신 버전)

#### 모바일 브라우저

- [ ] iOS Safari
- [ ] Chrome Mobile
- [ ] Samsung Internet

### 2. 디자인 시스템 시각적 검증

#### 색상 시스템

- [ ] 다크 테마 배경색이 올바르게 표시되는지 확인
  - `--bg-primary`: rgb(8, 9, 10)
  - `--bg-secondary`: rgb(16, 17, 18)
  - `--bg-tertiary`: rgb(24, 25, 26)
- [ ] 텍스트 색상 대비율이 충분한지 확인
- [ ] 브랜드 색상(보라색)이 정확히 표시되는지 확인

#### 타이포그래피

- [ ] Inter 폰트가 올바르게 로드되는지 확인
- [ ] 폰트 크기 스케일이 일관되게 적용되는지 확인
- [ ] 폰트 굵기(300-680)가 제대로 표시되는지 확인

#### 스페이싱

- [ ] 4px 베이스 간격이 일관되게 적용되는지 확인
- [ ] 컴포넌트 간 여백이 적절한지 확인

### 3. 컴포넌트 UI 테스트

#### 버튼 컴포넌트

- [ ] Primary 버튼 스타일 및 호버 효과
- [ ] Secondary 버튼 스타일 및 호버 효과
- [ ] Ghost 버튼 스타일 및 호버 효과
- [ ] Outline 버튼 스타일 및 호버 효과
- [ ] 비활성화 상태 스타일
- [ ] 로딩 상태 애니메이션

#### 입력 필드

- [ ] 기본 입력 필드 스타일
- [ ] 포커스 상태 (보라색 글로우 효과)
- [ ] 오류 상태 (빨간색 테두리)
- [ ] 성공 상태 (초록색 테두리)
- [ ] 플레이스홀더 텍스트 가독성

#### 카드 컴포넌트

- [ ] 기본 카드 스타일
- [ ] 호버 효과
- [ ] 그림자 효과
- [ ] 포커 카드 스타일 (흰색 배경, 숫자/무늬 표시)

#### 모달 오버레이

- [ ] 오버레이 배경 블러 효과
- [ ] 모달 컨텐츠 중앙 정렬
- [ ] 열기/닫기 애니메이션
- [ ] 스크롤 가능 여부

### 4. 다크 테마 최적화 테스트

#### 눈의 피로도

- [ ] 30분 이상 사용 시 눈의 피로감 체크
- [ ] 배경과 텍스트의 대비가 적절한지 확인
- [ ] 밝은 요소가 눈부시지 않은지 확인

#### 고대비 모드

- [ ] `.high-contrast` 클래스 적용 시 가독성 향상 확인
- [ ] `.reduce-eye-strain` 클래스 적용 시 밝기 감소 확인
- [ ] `.night-mode` 클래스 적용 시 전체적인 밝기/대비 감소 확인

### 5. 반응형 디자인 테스트

#### 브레이크포인트

- [ ] 모바일 (< 640px)
- [ ] 태블릿 (640px - 768px)
- [ ] 데스크톱 (768px - 1024px)
- [ ] 큰 화면 (> 1024px)

#### 레이아웃 확인

- [ ] 컨테이너 최대 너비 제한
- [ ] 패딩 조정
- [ ] 폰트 크기 조정
- [ ] 모달 반응형 동작

### 6. 접근성 테스트

#### 키보드 네비게이션

- [ ] Tab 키로 모든 인터랙티브 요소 접근 가능
- [ ] 포커스 표시가 명확하게 보이는지 확인
- [ ] Esc 키로 모달 닫기 가능

#### 스크린 리더

- [ ] 주요 요소에 적절한 ARIA 라벨 존재
- [ ] 의미 있는 대체 텍스트

#### 색상 대비

- [ ] WCAG 2.1 AA 기준 충족 (4.5:1 이상)
- [ ] 색맹 사용자를 위한 구분 가능성

### 7. 애니메이션 및 트랜지션

- [ ] 모든 트랜지션이 부드럽게 작동하는지 확인
- [ ] 애니메이션 지속 시간이 적절한지 확인 (150ms, 200ms, 300ms)
- [ ] `prefers-reduced-motion` 설정 시 애니메이션 비활성화 확인

### 8. 성능 체크

#### 페이지 로드

- [ ] 초기 로드 시간 < 2초
- [ ] Inter 폰트 로드 시간
- [ ] CSS 파일 캐싱 확인

#### 런타임 성능

- [ ] 스크롤 성능
- [ ] 호버 효과 반응성
- [ ] 애니메이션 프레임 드롭 없음

## 테스트 실행 순서

1. **자동 테스트 먼저 실행**

   ```bash
   npm run test:all
   ```

2. **개발 서버 실행**

   ```bash
   npm run dev
   # 또는
   python3 -m http.server 8000
   ```

3. **수동 테스트 체크리스트 수행**
   - 브라우저별로 접속하여 테스트
   - 개발자 도구 활용하여 성능 메트릭 확인
   - 다양한 화면 크기에서 테스트

4. **문제 발견 시 기록**
   - 스크린샷 캡처
   - 브라우저 정보 기록
   - 재현 단계 문서화

## 예상 문제 및 해결 방법

### 폰트 로드 실패

- 인터넷 연결 확인
- 폰트 CDN 차단 여부 확인
- 로컬 폰트 파일 사용 고려

### CSS 변수 미지원 브라우저

- 폴리필 적용
- 대체 값 제공

### 애니메이션 성능 이슈

- GPU 가속 활용 (`transform`, `opacity`)
- `will-change` 속성 적용
- 복잡한 애니메이션 단순화
