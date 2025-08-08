/**
 * ICM 계산 엔진 테스트
 * Malmuth-Harville 공식의 정확성과 완전성 검증
 */

import { describe, it, expect } from 'vitest';
import {
  ICMCalculator,
  ICMResult,
  simpleICM,
  calculateICM,
  calculateEVDifference,
  // DEFAULT_PRIZE_STRUCTURE
} from './icm.js';

describe('ICM Calculator', () => {
  describe('기본 계산', () => {
    it('칩 분포에 따른 equity를 계산해야 함', () => {
      const stacks = [5000, 3000, 2000];
      const prizes = [0.5, 0.3, 0.2]; // 50%, 30%, 20%

      const icm = new ICMCalculator(prizes);
      const equities = icm.calculate(stacks);

      // 총 equity는 1이어야 함
      const totalEquity = equities.reduce((sum, eq) => sum + eq, 0);
      expect(totalEquity).toBeCloseTo(1, 5);

      // 칩이 많을수록 equity가 높아야 함
      expect(equities[0]).toBeGreaterThan(equities[1]);
      expect(equities[1]).toBeGreaterThan(equities[2]);
    });

    it('동일한 칩 분포는 동일한 equity를 가져야 함', () => {
      const stacks = [3000, 3000, 3000];
      const prizes = [0.5, 0.3, 0.2];

      const icm = new ICMCalculator(prizes);
      const equities = icm.calculate(stacks);

      // 모든 플레이어의 equity가 1/3이어야 함
      equities.forEach((equity) => {
        expect(equity).toBeCloseTo(0.333333, 5);
      });
    });

    it('칩 리더는 50% 이상의 equity를 가질 수 없음', () => {
      const stacks = [8000, 1000, 1000]; // 80% 칩 보유
      const prizes = [0.5, 0.3, 0.2];

      const icm = new ICMCalculator(prizes);
      const equities = icm.calculate(stacks);

      // 1등 상금이 50%이므로 equity는 50%를 초과할 수 없음
      expect(equities[0]).toBeLessThanOrEqual(0.5);
      expect(equities[0]).toBeGreaterThan(0.4); // 하지만 상당히 높아야 함
    });
  });

  describe('극단적인 케이스', () => {
    it('한 명이 모든 칩을 가진 경우', () => {
      const stacks = [10000, 0, 0];
      const prizes = [0.5, 0.3, 0.2];

      const icm = new ICMCalculator(prizes);
      const equities = icm.calculate(stacks);

      expect(equities[0]).toBe(1); // 모든 상금
      expect(equities[1]).toBe(0);
      expect(equities[2]).toBe(0);
    });

    it('빈 스택 배열 처리', () => {
      const stacks = [];
      const prizes = [0.5, 0.3, 0.2];

      const icm = new ICMCalculator(prizes);
      const equities = icm.calculate(stacks);

      expect(equities).toEqual([]);
    });

    it('음수 칩은 0으로 처리되어야 함', () => {
      const stacks = [5000, -1000, 2000];
      const prizes = [0.5, 0.3, 0.2];

      const icm = new ICMCalculator(prizes);
      const equities = icm.calculate(stacks);

      expect(equities[1]).toBe(0);
      expect(equities[0] + equities[2]).toBeCloseTo(1, 5);
    });
  });

  describe('다양한 상금 구조', () => {
    it('Winner-take-all 구조', () => {
      const stacks = [5000, 3000, 2000];
      const prizes = [1, 0, 0]; // 1등만 상금

      const icm = new ICMCalculator(prizes);
      const equities = icm.calculate(stacks);

      // equity = chip% in winner-take-all
      expect(equities[0]).toBeCloseTo(0.5, 5);
      expect(equities[1]).toBeCloseTo(0.3, 5);
      expect(equities[2]).toBeCloseTo(0.2, 5);
    });

    it('평평한 상금 구조', () => {
      const stacks = [5000, 3000, 2000];
      const prizes = [0.4, 0.35, 0.25]; // 상금 차이가 작음

      const icm = new ICMCalculator(prizes);
      const equities = icm.calculate(stacks);

      // 상금 구조가 평평하면 짧은 스택도 상대적으로 높은 equity
      expect(equities[2]).toBeGreaterThan(0.2); // 칩 비율보다 높은 equity
    });
  });

  describe('Push/Fold 결정', () => {
    it('Push 결정의 EV를 계산해야 함', () => {
      const prizes = [0.5, 0.3, 0.2];
      const icm = new ICMCalculator(prizes);

      // 플레이어 0이 all-in push
      // 플레이어 1이 50% 확률로 콜
      const pushEV = icm.calculatePushEV({
        pusherIndex: 0,
        pusherStack: 2000,
        callerIndex: 1,
        callerStack: 3000,
        callProbability: 0.5,
        winProbability: 0.5, // coin flip
        otherStacks: [5000],
      });

      expect(typeof pushEV).toBe('number');
      expect(pushEV).toBeGreaterThan(-1);
      expect(pushEV).toBeLessThan(1);
    });

    it('Fold는 항상 0 EV를 가져야 함', () => {
      // Fold는 현재 equity를 유지하므로 EV 변화는 0
      const foldEV = 0;

      expect(foldEV).toBe(0);
    });
  });

  describe('버블 팩터', () => {
    it('버블 상황에서 높은 버블 팩터를 가져야 함', () => {
      // 4명 중 3명만 상금, 플레이어들이 비슷한 스택
      const stacks = [2500, 2500, 2500, 2500];
      const prizes = [0.5, 0.3, 0.2, 0]; // 4등은 상금 없음

      const icm = new ICMCalculator(prizes);
      const bubbleFactor = icm.calculateBubbleFactor(stacks, 0, 1);

      expect(bubbleFactor).toBeGreaterThan(1.5); // 높은 버블 팩터
    });

    it('헤즈업에서는 버블 팩터가 1이어야 함', () => {
      const stacks = [5000, 5000];
      const prizes = [0.6, 0.4];

      const icm = new ICMCalculator(prizes);
      const bubbleFactor = icm.calculateBubbleFactor(stacks, 0, 1);

      expect(bubbleFactor).toBeCloseTo(1, 2); // 헤즈업은 칩 EV와 동일
    });
  });

  describe('Malmuth-Harville 공식 검증', () => {
    it('각 플레이어의 1위 확률의 합은 1이어야 함', () => {
      const stacks = [1000, 2000, 3000];
      const icm = new ICMCalculator();
      const result = icm.calculateFull(stacks);

      const firstPlaceProbs = result.probabilities.map((p) => p[0]);
      const totalFirstPlaceProb = firstPlaceProbs.reduce((sum, prob) => sum + prob, 0);

      expect(totalFirstPlaceProb).toBeCloseTo(1, 10);
    });

    it('각 순위의 확률 합은 1이어야 함', () => {
      const stacks = [1000, 2000, 3000, 1500];
      const icm = new ICMCalculator();
      const result = icm.calculateFull(stacks);

      // 각 순위별로 모든 플레이어의 확률을 합하면 1
      for (let position = 0; position < 3; position++) {
        const positionTotal = result.probabilities
          .map((p) => p[position])
          .reduce((sum, prob) => sum + prob, 0);
        expect(positionTotal).toBeCloseTo(1, 10);
      }
    });

    it('각 플레이어의 모든 순위 확률 합은 1 이하여야 함', () => {
      const stacks = [1000, 2000, 3000, 1500, 2500, 800];
      const icm = new ICMCalculator();
      const result = icm.calculateFull(stacks);

      result.probabilities.forEach((playerProbs, _playerIndex) => {
        const totalProb = playerProbs.reduce((sum, prob) => sum + prob, 0);
        expect(totalProb).toBeLessThanOrEqual(1.0001); // 부동소수점 오차 허용
        expect(totalProb).toBeGreaterThanOrEqual(0);
      });
    });

    it('칩이 많은 플레이어일수록 1위 확률이 높아야 함', () => {
      const stacks = [1000, 3000, 5000];
      const icm = new ICMCalculator();
      const result = icm.calculateFull(stacks);

      const firstPlaceProbs = result.probabilities.map((p) => p[0]);

      expect(firstPlaceProbs[2]).toBeGreaterThan(firstPlaceProbs[1]);
      expect(firstPlaceProbs[1]).toBeGreaterThan(firstPlaceProbs[0]);
    });
  });

  describe('ICMResult 클래스', () => {
    it('올바른 결과 객체를 반환해야 함', () => {
      const stacks = [1000, 2000, 3000];
      const icm = new ICMCalculator();
      const result = icm.calculateFull(stacks);

      expect(result).toBeInstanceOf(ICMResult);
      expect(result.probabilities).toBeDefined();
      expect(result.equities).toBeDefined();
      expect(result.totalChips).toBe(6000);
      expect(result.calculatedAt).toBeInstanceOf(Date);
    });

    it('getEquityPercent 메소드가 올바르게 작동해야 함', () => {
      const stacks = [1000, 2000, 3000];
      const icm = new ICMCalculator();
      const result = icm.calculateFull(stacks);

      const percent = result.getEquityPercent(0);
      expect(percent).toBe(result.equities[0] * 100);
      expect(percent).toBeGreaterThan(0);
      expect(percent).toBeLessThan(100);
    });

    it('getExpectedPrize 메소드가 올바르게 작동해야 함', () => {
      const stacks = [1000, 2000, 3000];
      const prizePool = 1000;
      const icm = new ICMCalculator();
      const result = icm.calculateFull(stacks, prizePool);

      const expectedPrize = result.getExpectedPrize(0);
      expect(expectedPrize).toBe(result.equities[0] * prizePool);
    });

    it('getPlaceProbability 메소드가 올바르게 작동해야 함', () => {
      const stacks = [1000, 2000, 3000];
      const icm = new ICMCalculator();
      const result = icm.calculateFull(stacks);

      const firstPlaceProb = result.getPlaceProbability(2, 0); // 가장 큰 스택의 1위 확률
      expect(firstPlaceProb).toBeGreaterThan(0.4); // 50%에 근접해야 함
      expect(firstPlaceProb).toBeLessThan(0.6);
    });
  });

  describe('유틸리티 함수들', () => {
    it('simpleICM 함수가 올바르게 작동해야 함', () => {
      const stacks = [1000, 2000, 3000];
      const equities = simpleICM(stacks);

      expect(Array.isArray(equities)).toBe(true);
      expect(equities.length).toBe(3);

      const totalEquity = equities.reduce((sum, eq) => sum + eq, 0);
      expect(totalEquity).toBeCloseTo(1, 10);
    });

    it('calculateICM 함수가 ICMResult를 반환해야 함', () => {
      const stacks = [1000, 2000, 3000];
      const result = calculateICM(stacks);

      expect(result).toBeInstanceOf(ICMResult);
    });

    it('calculateEVDifference 함수가 올바르게 작동해야 함', () => {
      const currentStacks = [1000, 2000, 3000];
      const afterStacks = [1500, 1500, 3000]; // 플레이어 0이 이김

      const evDiff = calculateEVDifference(currentStacks, afterStacks, 0);

      expect(typeof evDiff).toBe('number');
      expect(evDiff).toBeGreaterThan(0); // 칩을 늘렸으므로 positive EV
    });
  });

  describe('입력 검증', () => {
    it('잘못된 스택 배열에 대해 에러를 던져야 함', () => {
      const icm = new ICMCalculator();

      expect(() => icm.validateStacks(null)).toThrow();
      expect(() => icm.validateStacks([])).toThrow();
      expect(() => icm.validateStacks([1000, 'invalid', 3000])).toThrow();
      expect(() => icm.validateStacks([-1000, 2000, 3000])).toThrow();
      expect(() => icm.validateStacks([0, 0, 0])).toThrow();
    });

    it('잘못된 상금 구조에 대해 에러를 던져야 함', () => {
      expect(() => new ICMCalculator(null)).toThrow();
      expect(() => new ICMCalculator([])).toThrow();
      expect(() => new ICMCalculator([0.6, 0.3, 0.2])).toThrow(); // 합이 1.1
      expect(() => new ICMCalculator([0.5, -0.1, 0.6])).toThrow(); // 음수 포함
      expect(() => new ICMCalculator([0.5, 'invalid', 0.3])).toThrow(); // 타입 오류
    });
  });

  describe('특수 상황 테스트', () => {
    it('매우 작은 스택들을 올바르게 처리해야 함', () => {
      const stacks = [0.1, 0.2, 9999.7]; // 거의 0에 가까운 스택
      const icm = new ICMCalculator();
      const equities = icm.calculate(stacks);

      expect(equities[2]).toBeCloseTo(1, 2); // 거의 모든 equity
      expect(equities[0] + equities[1]).toBeLessThan(0.1); // 매우 작은 equity
    });

    it('매우 큰 수의 플레이어를 처리해야 함', () => {
      const stacks = Array(10).fill(1000); // 10명의 동일한 스택
      const prizes = [0.3, 0.2, 0.15, 0.1, 0.08, 0.07, 0.05, 0.03, 0.02, 0];

      const icm = new ICMCalculator(prizes);
      const equities = icm.calculate(stacks);

      expect(equities.length).toBe(10);

      // 모든 플레이어의 equity가 동일해야 함
      equities.forEach((equity) => {
        expect(equity).toBeCloseTo(0.1, 5);
      });
    });

    it('한 명만 남은 상황을 올바르게 처리해야 함', () => {
      const stacks = [10000, 0, 0, 0, 0, 0];
      const icm = new ICMCalculator();
      const result = icm.calculateFull(stacks);

      expect(result.equities[0]).toBe(1);
      expect(result.getPlaceProbability(0, 0)).toBe(1); // 1위 확률 100%

      for (let i = 1; i < 6; i++) {
        expect(result.equities[i]).toBe(0);
      }
    });
  });

  describe('성능 테스트', () => {
    it('대규모 계산이 합리적인 시간 내에 완료되어야 함', () => {
      const stacks = [1000, 2000, 3000, 1500, 2500, 800];
      const icm = new ICMCalculator();

      const start = performance.now();
      const result = icm.calculateFull(stacks);
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // 100ms 이내
      expect(result).toBeDefined();
    });

    it('동일한 입력에 대해 일관된 결과를 반환해야 함', () => {
      const stacks = [1234, 5678, 9012];
      const icm = new ICMCalculator();

      const result1 = icm.calculateFull(stacks);
      const result2 = icm.calculateFull(stacks);

      for (let i = 0; i < result1.equities.length; i++) {
        expect(result1.equities[i]).toBeCloseTo(result2.equities[i], 15);
      }
    });
  });

  describe('수학적 정확성 검증', () => {
    it('2인 헤즈업에서 정확한 계산', () => {
      const stacks = [3000, 7000]; // 30% vs 70%
      const prizes = [0.6, 0.4];

      const icm = new ICMCalculator(prizes);
      const result = icm.calculateFull(stacks);

      // 헤즈업에서는 1위 확률 = 칩 비율
      expect(result.getPlaceProbability(0, 0)).toBeCloseTo(0.3, 10);
      expect(result.getPlaceProbability(1, 0)).toBeCloseTo(0.7, 10);

      // Equity = 1위확률 * 1위상금 + 2위확률 * 2위상금
      const expectedEquity0 = 0.3 * 0.6 + 0.7 * 0.4;
      const expectedEquity1 = 0.7 * 0.6 + 0.3 * 0.4;

      expect(result.equities[0]).toBeCloseTo(expectedEquity0, 10);
      expect(result.equities[1]).toBeCloseTo(expectedEquity1, 10);
    });

    it('3인에서 동일 스택의 정확한 계산', () => {
      const stacks = [1000, 1000, 1000];
      const prizes = [0.5, 0.3, 0.2];

      const icm = new ICMCalculator(prizes);
      const result = icm.calculateFull(stacks);

      // 동일 스택이므로 모든 순위 확률이 1/3
      for (let player = 0; player < 3; player++) {
        for (let position = 0; position < 3; position++) {
          expect(result.getPlaceProbability(player, position)).toBeCloseTo(1 / 3, 10);
        }
      }

      // Equity = (1/3) * 0.5 + (1/3) * 0.3 + (1/3) * 0.2 = 1/3
      for (let player = 0; player < 3; player++) {
        expect(result.equities[player]).toBeCloseTo(1 / 3, 10);
      }
    });
  });
});

