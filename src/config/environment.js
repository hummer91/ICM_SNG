/**
 * 환경별 설정 관리
 */

// 환경 변수 타입 정의 (Vanilla JS 환경에서는 기본값 사용)
const ENV_VARS = {
  NODE_ENV: 'development',
  SENTRY_DSN: '',
  SENTRY_ENVIRONMENT: 'development',
  SENTRY_RELEASE: '1.0.0',
  POSTHOG_API_KEY: '',
  POSTHOG_HOST: 'https://app.posthog.com',
  APP_NAME: 'ICM SNG Poker',
  APP_VERSION: '1.0.0',
  API_URL: '/api',
  PERF_LCP_BUDGET: 2500,
  PERF_FID_BUDGET: 100,
  PERF_CLS_BUDGET: 0.1,
};

// 환경별 설정
const config = {
  development: {
    debug: true,
    enableAnalytics: false,
    enableErrorTracking: true,
    logLevel: 'debug',
    ...ENV_VARS,
  },
  production: {
    debug: false,
    enableAnalytics: true,
    enableErrorTracking: true,
    logLevel: 'error',
    ...ENV_VARS,
  },
  test: {
    debug: false,
    enableAnalytics: false,
    enableErrorTracking: false,
    logLevel: 'error',
    ...ENV_VARS,
  },
};

// 현재 환경 가져오기
const currentEnv = ENV_VARS.NODE_ENV;

// 설정 내보내기
export default config[currentEnv] || config.development;

// 개별 설정 내보내기
export const {
  debug,
  enableAnalytics,
  enableErrorTracking,
  logLevel,
  SENTRY_DSN,
  SENTRY_ENVIRONMENT,
  SENTRY_RELEASE,
  POSTHOG_API_KEY,
  POSTHOG_HOST,
  APP_NAME,
  APP_VERSION,
  API_URL,
  PERF_LCP_BUDGET,
  PERF_FID_BUDGET,
  PERF_CLS_BUDGET,
} = config[currentEnv] || config.development;

// 환경 확인 헬퍼
export const isDevelopment = currentEnv === 'development';
export const isProduction = currentEnv === 'production';
export const isTest = currentEnv === 'test';
