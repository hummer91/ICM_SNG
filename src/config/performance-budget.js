/**
 * 성능 예산 설정
 *
 * 각 메트릭별 허용 가능한 최대값을 정의
 */

export const PERFORMANCE_BUDGET = {
  // Core Web Vitals
  webVitals: {
    LCP: 2500, // Largest Contentful Paint (ms)
    FID: 100, // First Input Delay (ms)
    CLS: 0.1, // Cumulative Layout Shift (score)
  },

  // 추가 성능 메트릭
  additionalMetrics: {
    FCP: 1800, // First Contentful Paint (ms)
    TTFB: 800, // Time to First Byte (ms)
    TTI: 3800, // Time to Interactive (ms)
    SI: 3400, // Speed Index (ms)
  },

  // 리소스 크기 제한
  resources: {
    totalBundleSize: 500 * 1024, // 500KB
    initialJSSize: 200 * 1024, // 200KB
    initialCSSSize: 50 * 1024, // 50KB
    imageSize: 200 * 1024, // 200KB per image
    fontFileSize: 100 * 1024, // 100KB per font
    totalResourceCount: 50, // 최대 리소스 수
  },

  // 네트워크 성능
  network: {
    apiResponseTime: 200, // API 응답 시간 (ms)
    resourceLoadTime: 1000, // 개별 리소스 로드 시간 (ms)
    totalLoadTime: 3000, // 전체 페이지 로드 시간 (ms)
  },

  // 런타임 성능
  runtime: {
    longTaskThreshold: 50, // Long Task 임계값 (ms)
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
    frameRate: 60, // 목표 FPS
    animationDuration: 300, // 최대 애니메이션 시간 (ms)
  },

  // 모바일 특화 예산
  mobile: {
    LCP: 3000, // 모바일 LCP (ms)
    FID: 150, // 모바일 FID (ms)
    totalSize: 1024 * 1024, // 1MB 총 크기
    initialLoadTime: 5000, // 5초 초기 로드
  },
};

/**
 * 성능 목표 등급
 */
export const PERFORMANCE_RATINGS = {
  excellent: {
    LCP: 1000,
    FID: 50,
    CLS: 0.05,
    score: 90,
  },
  good: {
    LCP: 2500,
    FID: 100,
    CLS: 0.1,
    score: 75,
  },
  needsImprovement: {
    LCP: 4000,
    FID: 300,
    CLS: 0.25,
    score: 50,
  },
  poor: {
    LCP: Infinity,
    FID: Infinity,
    CLS: Infinity,
    score: 0,
  },
};

/**
 * 성능 예산 검증
 */
export function validatePerformanceBudget(metrics) {
  const violations = [];

  // Core Web Vitals 검증
  Object.entries(PERFORMANCE_BUDGET.webVitals).forEach(([key, budget]) => {
    if (metrics[key] > budget) {
      violations.push({
        metric: key,
        actual: metrics[key],
        budget,
        severity: 'high',
      });
    }
  });

  // 추가 메트릭 검증
  Object.entries(PERFORMANCE_BUDGET.additionalMetrics).forEach(([key, budget]) => {
    if (metrics[key] && metrics[key] > budget) {
      violations.push({
        metric: key,
        actual: metrics[key],
        budget,
        severity: 'medium',
      });
    }
  });

  return {
    passed: violations.length === 0,
    violations,
    score: calculatePerformanceScore(metrics),
  };
}

/**
 * 성능 점수 계산
 */
function calculatePerformanceScore(metrics) {
  const weights = {
    LCP: 0.25,
    FID: 0.25,
    CLS: 0.25,
    FCP: 0.15,
    TTFB: 0.1,
  };

  let totalScore = 0;
  let totalWeight = 0;

  Object.entries(weights).forEach(([metric, weight]) => {
    if (metrics[metric] !== undefined) {
      const rating = getMetricRating(metric, metrics[metric]);
      const score =
        rating === 'excellent'
          ? 100
          : rating === 'good'
            ? 75
            : rating === 'needsImprovement'
              ? 50
              : 0;

      totalScore += score * weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
}

/**
 * 메트릭 등급 판정
 */
function getMetricRating(metric, value) {
  for (const [rating, thresholds] of Object.entries(PERFORMANCE_RATINGS)) {
    if (value <= thresholds[metric]) {
      return rating;
    }
  }
  return 'poor';
}

/**
 * 성능 예산 리포트 생성
 */
export function generateBudgetReport(metrics) {
  const validation = validatePerformanceBudget(metrics);

  return {
    timestamp: new Date().toISOString(),
    score: validation.score,
    passed: validation.passed,
    violations: validation.violations,
    metrics: Object.entries(metrics).map(([key, value]) => ({
      name: key,
      value,
      budget: PERFORMANCE_BUDGET.webVitals[key] || PERFORMANCE_BUDGET.additionalMetrics[key],
      rating: getMetricRating(key, value),
    })),
    recommendations: generateRecommendations(validation.violations),
  };
}

/**
 * 성능 개선 권장사항 생성
 */
function generateRecommendations(violations) {
  const recommendations = [];

  violations.forEach(({ metric }) => {
    switch (metric) {
      case 'LCP':
        recommendations.push({
          metric,
          suggestion:
            'Optimize largest content paint by lazy loading images, reducing server response time, and using CDN',
          priority: 'high',
        });
        break;
      case 'FID':
        recommendations.push({
          metric,
          suggestion:
            'Reduce input delay by minimizing JavaScript execution time and breaking up long tasks',
          priority: 'high',
        });
        break;
      case 'CLS':
        recommendations.push({
          metric,
          suggestion:
            'Prevent layout shifts by specifying image dimensions and avoiding dynamic content insertion',
          priority: 'high',
        });
        break;
      case 'FCP':
        recommendations.push({
          metric,
          suggestion:
            'Improve first contentful paint by eliminating render-blocking resources and optimizing CSS',
          priority: 'medium',
        });
        break;
      case 'TTFB':
        recommendations.push({
          metric,
          suggestion:
            'Reduce server response time by using caching, CDN, and optimizing backend performance',
          priority: 'medium',
        });
        break;
    }
  });

  return recommendations;
}
