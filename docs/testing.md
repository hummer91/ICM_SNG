# 테스트 가이드

## 개요

ICM SNG 프로젝트는 Vitest를 단위 테스트에, Playwright를 E2E 테스트에 사용합니다.

## 단위 테스트 (Vitest)

### 실행 방법

```bash
# 테스트 실행
npm test

# 감시 모드로 실행
npm run test

# UI 모드로 실행
npm run test:ui

# 커버리지 확인
npm run test:coverage
```

### 테스트 작성 예제

```javascript
import { describe, it, expect } from 'vitest';
import { ICMCalculator } from './icm.js';

describe('ICM Calculator', () => {
  it('should calculate equity correctly', () => {
    const icm = new ICMCalculator([0.5, 0.3, 0.2]);
    const equities = icm.calculate([5000, 3000, 2000]);

    expect(equities.reduce((sum, eq) => sum + eq, 0)).toBeCloseTo(1);
  });
});
```

### 컴포넌트 테스트

```javascript
import { Button } from './Button.js';
import { screen, fireEvent } from '@testing-library/dom';

it('should handle click events', () => {
  const onClick = vi.fn();
  const button = Button.create({ text: 'Click me', onClick });

  document.body.appendChild(button);
  fireEvent.click(button);

  expect(onClick).toHaveBeenCalled();
});
```

## E2E 테스트 (Playwright)

### 실행 방법

```bash
# 모든 브라우저에서 테스트
npm run test:e2e

# UI 모드로 실행
npm run test:e2e:ui

# 디버그 모드
npm run test:e2e:debug

# 특정 브라우저만
npx playwright test --project=chromium
```

### E2E 테스트 작성 예제

```javascript
import { test, expect } from '@playwright/test';

test('should display range chart', async ({ page }) => {
  await page.goto('/components.html');

  // 레인지 차트 섹션으로 이동
  await page.click('a[href="#rangechart"]');

  // 차트 확인
  const cells = page.locator('.range-cell');
  await expect(cells).toHaveCount(169);
});
```

## 테스트 구조

```
src/
├── js/
│   ├── components/
│   │   ├── Button.js
│   │   └── Button.test.js    # 컴포넌트 단위 테스트
│   ├── icm.js
│   └── icm.test.js           # 로직 단위 테스트
├── tests/
│   └── setup.js              # 테스트 환경 설정
e2e/
├── components.spec.js        # 컴포넌트 페이지 E2E
└── main.spec.js              # 메인 페이지 E2E
```

## 커버리지 목표

- 구문(Statements): 80%
- 분기(Branches): 80%
- 함수(Functions): 80%
- 라인(Lines): 80%

## 모의 객체 및 스텁

```javascript
// localStorage 모의
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};

// API 호출 모의
vi.mock('./api', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: 'test' }),
}));
```

## CI/CD 통합

GitHub Actions나 다른 CI 도구에서 테스트를 실행하려면:

```yaml
- name: Install dependencies
  run: npm ci

- name: Run unit tests
  run: npm run test:coverage

- name: Run E2E tests
  run: npm run test:e2e
```

## 베스트 프랙티스

1. **테스트는 독립적이어야 함**: 각 테스트는 다른 테스트에 의존하지 않아야 함
2. **명확한 설명**: 테스트가 무엇을 검증하는지 명확히 설명
3. **AAA 패턴**: Arrange, Act, Assert 패턴 사용
4. **테스트 데이터**: 실제와 유사한 테스트 데이터 사용
5. **에러 케이스**: 정상 케이스뿐만 아니라 에러 케이스도 테스트

## 디버깅

- Vitest UI: `npm run test:ui`로 시각적 디버깅
- Playwright Inspector: `npm run test:e2e:debug`로 단계별 실행
- VS Code 통합: 디버거 설정으로 중단점 사용 가능
