/**
 * ICM 포커 앱 E2E 테스트 유틸리티
 */

/**
 * 포커 핸드 표기법 유틸리티
 */
export const PokerHands = {
  /**
   * 핸드 강도 비교 (ICM 계산용)
   */
  getHandStrength(hand) {
    const handStrengths = {
      AA: 100,
      KK: 95,
      QQ: 90,
      JJ: 85,
      TT: 80,
      AKs: 78,
      99: 75,
      AQs: 72,
      AKo: 70,
      AJs: 68,
      88: 65,
      ATs: 62,
      AQo: 60,
      A9s: 58,
      KQs: 55,
      // ... 더 많은 핸드 강도 정의
    };
    return handStrengths[hand] || 0;
  },

  /**
   * 수트 핸드인지 확인
   */
  isSuited(hand) {
    return hand.includes('s');
  },

  /**
   * 포켓 페어인지 확인
   */
  isPocketPair(hand) {
    return hand.length === 2 && hand[0] === hand[1];
  },
};

/**
 * ICM 계산 테스트 유틸리티
 */
export const ICMUtils = {
  /**
   * 기본 ICM 상황 검증
   */
  validateICMSituation(scenario) {
    const { stacks, heroPosition, blindLevel } = scenario.situation;

    // 스택이 모두 양수인지 확인
    const stackValues = Object.values(stacks);
    if (stackValues.some((stack) => stack < 0)) {
      throw new Error('Invalid stack values - negative stacks found');
    }

    // 블라인드 레벨 검증
    if (blindLevel && blindLevel.big <= blindLevel.small) {
      throw new Error('Invalid blind structure - big blind must be larger than small blind');
    }

    // 포지션 검증
    const validPositions = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];
    if (!validPositions.includes(heroPosition)) {
      throw new Error(`Invalid hero position: ${heroPosition}`);
    }

    return true;
  },

  /**
   * EV 계산 결과 검증
   */
  validateEVCalculation(icmAnalysis) {
    const { pushEV, foldEV } = icmAnalysis;

    if (typeof pushEV !== 'number' || typeof foldEV !== 'number') {
      throw new Error('EV values must be numbers');
    }

    if (pushEV < -1 || pushEV > 1 || foldEV < -1 || foldEV > 1) {
      throw new Error('EV values should be between -1 and 1');
    }

    return Math.abs(pushEV - foldEV);
  },
};

/**
 * 시나리오 테스트 헬퍼
 */
export const ScenarioHelpers = {
  /**
   * 테스트용 기본 시나리오 생성
   */
  createTestScenario(overrides = {}) {
    return {
      id: 'test_scenario_001',
      title: 'Test Scenario',
      description: 'Test scenario for E2E testing',
      difficulty: 'beginner',
      situation: {
        heroPosition: 'BTN',
        heroCards: 'AKs',
        stacks: {
          UTG: 1000,
          MP: 1200,
          CO: 1500,
          BTN: 1500, // HERO
          SB: 800,
          BB: 1100,
          HERO: 1500,
        },
        positions: ['UTG', 'MP', 'CO', 'HERO(BTN)', 'SB', 'BB'],
        actions: [
          { position: 'UTG', action: 'fold' },
          { position: 'MP', action: 'fold' },
          { position: 'CO', action: 'fold' },
        ],
        potSize: 75,
        blindLevel: {
          small: 25,
          big: 50,
        },
        actionToHero: 'Folds to Hero on the Button',
      },
      correctAnswer: 'push',
      explanation: {
        short: 'AKs is a strong pushing hand',
        detailed: 'With AKs in position and short stacks, pushing is optimal',
      },
      icmAnalysis: {
        pushEV: 0.156,
        foldEV: 0.125,
        evDifference: 0.031,
      },
      ...overrides,
    };
  },

  /**
   * 다양한 난이도의 테스트 시나리오 생성
   */
  createScenariosByDifficulty() {
    return {
      beginner: this.createTestScenario({
        difficulty: 'beginner',
        situation: {
          heroCards: 'AA',
          correctAnswer: 'push',
        },
      }),
      intermediate: this.createTestScenario({
        difficulty: 'intermediate',
        situation: {
          heroCards: 'A9s',
          correctAnswer: 'fold',
        },
      }),
      advanced: this.createTestScenario({
        difficulty: 'advanced',
        situation: {
          heroCards: '76s',
          correctAnswer: 'fold',
        },
      }),
    };
  },
};

/**
 * 브라우저 상호작용 헬퍼
 */
export const InteractionHelpers = {
  /**
   * 요소가 보일 때까지 대기하고 클릭
   */
  async waitAndClick(page, selector, timeout = 5000) {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    await page.click(selector);
  },

  /**
   * 텍스트 내용이 변경될 때까지 대기
   */
  async waitForTextChange(page, selector, expectedText, timeout = 5000) {
    await page.waitForFunction(
      ({ selector, expectedText }) => {
        const element = document.querySelector(selector);
        return element && element.textContent.includes(expectedText);
      },
      { selector, expectedText },
      { timeout },
    );
  },

  /**
   * 로컬스토리지 데이터 설정
   */
  async setLocalStorage(page, key, value) {
    await page.evaluate(
      ({ key, value }) => {
        localStorage.setItem(key, JSON.stringify(value));
      },
      { key, value },
    );
  },

  /**
   * 로컬스토리지 데이터 가져오기
   */
  getLocalStorage(page, key) {
    return page.evaluate((key) => {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }, key);
  },
};

/**
 * 성능 측정 헬퍼
 */
export const PerformanceHelpers = {
  /**
   * 페이지 로드 시간 측정
   */
  async measurePageLoadTime(page) {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    return endTime - startTime;
  },

  /**
   * ICM 계산 시간 측정
   */
  measureICMCalculationTime(page) {
    return page.evaluate(() => {
      const startTime = performance.now();

      // ICM 계산 실행 (실제 앱의 계산 함수 호출)
      if (window.ICMCalculator && window.ICMCalculator.calculate) {
        window.ICMCalculator.calculate();
      }

      const endTime = performance.now();
      return endTime - startTime;
    });
  },

  /**
   * 메모리 사용량 측정
   */
  measureMemoryUsage(page) {
    return page.evaluate(() => {
      if (performance.memory) {
        return {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
        };
      }
      return null;
    });
  },
};

/**
 * 디버깅 헬퍼
 */
export const DebugHelpers = {
  /**
   * 콘솔 로그 캡처
   */
  setupConsoleCapture(page) {
    const logs = [];
    page.on('console', (msg) => {
      logs.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString(),
      });
    });
    return logs;
  },

  /**
   * 네트워크 오류 캡처
   */
  setupNetworkErrorCapture(page) {
    const errors = [];
    page.on('requestfailed', (request) => {
      errors.push({
        url: request.url(),
        failure: request.failure(),
        timestamp: new Date().toISOString(),
      });
    });
    return errors;
  },

  /**
   * 스크린샷 저장 (디버깅용)
   */
  async saveDebugScreenshot(page, testName, stepName) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `debug-${testName}-${stepName}-${timestamp}.png`;
    await page.screenshot({
      path: `test-results/screenshots/${filename}`,
      fullPage: true,
    });
    return filename;
  },
};
