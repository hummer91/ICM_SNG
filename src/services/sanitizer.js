/**
 * HTML Sanitization 서비스
 * @module services/sanitizer
 */

import DOMPurify from 'dompurify';
import { debug } from '../config/environment.js';
import { reportError } from './sentry.js';

/**
 * DOMPurify 설정
 */
const DOMPURIFY_CONFIG = {
  // 허용할 HTML 태그
  ALLOWED_TAGS: [
    'b',
    'i',
    'em',
    'strong',
    'a',
    'p',
    'br',
    'span',
    'div',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'blockquote',
    'code',
    'pre',
    'img',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
  ],

  // 허용할 속성
  ALLOWED_ATTR: [
    'href',
    'src',
    'alt',
    'title',
    'class',
    'id',
    'style',
    'width',
    'height',
    'target',
    'rel',
  ],

  // 허용할 URI 스킴
  ALLOWED_URI_REGEXP:
    /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i,

  // data: URI 허용 여부
  ALLOW_DATA_ATTR: false,

  // 알 수 없는 프로토콜 허용 여부
  ALLOW_UNKNOWN_PROTOCOLS: false,

  // 안전한 타겟 설정
  ADD_ATTR: ['target'],

  // 스타일 속성 허용 (Linear Design System)
  ALLOW_STYLE_ATTR: true,
};

/**
 * 포커 게임 특화 설정
 */
const POKER_CONFIG = {
  // 포커 관련 추가 허용 클래스
  ALLOWED_CLASSES: {
    span: ['suit-spades', 'suit-hearts', 'suit-diamonds', 'suit-clubs', 'rank', 'card'],
    div: ['player-card', 'community-cards', 'pot-size', 'chip-count'],
    img: ['card-image', 'chip-image'],
  },

  // 포커 기호 매핑
  SUIT_SYMBOLS: {
    s: '♠',
    h: '♥',
    d: '♦',
    c: '♣',
  },
};

/**
 * Sanitizer 클래스
 */
class Sanitizer {
  constructor() {
    this.purify = DOMPurify;
    this.setupHooks();
  }

