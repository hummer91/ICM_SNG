import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // 테스트 디렉토리
  testDir: './e2e',
  
  // 테스트 실행 설정
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // 리포터 설정
  reporter: [
    ['html', { outputFolder: 'test-results/e2e' }],
    ['list']
  ],
  
  // 전역 설정
  use: {
    // 기본 URL
    baseURL: 'http://localhost:5173',
    
    // 스크린샷 설정
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // 추적 설정
    trace: 'on-first-retry',
    
    // 액션 타임아웃
    actionTimeout: 10 * 1000,
    
    // 네비게이션 타임아웃
    navigationTimeout: 30 * 1000,
  },

  // 프로젝트 설정 (브라우저별)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // 모바일 테스트
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // 로컬 개발 서버 설정
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});