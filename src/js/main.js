/**
 * ICM SNG 포커 학습 앱 - 메인 진입점
 *
 * @module main
 */

// 모니터링 서비스 임포트
import { initSentry } from '../services/sentry.js';
import { initAnalytics } from '../services/analytics.js';
import { initPerformanceMonitoring } from '../services/performance.js';
import config from '../config/environment.js';
import { TRUSTED_TYPES_CONFIG } from '../config/security.js';

// UI 컴포넌트 임포트
import { initializeGameLayout } from './ui/views/gameLayout.js';

// 시나리오 시스템 임포트
import { initializeScenarios } from './scenario.js';

// 보안 초기화
function initializeSecurity() {
  try {
    // Trusted Types 정책 설정 (지원하는 브라우저에서만)
    if (window.trustedTypes && window.trustedTypes.createPolicy) {
      window.trustedTypes.createPolicy('default', TRUSTED_TYPES_CONFIG);

      if (config.debug) {
        console.info('Trusted Types policy initialized');
      }
    }
  } catch (error) {
    console.error('Failed to initialize security:', error);
  }
}

// 모니터링 서비스 초기화
function initializeMonitoring() {
  try {
    // Sentry 에러 추적 초기화
    initSentry();

    // PostHog 분석 초기화
    initAnalytics();

    // Core Web Vitals 모니터링 초기화
    initPerformanceMonitoring();

    if (config.debug) {
      console.info('All monitoring services initialized successfully');
    }
  } catch (error) {
    console.error('Failed to initialize monitoring services:', error);
  }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
  console.info('ICM SNG 포커 앱 시작');

  // 보안 초기화
  initializeSecurity();

  // 모니터링 서비스 초기화
  initializeMonitoring();

  // 로딩 화면 제거
  const loadingScreen = document.querySelector('.loading-screen');
  if (loadingScreen) {
    setTimeout(() => {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 300);
    }, 1000);
  }

  // 게임 레이아웃 초기화
  initializeGameLayout();

  // 시나리오 시스템 초기화 (비동기)
  initializeScenarios().then((success) => {
    if (success) {
      console.info('퀴즈 시나리오 시스템 준비 완료');
    } else {
      console.warn('시나리오 시스템 초기화 실패 - 기본 모드로 실행');
    }
  });
});

// HMR (Hot Module Replacement) 지원
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.info('HMR 업데이트 적용됨');
  });
}
