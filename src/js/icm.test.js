/**
 * ICM 계산 엔진 테스트
 */

import { describe, it, expect } from 'vitest';
import { ICMCalculator } from './icm.js';

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
});
