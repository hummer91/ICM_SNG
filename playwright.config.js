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
  reporter: [['html', { outputFolder: 'test-results/e2e' }], ['list']],

  // 전역 설정
  use: {
    // 기본 URL (ICM 포커 앱)
    baseURL: 'http://localhost:8080',

    // 헤드리스 모드 강제 (시스템 의존성 문제 회피)
    headless: true,

    // 스크린샷 설정 (포커 게임 UI 캡처 중요)
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // 추적 설정
    trace: 'on-first-retry',

    // 타임아웃 설정 (JavaScript 기반 포커 앱)
    actionTimeout: 15 * 1000, // 포커 애니메이션 고려
    navigationTimeout: 30 * 1000,

    // 포커 게임에 적합한 뷰포트
    viewport: { width: 1280, height: 720 },

    // 로컬 스토리지 접근 (퀴즈 통계 저장)
    storageState: undefined,

    // 콘솔 로그 캡처 (ICM 계산 디버깅용)
    launchOptions: {
      args: ['--disable-web-security', '--disable-features=VizDisplayCompositor'],
    },
  },

  // 프로젝트 설정 (ICM 포커 앱 특화)
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        headless: true, // 헤드리스 모드 강제
      },
    },
    {
      name: 'firefox-desktop',
      use: {
        ...devices['Desktop Firefox'],
        headless: true, // 헤드리스 모드 강제
      },
    },
    {
      name: 'webkit-desktop',
      use: {
        ...devices['Desktop Safari'],
        headless: true, // 헤드리스 모드 강제
      },
    },
    // 모바일 포커 테스트 (반응형 UI)
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        headless: true,
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
        headless: true,
      },
    },
    // 태블릿 테스트 (포커 테이블 최적 크기)
    {
      name: 'tablet-landscape',
      use: {
        ...devices['iPad Pro landscape'],
        headless: true,
      },
    },
  ],

  // 로컬 개발 서버 설정 (ICM 포커 앱)
  webServer: {
    command: 'python3 -m http.server 8080',
    port: 8080,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    cwd: '.', // 현재 디렉토리에서 서버 실행
    env: {
      NODE_ENV: 'test',
    },
  },
});
