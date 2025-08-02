/**
 * Vitest 테스트 환경 설정
 */

import '@testing-library/jest-dom';

// 전역 모의 함수 및 설정
global.ResizeObserver = class ResizeObserver {
  observe() {
    // ResizeObserver mock
  }
  unobserve() {
    // ResizeObserver mock
  }
  disconnect() {
    // ResizeObserver mock
  }
};

// localStorage 모의 구현
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// sessionStorage 모의 구현
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = sessionStorageMock;

// console 메서드 모의 (필요시 테스트에서 사용)
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// 테스트 환경 설정 완료 로그
console.info('Test environment setup completed');