  /**
   * DOMPurify 훅 설정
   */
  setupHooks() {
    // 클래스 속성 검증 훅
    this.purify.addHook('uponSanitizeAttribute', (node, data) => {
      if (data.attrName === 'class') {
        const allowedClasses = POKER_CONFIG.ALLOWED_CLASSES[node.tagName.toLowerCase()];
        if (allowedClasses) {
          const classes = data.attrValue.split(' ');
          const filteredClasses = classes.filter(
            (cls) => allowedClasses.includes(cls) || cls.startsWith('linear-'),
          );
          data.attrValue = filteredClasses.join(' ');
        }
      }
    });

    // 링크 보안 훅
    this.purify.addHook('afterSanitizeAttributes', (node) => {
      if ('target' in node) {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }

  /**
   * HTML 문자열 정화
   *
   * @param {string} dirty - 정화할 HTML 문자열
   * @param {Object} options - 추가 옵션
   * @returns {string} 정화된 HTML 문자열
   */
  sanitize(dirty, options = {}) {
    try {
      const config = { ...DOMPURIFY_CONFIG, ...options };
      const clean = this.purify.sanitize(dirty, config);

      if (debug && dirty !== clean) {
        console.info('Content was sanitized', {
          original: dirty.substring(0, 100),
          sanitized: clean.substring(0, 100),
        });
      }

      return clean;
    } catch (error) {
      reportError(error, {
        component: 'sanitizer',
        action: 'sanitize',
        extra: { inputLength: dirty?.length || 0 },
      });
      return '';
    }
  }

  /**
   * 텍스트만 추출 (HTML 태그 제거)
   *
   * @param {string} dirty - 정화할 HTML 문자열
   * @returns {string} 텍스트만 추출된 문자열
   */
  sanitizeText(dirty) {
    try {
      return this.purify.sanitize(dirty, { ALLOWED_TAGS: [] });
    } catch (error) {
      reportError(error, {
        component: 'sanitizer',
        action: 'sanitizeText',
      });
      return '';
    }
  }

  /**
   * 포커 카드 표기 변환
   *
   * @param {string} text - 변환할 텍스트 (예: "As", "Kh")
   * @returns {string} HTML로 변환된 카드 표기
   */
  sanitizePokerNotation(text) {
    // 카드 표기 패턴 (예: As, Kh, 9d, 2c)
    const cardPattern = /\b([AKQJT2-9])([shdc])\b/g;

    const html = text.replace(cardPattern, (match, rank, suit) => {
      const suitSymbol = POKER_CONFIG.SUIT_SYMBOLS[suit] || suit;
      const suitClass = `suit-${
        suit === 's' ? 'spades' : suit === 'h' ? 'hearts' : suit === 'd' ? 'diamonds' : 'clubs'
      }`;
      return `<span class="poker-card"><span class="rank">${rank}</span><span class="${suitClass}">${suitSymbol}</span></span>`;
    });

    return this.sanitize(html, {
      ALLOWED_TAGS: ['span'],
      ALLOWED_ATTR: ['class'],
    });
  }

  /**
   * URL 정화
   *
   * @param {string} url - 정화할 URL
   * @returns {string} 정화된 URL 또는 빈 문자열
   */
  sanitizeUrl(url) {
    try {
      const cleaned = this.purify.sanitize(url, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });

      // URL 유효성 검사
      const urlObj = new URL(cleaned);
      const allowedProtocols = ['http:', 'https:', 'mailto:'];

      if (!allowedProtocols.includes(urlObj.protocol)) {
        return '';
      }

      return cleaned;
    } catch (error) {
      // 유효하지 않은 URL
      return '';
    }
  }

  /**
   * 스타일 속성 정화
   *
   * @param {string} style - 정화할 스타일 문자열
   * @returns {string} 정화된 스타일 문자열
   */
  sanitizeStyle(style) {
    // 위험한 스타일 속성 제거
    const dangerousProps = [
      'javascript:',
      'expression',
      'vbscript:',
      'onload',
      'onerror',
      '@import',
      'behavior',
      '-moz-binding',
    ];

    let cleanStyle = style;
    dangerousProps.forEach((prop) => {
      const regex = new RegExp(prop, 'gi');
      cleanStyle = cleanStyle.replace(regex, '');
    });

    return cleanStyle;
  }

  /**
   * 숫자 입력 정화
   *
   * @param {*} input - 정화할 입력값
   * @param {Object} options - 옵션 (min, max, decimals)
   * @returns {number|null} 정화된 숫자 또는 null
   */
  sanitizeNumber(input, options = {}) {
    const { min = -Infinity, max = Infinity, decimals = 2 } = options;

    const num = parseFloat(input);

    if (isNaN(num)) {
      return null;
    }

    // 범위 제한
    const bounded = Math.min(Math.max(num, min), max);

    // 소수점 자리수 제한
    return parseFloat(bounded.toFixed(decimals));
  }

  /**
   * 포커 액션 입력 정화
   *
   * @param {string} action - 액션 문자열
   * @returns {string|null} 유효한 액션 또는 null
   */
  sanitizePokerAction(action) {
    const validActions = ['fold', 'check', 'call', 'raise', 'all-in'];
    const cleaned = action.toLowerCase().trim();

    return validActions.includes(cleaned) ? cleaned : null;
  }

  /**
   * 플레이어 이름 정화
   *
   * @param {string} name - 플레이어 이름
   * @returns {string} 정화된 이름
   */
  sanitizePlayerName(name) {
    // 알파벳, 숫자, 공백, 하이픈, 언더스코어만 허용
    const cleaned = name.replace(/[^a-zA-Z0-9\s_-]/g, '');

    // 최대 길이 제한
    return cleaned.substring(0, 20).trim();
  }
}

// 싱글톤 인스턴스
const sanitizer = new Sanitizer();

// 내보내기
export default sanitizer;

// 개별 함수 내보내기
export const {
  sanitize,
  sanitizeText,
  sanitizePokerNotation,
  sanitizeUrl,
  sanitizeStyle,
  sanitizeNumber,
  sanitizePokerAction,
  sanitizePlayerName,
} = {
  sanitize: sanitizer.sanitize.bind(sanitizer),
  sanitizeText: sanitizer.sanitizeText.bind(sanitizer),
  sanitizePokerNotation: sanitizer.sanitizePokerNotation.bind(sanitizer),
  sanitizeUrl: sanitizer.sanitizeUrl.bind(sanitizer),
  sanitizeStyle: sanitizer.sanitizeStyle.bind(sanitizer),
  sanitizeNumber: sanitizer.sanitizeNumber.bind(sanitizer),
  sanitizePokerAction: sanitizer.sanitizePokerAction.bind(sanitizer),
  sanitizePlayerName: sanitizer.sanitizePlayerName.bind(sanitizer),
};
