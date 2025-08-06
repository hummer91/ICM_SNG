/**
 * Core Web Vitals 및 성능 모니터링
 */

// web-vitals는 CDN을 통해 전역으로 로드됨
import { reportError, addBreadcrumb } from './sentry.js';
import { trackEvent } from './analytics.js';
import { debug, PERF_LCP_BUDGET, PERF_FID_BUDGET, PERF_CLS_BUDGET } from '../config/environment.js';

// 성능 메트릭 저장소
const performanceMetrics = {
  LCP: null,
  FID: null,
  CLS: null,
  FCP: null,
  TTFB: null,
};

// 성능 예산
const PERFORMANCE_BUDGETS = {
  LCP: PERF_LCP_BUDGET, // Largest Contentful Paint
  FID: PERF_FID_BUDGET, // First Input Delay
  CLS: PERF_CLS_BUDGET, // Cumulative Layout Shift
  FCP: 1800, // First Contentful Paint
  TTFB: 800, // Time to First Byte
};

/**
 * Core Web Vitals 모니터링 초기화
 */
export function initPerformanceMonitoring() {
  if (debug) {
    console.info('Initializing performance monitoring...');
  }

  // Core Web Vitals 측정 (webVitals는 전역으로 로드됨)
  if (typeof window.webVitals !== 'undefined') {
    window.webVitals.getCLS(onCLS);
    window.webVitals.getFID(onFID);
    window.webVitals.getLCP(onLCP);
    window.webVitals.getFCP(onFCP);
    window.webVitals.getTTFB(onTTFB);
  } else {
    console.warn('web-vitals not loaded');
  }

  // 페이지 로드 성능 측정
  measurePageLoadPerformance();

  // 리소스 타이밍 모니터링
  observeResourceTiming();

  // Long Tasks 모니터링
  observeLongTasks();
}

/**
 * CLS (Cumulative Layout Shift) 핸들러
 */
function onCLS(metric) {
  performanceMetrics.CLS = metric.value;
  logMetric('CLS', metric.value, PERFORMANCE_BUDGETS.CLS);

  if (metric.value > PERFORMANCE_BUDGETS.CLS) {
    reportPerformanceIssue('CLS', metric);
  }

  trackEvent('web_vitals', {
    metric_name: 'CLS',
    value: metric.value,
    rating: getRating('CLS', metric.value),
  });
}

/**
 * FID (First Input Delay) 핸들러
 */
function onFID(metric) {
  performanceMetrics.FID = metric.value;
  logMetric('FID', metric.value, PERFORMANCE_BUDGETS.FID);

  if (metric.value > PERFORMANCE_BUDGETS.FID) {
    reportPerformanceIssue('FID', metric);
  }

  trackEvent('web_vitals', {
    metric_name: 'FID',
    value: metric.value,
    rating: getRating('FID', metric.value),
  });
}

/**
 * LCP (Largest Contentful Paint) 핸들러
 */
function onLCP(metric) {
  performanceMetrics.LCP = metric.value;
  logMetric('LCP', metric.value, PERFORMANCE_BUDGETS.LCP);

  if (metric.value > PERFORMANCE_BUDGETS.LCP) {
    reportPerformanceIssue('LCP', metric);
  }

  trackEvent('web_vitals', {
    metric_name: 'LCP',
    value: metric.value,
    rating: getRating('LCP', metric.value),
  });
}

/**
 * FCP (First Contentful Paint) 핸들러
 */
function onFCP(metric) {
  performanceMetrics.FCP = metric.value;
  logMetric('FCP', metric.value, PERFORMANCE_BUDGETS.FCP);

  trackEvent('web_vitals', {
    metric_name: 'FCP',
    value: metric.value,
    rating: getRating('FCP', metric.value),
  });
}

/**
 * TTFB (Time to First Byte) 핸들러
 */
function onTTFB(metric) {
  performanceMetrics.TTFB = metric.value;
  logMetric('TTFB', metric.value, PERFORMANCE_BUDGETS.TTFB);

  trackEvent('web_vitals', {
    metric_name: 'TTFB',
    value: metric.value,
    rating: getRating('TTFB', metric.value),
  });
}

/**
 * 메트릭 로깅
 */
