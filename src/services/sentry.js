/**
 * Sentry 에러 추적 서비스
 */

import * as Sentry from '@sentry/browser';
import { BrowserTracing } from '@sentry/integrations';
import {
  SENTRY_DSN,
  SENTRY_ENVIRONMENT,
  SENTRY_RELEASE,
  APP_NAME,
  enableErrorTracking,
  debug,
} from '../config/environment.js';

/**
 * Sentry 초기화
 */
export function initSentry() {
  if (!enableErrorTracking || !SENTRY_DSN) {
    if (debug) {
      console.info('Sentry is disabled or DSN not provided');
    }
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: SENTRY_ENVIRONMENT,
      release: SENTRY_RELEASE,
      integrations: [
        new BrowserTracing({
          // 성능 모니터링 설정
          tracingOrigins: ['localhost', /^\//, /^https:\/\/.*\.icm-sng\.com/],
          // 라우트 변경 추적
          routingInstrumentation: Sentry.browserTracingIntegration(),
        }),
      ],
      // 성능 모니터링 샘플링 비율
      tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
      // 에러 필터링
      beforeSend(event, hint) {
        // 개발 환경에서는 콘솔에도 에러 출력
        if (debug) {
          console.error('Sentry Event:', event, hint);
        }

        // 특정 에러 무시
        if (event.exception) {
          const error = hint.originalException;
          // ResizeObserver 에러 무시 (브라우저 버그)
          if (error && error.message && error.message.includes('ResizeObserver')) {
            return null;
          }
          // 네트워크 에러 필터링
          if (error && error.name === 'NetworkError') {
            return null;
          }
        }

        return event;
      },
      // 사용자 정보 수집 설정
      autoSessionTracking: true,
      // 브레드크럼 설정
      beforeBreadcrumb(breadcrumb) {
        // 민감한 정보 제거
        if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
          return null;
        }
        return breadcrumb;
      },
    });

    // 사용자 컨텍스트 설정 (익명화된 ID 사용)
    const userId = getAnonymousUserId();
    Sentry.setUser({ id: userId });

    console.info(`Sentry initialized for ${APP_NAME} in ${SENTRY_ENVIRONMENT} mode`);
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
}

/**
 * 익명화된 사용자 ID 생성/가져오기
 */
function getAnonymousUserId() {
  const key = 'icm_sng_anonymous_id';
  let userId = localStorage.getItem(key);

  if (!userId) {
    userId = `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(key, userId);
  }

  return userId;
}

/**
 * 커스텀 에러 리포팅
 */
export function reportError(error, context = {}) {
  if (!enableErrorTracking) {
    return;
  }

  Sentry.captureException(error, {
    tags: {
      component: context.component || 'unknown',
      action: context.action || 'unknown',
    },
    extra: context.extra || {},
  });
}

/**
 * 커스텀 메시지 리포팅
 */
export function reportMessage(message, level = 'info', context = {}) {
  if (!enableErrorTracking) {
    return;
  }

  Sentry.captureMessage(message, level, {
    tags: context.tags || {},
    extra: context.extra || {},
  });
}

/**
 * 성능 트랜잭션 시작
 */
export function startTransaction(name, op = 'custom') {
  if (!enableErrorTracking) {
    return null;
  }

  return Sentry.startTransaction({
    name,
    op,
  });
}

/**
 * 브레드크럼 추가
 */
export function addBreadcrumb(breadcrumb) {
  if (!enableErrorTracking) {
    return;
  }

  Sentry.addBreadcrumb({
    timestamp: Date.now() / 1000,
    ...breadcrumb,
  });
}
