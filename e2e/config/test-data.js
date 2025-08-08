/**
 * E2E 테스트용 데이터 설정
 */

/**
 * 테스트 시나리오 데이터
 */
export const TestScenarios = {
  // 초보자용 명확한 상황들
  beginner: {
    strongHand: {
      id: 'test_beginner_001',
      title: 'Pocket Aces - Easy Push',
      heroCards: 'AA',
      heroPosition: 'BTN',
      correctAnswer: 'push',
      expectedEV: 0.2
    },
    weakHand: {
      id: 'test_beginner_002', 
      title: 'Weak Hand - Easy Fold',
      heroCards: '72o',
      heroPosition: 'UTG',
      correctAnswer: 'fold',
      expectedEV: -0.1
    }
  },

  // 중급자용 애매한 상황들  
  intermediate: {
    marginalHand: {
      id: 'test_intermediate_001',
      title: 'A9s - Close Decision',
      heroCards: 'A9s', 
      heroPosition: 'CO',
      correctAnswer: 'push',
      expectedEV: 0.05
    },
    positionDependent: {
      id: 'test_intermediate_002',
      title: 'K9s - Position Matters',
      heroCards: 'K9s',
      heroPosition: 'SB',
      correctAnswer: 'fold',
      expectedEV: -0.02
    }
  },

  // 고급자용 복잡한 상황들
  advanced: {
    bubblePlay: {
      id: 'test_advanced_001',
      title: 'Bubble Dynamics - Q7s',
      heroCards: 'Q7s',
      heroPosition: 'BB',
      correctAnswer: 'fold',
      expectedEV: -0.15,
      specialSituation: 'bubble'
    },
    stackDependent: {
      id: 'test_advanced_002',
      title: 'Stack-dependent A3o',
      heroCards: 'A3o',
      heroPosition: 'BTN', 
      correctAnswer: 'push',
      expectedEV: 0.08,
      stackMultiplier: 0.5 // 짧은 스택
    }
  }
};

/**
 * 테스트용 스택 분포 패턴
 */
export const StackDistributions = {
  // 균등한 스택 (토너먼트 초기)
  balanced: {
    UTG: 1500,
    MP: 1500, 
    CO: 1500,
    BTN: 1500,
    SB: 1500,
    BB: 1500,
    HERO: 1500
  },

  // 짧은 스택 상황
  shortStacked: {
    UTG: 1200,
    MP: 1800,
    CO: 2100, 
    BTN: 800, // HERO short
    SB: 1600,
    BB: 1500,
    HERO: 800
  },

  // 버블 상황 (4명 남음)
  bubble: {
    UTG: 0, // eliminated
    MP: 0, // eliminated  
    CO: 3200,
    BTN: 1800, // HERO
    SB: 2500,
    BB: 1500,
    HERO: 1800
  },

  // 칩 리더 상황
  chipLeader: {
    UTG: 1200,
    MP: 800,
    CO: 1100,
    BTN: 3500, // HERO with big stack
    SB: 900,
    BB: 1500,
    HERO: 3500
  }
};

/**
 * 블라인드 레벨 설정
 */
export const BlindLevels = {
  early: { small: 25, big: 50 },
  middle: { small: 50, big: 100 },
  late: { small: 100, big: 200 },
  veryLate: { small: 200, big: 400 }
};

/**
 * 액션 히스토리 패턴
 */
export const ActionPatterns = {
  // 모든 플레이어가 폴드
  foldsToHero: [
    { position: 'UTG', action: 'fold' },
    { position: 'MP', action: 'fold' },
    { position: 'CO', action: 'fold' }
  ],

  // 레이즈가 있는 상황
  raiseInFront: [
    { position: 'UTG', action: 'fold' },
    { position: 'MP', action: 'raise' }
  ],

  // 올인이 있는 상황  
  pushInFront: [
    { position: 'UTG', action: 'push' },
    { position: 'MP', action: 'fold' }
  ],

  // 콜이 있는 상황
  callInFront: [
    { position: 'UTG', action: 'call' },
    { position: 'MP', action: 'fold' }
  ]
};

/**
 * 예상 테스트 결과
 */
export const ExpectedResults = {
  // UI 요소 존재 확인
  uiElements: {
    pushButton: true,
    foldButton: true,
    scenarioTitle: true,
    playerCards: 6, // 6개 플레이어 카드
    heroPosition: 3 // HERO는 항상 3번 위치
  },

  // 성능 기준
  performance: {
    maxPageLoadTime: 3000, // 3초
    maxICMCalculationTime: 100, // 100ms
    maxMemoryUsage: 50, // 50MB
    minFrameRate: 30 // 30fps
  },

  // 기능 동작 확인
  functionality: {
    scenarioLoading: true,
    quizAnswer: true,
    statsTracking: true,
    localStoragePersistence: true
  }
};

/**
 * 테스트 환경 설정
 */
export const TestEnvironment = {
  // 타임아웃 설정
  timeouts: {
    short: 2000,
    medium: 5000, 
    long: 10000,
    veryLong: 30000
  },

  // 재시도 설정
  retries: {
    flaky: 2,
    stable: 0,
    critical: 3
  },

  // 디바이스별 설정
  devices: {
    desktop: {
      viewport: { width: 1280, height: 720 },
      isMobile: false
    },
    tablet: {
      viewport: { width: 768, height: 1024 },
      isMobile: true
    },
    mobile: {
      viewport: { width: 375, height: 667 },
      isMobile: true
    }
  }
};

/**
 * 테스트 데이터 검증 함수들
 */
export const TestDataValidators = {
  /**
   * 시나리오 데이터 유효성 검증
   */
  validateScenario(scenario) {
    const required = ['id', 'title', 'heroCards', 'heroPosition', 'correctAnswer'];
    const missing = required.filter(field => !scenario[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required scenario fields: ${missing.join(', ')}`);
    }
    
    const validPositions = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];
    if (!validPositions.includes(scenario.heroPosition)) {
      throw new Error(`Invalid hero position: ${scenario.heroPosition}`);
    }
    
    const validAnswers = ['push', 'fold'];
    if (!validAnswers.includes(scenario.correctAnswer)) {
      throw new Error(`Invalid correct answer: ${scenario.correctAnswer}`);
    }
    
    return true;
  },

  /**
   * 스택 분포 유효성 검증
   */
  validateStackDistribution(stacks) {
    const positions = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];
    const stackValues = Object.values(stacks);
    
    if (stackValues.some(stack => stack < 0)) {
      throw new Error('Stack values cannot be negative');
    }
    
    if (stackValues.filter(stack => stack > 0).length < 2) {
      throw new Error('At least 2 players must have chips');
    }
    
    return true;
  },

  /**
   * 블라인드 레벨 유효성 검증
   */
  validateBlindLevel(blinds) {
    if (blinds.big <= blinds.small) {
      throw new Error('Big blind must be larger than small blind');
    }
    
    if (blinds.small <= 0 || blinds.big <= 0) {
      throw new Error('Blind values must be positive');
    }
    
    return true;
  }
};