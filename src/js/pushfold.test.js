/**
 * Push/Fold 계산기 테스트
 * Nash Equilibrium 범위 계산과 ICM 조정 검증
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  PushFoldCalculator,
  POSITIONS,
  ACTIONS,
  isPocketPair,
  isSuited,
  isOffsuit,
  rangeToPercentage,
  getQuickRecommendation,
} from './pushfold.js';

describe('Push/Fold Calculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new PushFoldCalculator();
  });

  describe('기본 기능', () => {
    it('PushFoldCalculator 인스턴스가 생성되어야 함', () => {
      expect(calculator).toBeInstanceOf(PushFoldCalculator);
      expect(calculator.icmCalculator).toBeDefined();
    });

    it('ranges 캐시가 초기화되어야 함', () => {
      expect(calculator.ranges).toBeInstanceOf(Map);
      expect(calculator.ranges.size).toBe(0);
    });
  });

  describe('상황 유효성 검사', () => {
    it('유효한 상황을 검증해야 함', () => {
      const validSituation = {
        stacks: [10, 8, 12, 15, 6, 9],
        position: POSITIONS.BTN,
        playerIndex: 0,
        previousActions: [],
      };

      expect(() => {
        calculator.validateSituation(validSituation);
      }).not.toThrow();
    });

    it('잘못된 스택 배열에 대해 에러를 던져야 함', () => {
      const invalidSituation = {
        stacks: [10],
        position: POSITIONS.BTN,
        playerIndex: 0,
      };

      expect(() => {
        calculator.validateSituation(invalidSituation);
      }).toThrow('스택 배열이 유효하지 않습니다.');
    });

    it('잘못된 포지션에 대해 에러를 던져야 함', () => {
      const invalidSituation = {
        stacks: [10, 8, 12],
        position: 'INVALID',
        playerIndex: 0,
      };

      expect(() => {
        calculator.validateSituation(invalidSituation);
      }).toThrow('유효하지 않은 포지션입니다.');
    });

    it('잘못된 플레이어 인덱스에 대해 에러를 던져야 함', () => {
      const invalidSituation = {
        stacks: [10, 8, 12],
        position: POSITIONS.BTN,
        playerIndex: 5,
      };

      expect(() => {
        calculator.validateSituation(invalidSituation);
      }).toThrow('플레이어 인덱스가 유효하지 않습니다.');
    });

    it('스택이 0인 플레이어에 대해 에러를 던져야 함', () => {
      const invalidSituation = {
        stacks: [0, 8, 12],
        position: POSITIONS.BTN,
        playerIndex: 0,
      };

      expect(() => {
        calculator.validateSituation(invalidSituation);
      }).toThrow('현재 플레이어의 스택이 0 이하입니다.');
    });
  });

  describe('Push 범위 계산', () => {
    it('BTN 포지션에서 짧은 스택일 때 넓은 범위를 반환해야 함', () => {
      const situation = {
        stacks: [8, 10, 12, 15, 16, 14], // 8BB 스택
        position: POSITIONS.BTN,
        playerIndex: 0,
        previousActions: [],
      };

      const pushRange = calculator.calculatePushRange(situation);

      expect(Array.isArray(pushRange)).toBe(true);
      expect(pushRange.length).toBeGreaterThan(50); // 넓은 범위 기대
      expect(pushRange).toContain('AA'); // 프리미엄 핸드 포함
      expect(pushRange).toContain('22'); // 작은 포켓페어도 포함
    });

    it('UTG 포지션에서 같은 스택일 때 더 타이트한 범위를 반환해야 함', () => {
      const btnSituation = {
        stacks: [10, 12, 15, 16, 14, 8],
        position: POSITIONS.BTN,
        playerIndex: 0,
        previousActions: [],
      };

      const utgSituation = {
        stacks: [10, 12, 15, 16, 14, 8],
        position: POSITIONS.UTG,
        playerIndex: 0,
        previousActions: [],
      };

      const btnRange = calculator.calculatePushRange(btnSituation);
      const utgRange = calculator.calculatePushRange(utgSituation);

      expect(utgRange.length).toBeLessThan(btnRange.length);
    });

    it('스택이 깊을수록 타이트한 범위를 반환해야 함', () => {
      const shortStackSituation = {
        stacks: [5, 10, 12, 15, 16, 14],
        position: POSITIONS.BTN,
        playerIndex: 0,
        previousActions: [],
      };

      const deepStackSituation = {
        stacks: [20, 10, 12, 15, 16, 14],
        position: POSITIONS.BTN,
        playerIndex: 0,
        previousActions: [],
      };

      const shortRange = calculator.calculatePushRange(shortStackSituation);
      const deepRange = calculator.calculatePushRange(deepStackSituation);

      expect(deepRange.length).toBeLessThan(shortRange.length);
    });

    it('이전에 레이즈가 있었을 때 범위가 줄어들어야 함', () => {
      const noActionSituation = {
        stacks: [10, 12, 15, 16, 14, 8],
        position: POSITIONS.BTN,
        playerIndex: 0,
        previousActions: [],
      };

      const raiseActionSituation = {
        stacks: [10, 12, 15, 16, 14, 8],
        position: POSITIONS.BTN,
        playerIndex: 0,
        previousActions: [{ type: ACTIONS.RAISE, position: POSITIONS.UTG }],
      };

      const noActionRange = calculator.calculatePushRange(noActionSituation);
      const raiseActionRange = calculator.calculatePushRange(raiseActionSituation);

      expect(raiseActionRange.length).toBeLessThan(noActionRange.length);
    });
  });

  describe('유효 스택 계산', () => {
    it('자신과 상대 중 작은 스택을 반환해야 함', () => {
      const stacks = [10, 15, 8, 20];
      const playerIndex = 0;

      const effectiveStack = calculator.calculateEffectiveStack(stacks, playerIndex);

      // 플레이어 0의 스택은 10, 가장 큰 상대는 20이므로 10이 유효 스택
      expect(effectiveStack).toBe(10);
    });

    it('자신이 가장 큰 스택일 때 두 번째 큰 스택을 기준으로 해야 함', () => {
      const stacks = [25, 15, 8, 12];
      const playerIndex = 0;

      const effectiveStack = calculator.calculateEffectiveStack(stacks, playerIndex);

      // 플레이어 0의 스택은 25, 가장 큰 상대는 15이므로 15가 유효 스택
      expect(effectiveStack).toBe(15);
    });
  });

  describe('다음 활성 플레이어 찾기', () => {
    it('다음 활성 플레이어를 올바르게 찾아야 함', () => {
      const stacks = [10, 0, 8, 15]; // 플레이어 1은 탈락
      const currentIndex = 0;

      const nextPlayer = calculator.getNextActivePlayer(stacks, currentIndex);

      expect(nextPlayer).toBe(2); // 플레이어 1은 스택이 0이므로 플레이어 2
    });

    it('마지막 플레이어일 때 순환해서 찾아야 함', () => {
      const stacks = [10, 8, 15, 12];
      const currentIndex = 3;

      const nextPlayer = calculator.getNextActivePlayer(stacks, currentIndex);

      expect(nextPlayer).toBe(0); // 순환해서 플레이어 0
    });
  });

  describe('핸드 EV 계산', () => {
    it('AA는 항상 높은 EV를 가져야 함', () => {
      const situation = {
        stacks: [10, 12, 15, 16, 14, 8],
        position: POSITIONS.BTN,
        playerIndex: 0,
        previousActions: [],
      };

      const aaEV = calculator.calculateHandPushEV('AA', situation);

      expect(aaEV.hand).toBe('AA');
      expect(aaEV.evDifference).toBeGreaterThan(0); // AA는 항상 profitable
      expect(aaEV.profitable).toBe(true);
      expect(aaEV.winProbability).toBeGreaterThan(0.8); // 80% 이상 승률
    });

    it('72o는 대부분의 상황에서 negative EV를 가져야 함', () => {
      const situation = {
        stacks: [15, 12, 15, 16, 14, 8], // 깊은 스택
        position: POSITIONS.UTG, // 나쁜 포지션
        playerIndex: 0,
        previousActions: [],
      };

      const worstHandEV = calculator.calculateHandPushEV('72o', situation);

      expect(worstHandEV.evDifference).toBeLessThan(0); // negative EV
      expect(worstHandEV.profitable).toBe(false);
    });

    it('EV 결과 객체가 올바른 구조를 가져야 함', () => {
      const situation = {
        stacks: [10, 12, 15, 16, 14, 8],
        position: POSITIONS.BTN,
        playerIndex: 0,
        previousActions: [],
      };

      const handEV = calculator.calculateHandPushEV('AKs', situation);

      expect(handEV).toHaveProperty('hand');
      expect(handEV).toHaveProperty('currentEquity');
      expect(handEV).toHaveProperty('pushEquity');
      expect(handEV).toHaveProperty('evDifference');
      expect(handEV).toHaveProperty('winProbability');
      expect(handEV).toHaveProperty('callProbability');
      expect(handEV).toHaveProperty('profitable');

      expect(typeof handEV.currentEquity).toBe('number');
      expect(typeof handEV.pushEquity).toBe('number');
      expect(typeof handEV.evDifference).toBe('number');
      expect(typeof handEV.winProbability).toBe('number');
      expect(typeof handEV.callProbability).toBe('number');
      expect(typeof handEV.profitable).toBe('boolean');
    });
  });

  describe('전체 범위 EV 계산', () => {
    it('169개의 핸드 EV를 모두 계산해야 함', () => {
      const situation = {
        stacks: [10, 12, 15, 16, 14, 8],
        position: POSITIONS.BTN,
        playerIndex: 0,
        previousActions: [],
      };

      const fullRangeEV = calculator.calculateFullRangeEV(situation);

      expect(fullRangeEV).toHaveLength(169); // 13x13 = 169 핸드

      // EV 순으로 정렬되어 있는지 확인
      for (let i = 1; i < fullRangeEV.length; i++) {
        expect(fullRangeEV[i].evDifference).toBeLessThanOrEqual(fullRangeEV[i - 1].evDifference);
      }

      // AA가 가장 높은 EV를 가져야 함
      expect(fullRangeEV[0].hand).toBe('AA');
    });

    it('각 핸드가 올바른 매트릭스 좌표를 가져야 함', () => {
      const situation = {
        stacks: [10, 12, 15, 16, 14, 8],
        position: POSITIONS.BTN,
        playerIndex: 0,
        previousActions: [],
      };

      const fullRangeEV = calculator.calculateFullRangeEV(situation);

      // AA의 좌표 확인
      const aaResult = fullRangeEV.find((result) => result.hand === 'AA');
      expect(aaResult.row).toBe(0);
      expect(aaResult.col).toBe(0);

      // 22의 좌표 확인
      const deuceResult = fullRangeEV.find((result) => result.hand === '22');
      expect(deuceResult.row).toBe(12);
      expect(deuceResult.col).toBe(12);
    });
  });

  describe('콜 확률 추정', () => {
    it('짧은 스택일 때 높은 콜 확률을 반환해야 함', () => {
      const shortStackSituation = {
        stacks: [5, 8, 12, 15, 16, 14],
        position: POSITIONS.BTN,
        playerIndex: 0,
      };

      const deepStackSituation = {
        stacks: [20, 8, 12, 15, 16, 14],
        position: POSITIONS.BTN,
        playerIndex: 0,
      };

      const shortCallProb = calculator.estimateCallProbability(shortStackSituation, 'AKs');
      const deepCallProb = calculator.estimateCallProbability(deepStackSituation, 'AKs');

      expect(shortCallProb).toBeGreaterThan(deepCallProb);
    });

    it('콜 확률이 0-1 범위 내에 있어야 함', () => {
      const situation = {
        stacks: [10, 12, 15, 16, 14, 8],
        position: POSITIONS.BTN,
        playerIndex: 0,
      };

      const callProb = calculator.estimateCallProbability(situation, 'AA');

      expect(callProb).toBeGreaterThanOrEqual(0);
      expect(callProb).toBeLessThanOrEqual(1);
    });
  });

  describe('캐싱 시스템', () => {
    it('동일한 상황에 대해 캐싱된 결과를 반환해야 함', () => {
      const situation = {
        stacks: [10, 12, 15, 16, 14, 8],
        position: POSITIONS.BTN,
        playerIndex: 0,
        previousActions: [],
      };

      const firstCall = calculator.calculatePushRange(situation);
      const secondCall = calculator.calculatePushRange(situation);

      // 같은 참조를 반환해야 함 (캐싱됨)
      expect(firstCall).toBe(secondCall);
      expect(calculator.ranges.size).toBe(1);
    });

    it('캐시를 올바르게 클리어해야 함', () => {
      const situation = {
        stacks: [10, 12, 15, 16, 14, 8],
        position: POSITIONS.BTN,
        playerIndex: 0,
        previousActions: [],
      };

      calculator.calculatePushRange(situation);
      expect(calculator.ranges.size).toBe(1);

      calculator.clearCache();
      expect(calculator.ranges.size).toBe(0);
    });
  });
});

describe('유틸리티 함수들', () => {
  describe('핸드 타입 검사', () => {
    it('포켓 페어를 올바르게 식별해야 함', () => {
      expect(isPocketPair('AA')).toBe(true);
      expect(isPocketPair('KK')).toBe(true);
      expect(isPocketPair('22')).toBe(true);
      expect(isPocketPair('AK')).toBe(false);
      expect(isPocketPair('AKs')).toBe(false);
      expect(isPocketPair('AKo')).toBe(false);
    });

    it('수티드 핸드를 올바르게 식별해야 함', () => {
      expect(isSuited('AKs')).toBe(true);
      expect(isSuited('72s')).toBe(true);
      expect(isSuited('AKo')).toBe(false);
      expect(isSuited('AA')).toBe(false);
    });

    it('오프수트 핸드를 올바르게 식별해야 함', () => {
      expect(isOffsuit('AKo')).toBe(true);
      expect(isOffsuit('72o')).toBe(true);
      expect(isOffsuit('AKs')).toBe(false);
      expect(isOffsuit('AA')).toBe(false);
    });
  });

  describe('범위 퍼센트 변환', () => {
    it('범위를 올바른 퍼센트로 변환해야 함', () => {
      const emptyRange = [];
      const fullRange = new Array(169).fill('AA'); // 모든 핸드
      const halfRange = new Array(85).fill('AA'); // 절반

      expect(rangeToPercentage(emptyRange)).toBe(0);
      expect(rangeToPercentage(fullRange)).toBeCloseTo(100, 1);
      expect(rangeToPercentage(halfRange)).toBeCloseTo(50.3, 1);
    });
  });

  describe('빠른 추천', () => {
    it('올바른 추천 구조를 반환해야 함', () => {
      const situation = {
        stacks: [8, 12, 15, 16, 14, 10],
        position: POSITIONS.BTN,
        playerIndex: 0,
        previousActions: [],
      };

      const recommendation = getQuickRecommendation(situation);

      expect(recommendation).toHaveProperty('action');
      expect(recommendation).toHaveProperty('range');
      expect(recommendation).toHaveProperty('percentage');
      expect(recommendation).toHaveProperty('confidence');

      expect([ACTIONS.PUSH, ACTIONS.FOLD]).toContain(recommendation.action);
      expect(Array.isArray(recommendation.range)).toBe(true);
      expect(typeof recommendation.percentage).toBe('string');
      expect(['high', 'medium', 'low']).toContain(recommendation.confidence);
    });

    it('짧은 스택에서 PUSH를 추천해야 함', () => {
      const shortStackSituation = {
        stacks: [3, 12, 15, 16, 14, 10], // 매우 짧은 스택
        position: POSITIONS.BTN,
        playerIndex: 0,
        previousActions: [],
      };

      const recommendation = getQuickRecommendation(shortStackSituation);

      expect(recommendation.action).toBe(ACTIONS.PUSH);
      expect(parseFloat(recommendation.percentage)).toBeGreaterThan(50);
    });

    it('깊은 스택에서 타이트한 범위를 추천해야 함', () => {
      const deepStackSituation = {
        stacks: [25, 12, 15, 16, 14, 10], // 깊은 스택
        position: POSITIONS.UTG, // 나쁜 포지션
        playerIndex: 0,
        previousActions: [],
      };

      const recommendation = getQuickRecommendation(deepStackSituation);

      // 깊은 스택 + 나쁜 포지션 = 매우 타이트한 범위
      expect(parseFloat(recommendation.percentage)).toBeLessThan(15);
    });
  });
});

describe('Nash 범위 통합 테스트', () => {
  let calculator;

  beforeEach(() => {
    calculator = new PushFoldCalculator();
  });

  it('다양한 포지션에서 일관된 범위 순서를 유지해야 함', () => {
    const stacks = [10, 12, 15, 16, 14, 8];
    const positions = [POSITIONS.UTG, POSITIONS.MP, POSITIONS.CO, POSITIONS.BTN];
    const ranges = {};

    // 각 포지션별 범위 계산
    positions.forEach((position, index) => {
      const situation = {
        stacks,
        position,
        playerIndex: index,
        previousActions: [],
      };
      ranges[position] = calculator.calculatePushRange(situation);
    });

    // UTG가 가장 타이트하고 BTN이 가장 넓어야 함
    expect(ranges[POSITIONS.UTG].length).toBeLessThanOrEqual(ranges[POSITIONS.MP].length);
    expect(ranges[POSITIONS.MP].length).toBeLessThanOrEqual(ranges[POSITIONS.CO].length);
    expect(ranges[POSITIONS.CO].length).toBeLessThanOrEqual(ranges[POSITIONS.BTN].length);
  });

  it('스택 깊이에 따른 범위 변화가 논리적이어야 함', () => {
    const stackDepths = [3, 5, 8, 12, 20];
    const ranges = {};

    stackDepths.forEach((depth) => {
      const situation = {
        stacks: [depth, 12, 15, 16, 14, 10],
        position: POSITIONS.BTN,
        playerIndex: 0,
        previousActions: [],
      };
      ranges[depth] = calculator.calculatePushRange(situation);
    });

    // 스택이 깊을수록 범위가 줄어들어야 함
    for (let i = 1; i < stackDepths.length; i++) {
      const shallower = stackDepths[i - 1];
      const deeper = stackDepths[i];
      expect(ranges[deeper].length).toBeLessThanOrEqual(ranges[shallower].length);
    }
  });

  it('ICM 압박 상황에서 범위가 적절히 조정되어야 함', () => {
    // 버블 상황 (4명 남음, 3명만 상금)
    const bubbleSituation = {
      stacks: [8, 8, 8, 8], // 모든 플레이어가 비슷한 스택
      position: POSITIONS.BTN,
      playerIndex: 0,
      previousActions: [],
    };

    // 일반 상황
    const normalSituation = {
      stacks: [8, 15, 20, 25, 30, 12], // 다양한 스택 크기
      position: POSITIONS.BTN,
      playerIndex: 0,
      previousActions: [],
    };

    const bubbleRange = calculator.calculatePushRange(bubbleSituation);
    const normalRange = calculator.calculatePushRange(normalSituation);

    // 버블 상황에서는 더 타이트해야 함 (ICM 압박)
    expect(bubbleRange.length).toBeLessThan(normalRange.length);
  });
});