function logMetric(name, value, budget) {
  const status = value <= budget ? '✅' : '❌';
  const percentage = ((value / budget) * 100).toFixed(1);

  if (debug) {
    console.info(`${status} ${name}: ${value.toFixed(2)}ms (${percentage}% of budget ${budget}ms)`);
  }

  // Sentry 브레드크럼 추가
  addBreadcrumb({
    category: 'performance',
    message: `${name}: ${value.toFixed(2)}ms`,
    level: value <= budget ? 'info' : 'warning',
    data: {
      metric: name,
      value,
      budget,
      percentage,
    },
  });
}

/**
 * 성능 등급 판정
 */
function getRating(metric, value) {
  const thresholds = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
  };

  const threshold = thresholds[metric];
  if (!threshold) {
    return 'unknown';
  }

  if (value <= threshold.good) {
    return 'good';
  }
  if (value <= threshold.poor) {
    return 'needs-improvement';
  }
  return 'poor';
}

/**
 * 성능 문제 리포트
 */
function reportPerformanceIssue(metric, data) {
  const error = new Error(`Performance budget exceeded for ${metric}`);
  reportError(error, {
    component: 'performance',
    action: 'budget_exceeded',
    extra: {
      metric,
      value: data.value,
      budget: PERFORMANCE_BUDGETS[metric],
      entries: data.entries,
    },
  });
}

/**
 * 페이지 로드 성능 측정
 */
function measurePageLoadPerformance() {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];

      if (perfData) {
        const metrics = {
          dns: perfData.domainLookupEnd - perfData.domainLookupStart,
          tcp: perfData.connectEnd - perfData.connectStart,
          request: perfData.responseStart - perfData.requestStart,
          response: perfData.responseEnd - perfData.responseStart,
          dom: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          load: perfData.loadEventEnd - perfData.loadEventStart,
          total: perfData.loadEventEnd - perfData.fetchStart,
        };

        if (debug) {
          console.info('Page Load Performance:', metrics);
        }

        trackEvent('page_load_performance', metrics);
      }
    }, 0);
  });
}

/**
 * 리소스 타이밍 모니터링
 */
function observeResourceTiming() {
  if (!('PerformanceObserver' in window)) {
    return;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        if (entry.duration > 1000) {
          // 1초 이상 걸린 리소스 추적
          trackEvent('slow_resource', {
            name: entry.name,
            type: entry.initiatorType,
            duration: entry.duration,
            size: entry.transferSize || 0,
          });
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  } catch (error) {
    console.error('Failed to observe resource timing:', error);
  }
}

/**
 * Long Tasks 모니터링
 */
function observeLongTasks() {
  if (!('PerformanceObserver' in window)) {
    return;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        if (entry.duration > 50) {
          // 50ms 이상의 Long Task
          addBreadcrumb({
            category: 'performance',
            message: `Long task detected: ${entry.duration.toFixed(2)}ms`,
            level: 'warning',
            data: {
              duration: entry.duration,
              startTime: entry.startTime,
            },
          });

          if (entry.duration > 100) {
            trackEvent('long_task', {
              duration: entry.duration,
              startTime: entry.startTime,
            });
          }
        }
      });
    });

    observer.observe({ entryTypes: ['longtask'] });
  } catch (error) {
    console.error('Failed to observe long tasks:', error);
  }
}

/**
 * 현재 성능 메트릭 가져오기
 */
export function getPerformanceMetrics() {
  return {
    ...performanceMetrics,
    timestamp: Date.now(),
  };
}

/**
 * 성능 점수 계산 (0-100)
 */
export function calculatePerformanceScore() {
  const weights = {
    LCP: 0.25,
    FID: 0.25,
    CLS: 0.25,
    FCP: 0.15,
    TTFB: 0.1,
  };

  let score = 0;
  let totalWeight = 0;

  Object.entries(weights).forEach(([metric, weight]) => {
    const value = performanceMetrics[metric];
    const budget = PERFORMANCE_BUDGETS[metric];

    if (value !== null) {
      const metricScore = Math.max(0, Math.min(100, (1 - value / budget) * 100));
      score += metricScore * weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? Math.round(score / totalWeight) : null;
}

/**
 * 성능 리포트 생성
 */
export function generatePerformanceReport() {
  const score = calculatePerformanceScore();
  const report = {
    score,
    metrics: performanceMetrics,
    budgets: PERFORMANCE_BUDGETS,
    timestamp: new Date().toISOString(),
  };

  if (debug) {
    console.info('Performance Report:', report);
  }

  return report;
}
