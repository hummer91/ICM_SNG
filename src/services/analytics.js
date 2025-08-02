/**
 * PostHog 사용자 분석 서비스
 */

import posthog from 'posthog-js';
import {
  POSTHOG_API_KEY,
  POSTHOG_HOST,
  enableAnalytics,
  debug,
  APP_NAME,
  APP_VERSION,
} from '../config/environment.js';

/**
 * PostHog 초기화
 */
export function initAnalytics() {
  if (!enableAnalytics || !POSTHOG_API_KEY) {
    if (debug) {
      console.info('Analytics is disabled or API key not provided');
    }
    return;
  }

  try {
    posthog.init(POSTHOG_API_KEY, {
      api_host: POSTHOG_HOST,
      // 개인정보 보호 설정
      autocapture: false, // 자동 캡처 비활성화 (명시적 추적만)
      capture_pageview: true, // 페이지뷰 자동 추적
      capture_pageleave: true, // 페이지 이탈 추적
      persistence: 'localStorage',
      // 성능 설정
      disable_session_recording: true, // 세션 녹화 비활성화
      // 디버그 설정
      debug,
      // 기본 속성
      loaded: (posthog) => {
        posthog.register({
          app_name: APP_NAME,
          app_version: APP_VERSION,
          screen_width: window.screen.width,
          screen_height: window.screen.height,
          viewport_width: window.innerWidth,
          viewport_height: window.innerHeight,
        });
      },
    });

    // 익명 사용자 ID 설정
    const userId = getAnonymousUserId();
    posthog.identify(userId);

    console.info('PostHog analytics initialized');
  } catch (error) {
    console.error('Failed to initialize PostHog:', error);
  }
}

/**
 * 익명화된 사용자 ID 가져오기 (Sentry와 동일한 ID 사용)
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
 * 이벤트 추적
 */
export function trackEvent(eventName, properties = {}) {
  if (!enableAnalytics) {
    if (debug) {
      console.info('Analytics event (disabled):', eventName, properties);
    }
    return;
  }

  try {
    posthog.capture(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

/**
 * 사용자 속성 설정
 */
export function setUserProperties(properties) {
  if (!enableAnalytics) {
    return;
  }

  try {
    posthog.people.set(properties);
  } catch (error) {
    console.error('Failed to set user properties:', error);
  }
}

/**
 * 페이지뷰 추적
 */
export function trackPageView(pageName, properties = {}) {
  if (!enableAnalytics) {
    return;
  }

  try {
    posthog.capture('$pageview', {
      $current_url: window.location.href,
      $host: window.location.host,
      $pathname: window.location.pathname,
      page_name: pageName,
      ...properties,
    });
  } catch (error) {
    console.error('Failed to track pageview:', error);
  }
}

/**
 * 게임 관련 이벤트 추적 헬퍼
 */
export const GameAnalytics = {
  // 게임 시작
  trackGameStart(gameMode, stakes) {
    trackEvent('game_started', {
      game_mode: gameMode,
      stakes,
      timestamp: Date.now(),
    });
  },

  // Push/Fold 결정
  trackDecision(decision, position, stackSize, confidence) {
    trackEvent('decision_made', {
      decision_type: decision,
      position,
      stack_size_bb: stackSize,
      confidence_score: confidence,
      timestamp: Date.now(),
    });
  },

  // 학습 진행도
  trackLearningProgress(scenario, correct, timeSpent) {
    trackEvent('learning_progress', {
      scenario_type: scenario,
      is_correct: correct,
      time_spent_seconds: timeSpent,
      timestamp: Date.now(),
    });
  },

  // 세션 종료
  trackSessionEnd(duration, decisionsCount, accuracy) {
    trackEvent('session_ended', {
      session_duration_seconds: duration,
      total_decisions: decisionsCount,
      accuracy_percentage: accuracy,
      timestamp: Date.now(),
    });
  },

  // UI 상호작용
  trackUIInteraction(element, action) {
    trackEvent('ui_interaction', {
      element_name: element,
      action_type: action,
      timestamp: Date.now(),
    });
  },
};

/**
 * 분석 서비스 종료
 */
export function shutdownAnalytics() {
  if (!enableAnalytics) {
    return;
  }

  try {
    posthog.capture('app_shutdown', {
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Failed to shutdown analytics:', error);
  }
}
