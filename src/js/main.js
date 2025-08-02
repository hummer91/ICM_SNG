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

  // 앱 컨테이너에 기본 콘텐츠 추가
  const app = document.getElementById('app');
  app.innerHTML += `
        <header class="app-header">
            <h1>ICM SNG 포커 전략</h1>
            <p class="subtitle">6인 토너먼트 Push/Fold 최적화</p>
        </header>
        
        <main class="app-main">
            <div class="container">
                <p>앱이 성공적으로 로드되었습니다!</p>
                <p>Vite + pnpm 개발 환경이 구성되었습니다.</p>
                ${config.debug ? '<p class="debug-info">디버그 모드 활성화됨</p>' : ''}
            </div>
        </main>
    `;
});

// HMR (Hot Module Replacement) 지원
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.info('HMR 업데이트 적용됨');
  });
}