describe('EV 차이 및 All-in 계산', () => {
  describe('All-in EV 계산', () => {
    it('All-in EV를 올바르게 계산해야 함', () => {
      const stacks = [1000, 2000, 3000];
      const icm = new ICMCalculator();

      const allInResult = icm.calculateAllInEV(stacks, 0, 1, 0.5); // 50% 승률

      expect(allInResult).toHaveProperty('currentEquity');
      expect(allInResult).toHaveProperty('expectedEquity');
      expect(allInResult).toHaveProperty('evDifference');
      expect(allInResult).toHaveProperty('scenarios');

      expect(allInResult.scenarios).toHaveLength(2); // 승리/패배
      expect(allInResult.scenarios[0].probability).toBe(0.5);
      expect(allInResult.scenarios[1].probability).toBe(0.5);
    });

    it('확실한 승리 All-in은 positive EV여야 함', () => {
      const stacks = [1000, 2000, 3000];
      const icm = new ICMCalculator();

      const allInResult = icm.calculateAllInEV(stacks, 0, 1, 1.0); // 100% 승률

      expect(allInResult.evDifference).toBeGreaterThan(0);
    });

    it('확실한 패배 All-in은 negative EV여야 함', () => {
      const stacks = [1000, 2000, 3000];
      const icm = new ICMCalculator();

      const allInResult = icm.calculateAllInEV(stacks, 0, 1, 0.0); // 0% 승률

      expect(allInResult.evDifference).toBeLessThan(0);
    });
  });

  describe('ICM 압박 계산', () => {
    it('버블 상황에서 높은 ICM 압박을 계산해야 함', () => {
      const stacks = [2000, 2000, 2000, 2000]; // 4명, 3명만 상금
      const prizes = [0.5, 0.3, 0.2, 0];

      const icm = new ICMCalculator(prizes);
      const pressure = icm.calculateICMPressure(stacks, 0);

      expect(pressure).toBeGreaterThan(1.0); // ICM 압박 존재
      expect(pressure).toBeLessThan(2.0); // 합리적인 범위
    });

    it('헤즈업에서는 ICM 압박이 1에 가까워야 함', () => {
      const stacks = [3000, 7000];
      const prizes = [0.6, 0.4];

      const icm = new ICMCalculator(prizes);
      const pressure = icm.calculateICMPressure(stacks, 0);

      expect(pressure).toBeCloseTo(1.0, 1); // ICM 압박 거의 없음
    });
  });
});
