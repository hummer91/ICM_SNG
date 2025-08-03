/**
 * 보안 설정 및 정책
 * @module config/security
 */

import { isProduction, isDevelopment } from './environment.js';

/**
 * Content Security Policy (CSP) 설정
 *
 * @description 각 지시어는 특정 리소스 유형에 대한 로드 정책을 정의합니다.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
 */
export const CSP_DIRECTIVES = {
  // 기본 정책 - 명시되지 않은 모든 리소스에 적용
  'default-src': ["'self'"],

  // 스크립트 소스
  'script-src': [
    "'self'",
    isDevelopment && "'unsafe-inline'", // 개발 환경에서만 인라인 스크립트 허용
    isDevelopment && "'unsafe-eval'", // 개발 환경에서만 eval 허용 (HMR)
    'https://cdn.jsdelivr.net', // 외부 라이브러리 CDN
  ].filter(Boolean),

  // 스타일 소스
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Linear Design System 인라인 스타일 허용
    'https://fonts.googleapis.com',
  ],

  // 이미지 소스
  'img-src': [
    "'self'",
    'data:', // 데이터 URI 허용
    'blob:', // Blob URL 허용
    'https:', // HTTPS 이미지 허용
  ],

  // 폰트 소스
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:', // 인라인 폰트 허용
  ],

  // 연결 가능한 엔드포인트
  'connect-src': [
    "'self'",
    'https://api.icm-sng.com', // API 서버
    'https://*.sentry.io', // Sentry 에러 추적
    'https://app.posthog.com', // PostHog 분석
    'wss://localhost:*', // 개발 환경 WebSocket (HMR)
    isDevelopment && 'ws://localhost:*',
  ].filter(Boolean),

  // 폼 액션 대상
  'form-action': ["'self'"],

  // 프레임 조상 (iframe 임베딩 방지)
  'frame-ancestors': ["'none'"],

  // 기본 URI
  'base-uri': ["'self'"],

  // 객체 소스 (플러그인)
  'object-src': ["'none'"],

  // 미디어 소스
  'media-src': ["'self'"],

  // Worker 소스
  'worker-src': ["'self'", 'blob:'],

  // 프레임 소스
  'frame-src': ["'none'"],

  // 매니페스트 소스
  'manifest-src': ["'self'"],
};

/**
 * CSP 문자열 생성
 * @returns {string} CSP 헤더 값
 */
export function generateCSP() {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}

/**
 * 보안 헤더 설정
 *
 * @description 추가적인 보안 헤더들을 정의합니다.
 */
export const SECURITY_HEADERS = {
  // XSS 보호
  'X-XSS-Protection': '1; mode=block',

  // 콘텐츠 타입 스니핑 방지
  'X-Content-Type-Options': 'nosniff',

  // 클릭재킹 방지
  'X-Frame-Options': 'DENY',

  // HTTPS 강제 (1년)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Referrer 정책
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // 권한 정책 (이전 Feature-Policy)
  'Permissions-Policy': [
    'accelerometer=()',
    'camera=()',
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=()',
    'payment=()',
    'usb=()',
  ].join(', '),
};

/**
 * 메타 태그로 설정할 보안 헤더
 *
 * @description HTML meta 태그로 설정 가능한 보안 정책들
 */
export const META_SECURITY_TAGS = [
  {
    'http-equiv': 'Content-Security-Policy',
    content: generateCSP(),
  },
  {
    name: 'referrer',
    content: 'strict-origin-when-cross-origin',
  },
];

/**
 * CORS 설정
 */
export const CORS_CONFIG = {
  origin: isProduction
    ? ['https://icm-sng.com', 'https://www.icm-sng.com']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24시간
};

/**
 * 신뢰할 수 있는 타입 정책
 *
 * @description DOM XSS 공격 방지를 위한 Trusted Types 정책
 */
export const TRUSTED_TYPES_CONFIG = {
  createHTML: (input) => {
    // DOMPurify를 사용한 HTML 정화
    if (typeof window !== 'undefined' && window.DOMPurify) {
      return window.DOMPurify.sanitize(input);
    }
    return input;
  },
  createScript: () => {
    throw new Error('Dynamic script creation is not allowed');
  },
  createScriptURL: (url) => {
    const allowedOrigins = ['https://cdn.jsdelivr.net', 'https://icm-sng.com'];

    if (allowedOrigins.some((origin) => url.startsWith(origin))) {
      return url;
    }
    throw new Error(`Script URL not allowed: ${url}`);
  },
};

/**
 * 보안 관련 상수
 */
export const SECURITY_CONSTANTS = {
  // 세션 타임아웃 (30분)
  SESSION_TIMEOUT: 30 * 60 * 1000,

  // 최대 로그인 시도 횟수
  MAX_LOGIN_ATTEMPTS: 5,

  // 로그인 시도 제한 시간 (15분)
  LOGIN_LOCKOUT_TIME: 15 * 60 * 1000,

  // 토큰 만료 시간
  TOKEN_EXPIRY: {
    access: 15 * 60, // 15분
    refresh: 7 * 24 * 60 * 60, // 7일
  },

  // 비밀번호 정책
  PASSWORD_POLICY: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
};

/**
 * 보안 유틸리티 함수들
 */
export const SecurityUtils = {
  /**
   * HTML 이스케이프
   * @param {string} str - 이스케이프할 문자열
   * @returns {string} 이스케이프된 문자열
   */
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * URL 파라미터 검증
   * @param {string} param - 검증할 파라미터
   * @returns {boolean} 안전 여부
   */
  isValidUrlParam(param) {
    // 알파벳, 숫자, 하이픈, 언더스코어만 허용
    return /^[a-zA-Z0-9_-]+$/.test(param);
  },

  /**
   * 이메일 검증
   * @param {string} email - 검증할 이메일
   * @returns {boolean} 유효 여부
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * 안전한 JSON 파싱
   * @param {string} jsonString - 파싱할 JSON 문자열
   * @returns {Object|null} 파싱된 객체 또는 null
   */
  safeJsonParse(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('JSON parsing error:', error);
      return null;
    }
  },
};

export default {
  CSP_DIRECTIVES,
  generateCSP,
  SECURITY_HEADERS,
  META_SECURITY_TAGS,
  CORS_CONFIG,
  TRUSTED_TYPES_CONFIG,
  SECURITY_CONSTANTS,
  SecurityUtils,
};
