import { test, expect } from '@playwright/test';

test.describe('컴포넌트 데모 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components.html');
  });

  test('페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await expect(page).toHaveTitle(/컴포넌트 데모/);
    await expect(page.locator('h1')).toContainText('Linear 디자인 시스템');
  });

  test('네비게이션이 작동해야 함', async ({ page }) => {
    // 버튼 섹션으로 이동
    await page.click('a[href="#buttons"]');
    await expect(page.locator('#buttons')).toBeInViewport();

    // 레인지 차트 섹션으로 이동
    await page.click('a[href="#rangechart"]');
    await expect(page.locator('#rangechart')).toBeInViewport();
  });

  test.describe('버튼 컴포넌트', () => {
    test('버튼 클릭 시 토스트가 표시되어야 함', async ({ page }) => {
      // 버튼 섹션으로 스크롤
      await page.locator('#buttons').scrollIntoViewIfNeeded();

      // Primary 버튼 클릭
      await page.getByRole('button', { name: 'Primary' }).first().click();

      // 토스트 확인
      await expect(page.locator('.toast')).toBeVisible();
      await expect(page.locator('.toast')).toContainText('primary 버튼 클릭!');
    });

    test('비활성화된 버튼은 클릭되지 않아야 함', async ({ page }) => {
      await page.locator('#buttons').scrollIntoViewIfNeeded();

      const disabledButton = page.getByRole('button', { name: '비활성화' });
      await expect(disabledButton).toBeDisabled();
    });

    test('로딩 버튼은 스피너를 표시해야 함', async ({ page }) => {
      await page.locator('#buttons').scrollIntoViewIfNeeded();

      const loadingButton = page.getByRole('button', { name: '로딩 중' });
      await expect(loadingButton).toBeDisabled();
      await expect(loadingButton.locator('.spinner')).toBeVisible();
    });
  });

  test.describe('입력 필드 컴포넌트', () => {
    test('입력 필드에 텍스트를 입력할 수 있어야 함', async ({ page }) => {
      await page.locator('#inputs').scrollIntoViewIfNeeded();

      const nameInput = page.locator('input[placeholder="이름을 입력하세요"]');
      await nameInput.fill('홍길동');
      await expect(nameInput).toHaveValue('홍길동');
    });

    test('이메일 유효성 검사가 작동해야 함', async ({ page }) => {
      await page.locator('#inputs').scrollIntoViewIfNeeded();

      const emailInput = page.locator('input[type="email"]');
      await emailInput.fill('invalid-email');
      await emailInput.blur();

      // HTML5 validation API
      const isValid = await emailInput.evaluate((el) => el.validity.valid);
      expect(isValid).toBe(false);
    });

    test('숫자 입력 필드의 범위 제한이 작동해야 함', async ({ page }) => {
      await page.locator('#inputs').scrollIntoViewIfNeeded();

      const numberInput = page.locator('input[type="number"]');
      await numberInput.fill('150'); // max는 100
      await numberInput.blur();

      const value = await numberInput.inputValue();
      expect(Number(value)).toBeLessThanOrEqual(100);
    });
  });

  test.describe('모달 컴포넌트', () => {
    test('모달이 열리고 닫혀야 함', async ({ page }) => {
      await page.locator('#modals').scrollIntoViewIfNeeded();

      // 모달 열기
      await page.getByRole('button', { name: '기본 모달 열기' }).click();

      // 모달 확인
      const modal = page.locator('.modal-overlay');
      await expect(modal).toBeVisible();
      await expect(modal).toContainText('기본 모달');

      // 모달 닫기
      await page.getByRole('button', { name: '닫기' }).click();
      await expect(modal).not.toBeVisible();
    });

    test('확인 대화상자가 작동해야 함', async ({ page }) => {
      await page.locator('#modals').scrollIntoViewIfNeeded();

      // 확인 대화상자 열기
      await page.getByRole('button', { name: '확인 대화상자' }).click();

      // 대화상자 확인
      await expect(page.locator('.modal-overlay')).toBeVisible();
      await expect(page.locator('.modal-content')).toContainText(
        '정말로 이 항목을 삭제하시겠습니까?',
      );

      // 삭제 버튼 클릭
      await page.getByRole('button', { name: '삭제' }).click();

      // 토스트 메시지 확인
      await expect(page.locator('.toast')).toContainText('삭제되었습니다!');
    });
  });

  test.describe('레인지 차트 컴포넌트', () => {
    test('레인지 차트가 13x13 그리드를 표시해야 함', async ({ page }) => {
      await page.locator('#rangechart').scrollIntoViewIfNeeded();

      const cells = page.locator('.range-cell');
      await expect(cells).toHaveCount(169); // 13 x 13
    });

    test('차트 크기를 변경할 수 있어야 함', async ({ page }) => {
      await page.locator('#rangechart').scrollIntoViewIfNeeded();

      // 크게 버튼 클릭
      await page.getByRole('button', { name: '크게' }).click();

      // 차트 크기 확인
      await expect(page.locator('.range-chart-large')).toBeVisible();
    });

    test('셀 클릭 시 토스트가 표시되어야 함', async ({ page }) => {
      await page.locator('#rangechart').scrollIntoViewIfNeeded();

      // 첫 번째 셀(AA) 클릭
      await page.locator('.range-cell').first().click();

      // 토스트 확인
      await expect(page.locator('.toast')).toBeVisible();
      await expect(page.locator('.toast')).toContainText('AA 클릭');
    });

    test('호버 시 정보가 표시되어야 함', async ({ page }) => {
      await page.locator('#rangechart').scrollIntoViewIfNeeded();

      // 셀에 호버
      await page.locator('.range-cell').first().hover();

      // 호버 정보 확인
      const hoverInfo = page.locator('#hover-info');
      await expect(hoverInfo).not.toContainText('마우스를 올려 정보 확인');
      await expect(hoverInfo).toContainText('AA:');
    });
  });

  test.describe('반응형 디자인', () => {
    test('모바일 뷰포트에서 레이아웃이 적절히 조정되어야 함', async ({ page }) => {
      // 모바일 크기로 조정
      await page.setViewportSize({ width: 375, height: 667 });

      // 네비게이션이 여전히 작동해야 함
      await page.click('a[href="#buttons"]');
      await expect(page.locator('#buttons')).toBeInViewport();

      // 버튼이 적절히 표시되어야 함
      const button = page.getByRole('button', { name: 'Primary' }).first();
      await expect(button).toBeVisible();
    });
  });
});
