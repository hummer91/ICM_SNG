import { test, expect } from '@playwright/test';

test.describe('메인 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await expect(page).toHaveTitle(/ICM SNG 포커 학습 앱/);
    
    // 로딩 화면이 사라져야 함
    await expect(page.locator('#loading')).not.toBeVisible();
    
    // 앱 컨테이너가 표시되어야 함
    await expect(page.locator('#app')).toBeVisible();
  });

  test('헤더가 표시되어야 함', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();
    await expect(header).toContainText('ICM SNG 포커');
  });

  test('Inter 폰트가 로드되어야 함', async ({ page }) => {
    // 폰트가 적용된 요소 확인
    const fontFamily = await page.locator('body').evaluate(el => 
      window.getComputedStyle(el).fontFamily
    );
    
    expect(fontFamily).toContain('Inter');
  });

  test('다크 테마가 적용되어야 함', async ({ page }) => {
    // 배경색 확인
    const backgroundColor = await page.locator('body').evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // rgb(8, 9, 10) = --bg-primary
    expect(backgroundColor).toBe('rgb(8, 9, 10)');
  });

  test('반응형 메타 태그가 설정되어야 함', async ({ page }) => {
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
    expect(viewport).toContain('initial-scale=1.0');
  });

  test('파비콘이 설정되어야 함', async ({ page }) => {
    const favicon = page.locator('link[rel="icon"]');
    await expect(favicon).toHaveAttribute('href', '/favicon.svg');
  });

  test('CSS 파일들이 로드되어야 함', async ({ page }) => {
    // CSS 파일 로드 확인
    const mainCss = page.locator('link[href="/src/css/main.css"]');
    await expect(mainCss).toHaveAttribute('rel', 'stylesheet');
  });

  test('JavaScript 모듈이 로드되어야 함', async ({ page }) => {
    // 콘솔 로그 확인
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        logs.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForTimeout(1000); // 모듈 로드 대기
    
    expect(logs.some(log => log.includes('앱 초기화'))).toBe(true);
  });

  test('에러가 발생하지 않아야 함', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.reload();
    await page.waitForTimeout(1000);
    
    expect(errors).toHaveLength(0);
  });

  test.describe('성능', () => {
    test('페이지 로드 시간이 적절해야 함', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/', { waitUntil: 'networkidle' });
      const loadTime = Date.now() - startTime;
      
      // 3초 이내에 로드되어야 함
      expect(loadTime).toBeLessThan(3000);
    });

    test('초기 렌더링이 빨라야 함', async ({ page }) => {
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart
        };
      });
      
      // DOM 로드가 빨라야 함
      expect(metrics.domContentLoaded).toBeLessThan(100);
    });
  });

  test.describe('접근성', () => {
    test('페이지에 적절한 heading 구조가 있어야 함', async ({ page }) => {
      const h1 = await page.locator('h1').count();
      expect(h1).toBeGreaterThan(0);
    });

    test('이미지에 alt 텍스트가 있어야 함', async ({ page }) => {
      const images = page.locator('img');
      const count = await images.count();
      
      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        expect(alt).toBeDefined();
      }
    });

    test('키보드 네비게이션이 작동해야 함', async ({ page }) => {
      // Tab 키로 이동 가능한지 확인
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement.tagName);
      expect(focusedElement).not.toBe('BODY');
    });
  });
});