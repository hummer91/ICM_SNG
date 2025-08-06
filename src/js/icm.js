/**
 * ICM (Independent Chip Model) 계산 엔진
 *
 * 6인 SNG 토너먼트를 위한 완전한 ICM 계산
 * Malmuth-Harville 공식을 사용하여 정확한 토너먼트 equity 계산
 *
 * @author ICM SNG Poker App
 * @version 2.0.0
 */

/**
 * 기본 상금 구조 (6인 SNG)
 * 1위: 50%, 2위: 30%, 3위: 20%
 */
const DEFAULT_PRIZE_STRUCTURE = [0.5, 0.3, 0.2];

/**
 * ICM 계산 결과를 위한 클래스
 */
export class ICMResult {
  constructor(probabilities, equities, totalChips, prizePool) {
    this.probabilities = probabilities; // 각 플레이어의 순위별 확률
    this.equities = equities; // 각 플레이어의 토너먼트 equity
    this.totalChips = totalChips; // 총 칩 수
    this.prizePool = prizePool; // 총 상금
    this.calculatedAt = new Date();
  }

  /**
   * 플레이어의 equity를 퍼센트로 반환
   * @param {number} playerIndex - 플레이어 인덱스
   * @returns {number} equity 퍼센트 (0-100)
   */
  getEquityPercent(playerIndex) {
    return this.equities[playerIndex] * 100;
  }

  /**
   * 플레이어의 상금 기댓값 반환
   * @param {number} playerIndex - 플레이어 인덱스
   * @returns {number} 상금 기댓값
   */
  getExpectedPrize(playerIndex) {
    return this.equities[playerIndex] * this.prizePool;
  }

  /**
   * 플레이어가 특정 순위에 올 확률 반환
   * @param {number} playerIndex - 플레이어 인덱스
   * @param {number} position - 순위 (0=1위, 1=2위, 2=3위)
   * @returns {number} 확률 (0-1)
   */
  getPlaceProbability(playerIndex, position) {
    return this.probabilities[playerIndex][position] || 0;
  }
}

export class ICMCalculator {
  constructor(prizeStructure = DEFAULT_PRIZE_STRUCTURE) {
    this.prizeStructure = prizeStructure;
    this.validatePrizeStructure(prizeStructure);
  }

  /**
   * 상금 구조 검증
   * @param {number[]} prizeStructure - 상금 구조
   * @throws {Error} 검증 실패 시 에러
   */
  validatePrizeStructure(prizeStructure) {
    if (!Array.isArray(prizeStructure) || prizeStructure.length === 0) {
      throw new Error('상금 구조가 유효하지 않습니다.');
    }

    if (prizeStructure.some((prize) => typeof prize !== 'number' || prize < 0 || prize > 1)) {
      throw new Error('상금 구조의 모든 값은 0과 1 사이의 숫자여야 합니다.');
    }

    const prizeSum = prizeStructure.reduce((sum, prize) => sum + prize, 0);
    if (Math.abs(prizeSum - 1) > 1e-10) {
      throw new Error('상금 구조의 합은 1이어야 합니다.');
    }
  }

  /**
   * 입력 데이터 검증
   * @param {number[]} stacks - 각 플레이어의 칩 스택
   * @throws {Error} 검증 실패 시 에러
   */
  validateStacks(stacks) {
    if (!Array.isArray(stacks) || stacks.length === 0) {
      throw new Error('스택 배열이 유효하지 않습니다.');
    }

    if (stacks.some((stack) => typeof stack !== 'number' || stack < 0)) {
      throw new Error('모든 스택 값은 0 이상의 숫자여야 합니다.');
    }

    if (stacks.every((stack) => stack === 0)) {
      throw new Error('모든 플레이어의 스택이 0일 수 없습니다.');
    }
  }

  /**
   * Malmuth-Harville 공식을 사용한 순위 확률 계산
   * 재귀적 방법으로 각 플레이어의 각 순위에 대한 확률을 정확히 계산
   *
   * @param {number[]} stacks - 각 플레이어의 칩 스택
   * @param {number} numPrizes - 상금을 받는 순위 수
   * @returns {number[][]} probabilities[player][position] = 플레이어가 해당 순위에 올 확률
   */
  calculateMalmuthHarvilleProbabilities(stacks, numPrizes) {
    const numPlayers = stacks.length;
    const probabilities = Array(numPlayers)
      .fill(null)
      .map(() => Array(numPrizes).fill(0));

    /**
     * 재귀적으로 순위 확률 계산
     * @param {number[]} remainingStacks - 남은 플레이어들의 스택
     * @param {number[]} remainingIndices - 남은 플레이어들의 원래 인덱스
     * @param {number} position - 현재 계산 중인 순위 (0=1위, 1=2위, ...)
     * @param {number} probability - 현재까지의 누적 확률
     */
    const calculateRecursive = (remainingStacks, remainingIndices, position, probability) => {
      if (position >= numPrizes || remainingStacks.length === 0) {
        return;
      }

      const totalChips = remainingStacks.reduce((sum, stack) => sum + stack, 0);

      if (totalChips === 0) {
        return;
      }

      // 각 남은 플레이어가 현재 순위에 올 확률 계산
      for (let i = 0; i < remainingStacks.length; i++) {
        const playerStack = remainingStacks[i];
        const playerIndex = remainingIndices[i];

        if (playerStack === 0) {
          continue;
        }

        // Malmuth-Harville: 해당 플레이어가 이번 순위에 올 확률
        const positionProbability = playerStack / totalChips;
        const newProbability = probability * positionProbability;

        // 확률 누적
        probabilities[playerIndex][position] += newProbability;

        // 해당 플레이어를 제외한 나머지로 다음 순위 계산
        if (position < numPrizes - 1) {
          const newRemainingStacks = remainingStacks.filter((_, idx) => idx !== i);
          const newRemainingIndices = remainingIndices.filter((_, idx) => idx !== i);

          calculateRecursive(newRemainingStacks, newRemainingIndices, position + 1, newProbability);
        }
      }
    };

    // 초기 호출: 모든 플레이어, 1위부터, 확률 1로 시작
    const initialIndices = Array.from({ length: numPlayers }, (_, i) => i);
    calculateRecursive([...stacks], initialIndices, 0, 1.0);

    return probabilities;
  }

  /**
   * 완전한 ICM 계산 (확률과 equity 모두 포함)
   * @param {number[]} stacks - 각 플레이어의 칩 스택
   * @param {number} prizePool - 총 상금 (기본값: 1.0)
   * @returns {ICMResult} ICM 계산 결과
   */
  calculateFull(stacks, prizePool = 1.0) {
    // 입력 검증
    this.validateStacks(stacks);

    const numPlayers = stacks.length;
    const numPrizes = Math.min(this.prizeStructure.length, numPlayers);

    // 0인 스택 처리: 매우 작은 값으로 대체 (완전히 0이면 계산 불가)
    const adjustedStacks = stacks.map((stack) => (stack === 0 ? 1e-10 : stack));

    // Malmuth-Harville 확률 계산
    const probabilities = this.calculateMalmuthHarvilleProbabilities(adjustedStacks, numPrizes);

    // 각 플레이어의 equity 계산
    const equities = Array(numPlayers).fill(0);

    for (let player = 0; player < numPlayers; player++) {
      for (let position = 0; position < numPrizes; position++) {
        equities[player] += probabilities[player][position] * this.prizeStructure[position];
      }
    }

    const totalChips = stacks.reduce((sum, stack) => sum + stack, 0);

    return new ICMResult(probabilities, equities, totalChips, prizePool);
  }

  /**
   * 각 플레이어의 토너먼트 equity 계산 (기존 메소드와의 호환성)
   * @param {number[]} stacks - 각 플레이어의 칩 스택
   * @returns {number[]} - 각 플레이어의 equity (0-1)
   */
  calculate(stacks) {
    const result = this.calculateFull(stacks);
    return result.equities;
  }

  /**
   * 두 ICM 상황 간의 EV 차이 계산
   * @param {number[]} currentStacks - 현재 스택 상황
   * @param {number[]} afterActionStacks - 액션 후 스택 상황
   * @param {number} playerIndex - 계산할 플레이어의 인덱스
   * @returns {number} EV 차이 (양수면 유리, 음수면 불리)
   */
  calculateEVDifference(currentStacks, afterActionStacks, playerIndex) {
    const currentICM = this.calculateFull(currentStacks);
    const afterICM = this.calculateFull(afterActionStacks);

    return afterICM.equities[playerIndex] - currentICM.equities[playerIndex];
  }

  /**
   * 특정 플레이어가 all-in 했을 때의 가능한 결과들과 확률 계산
   * @param {number[]} stacks - 현재 스택 상황
   * @param {number} playerIndex - all-in 하는 플레이어
   * @param {number} callersCount - 콜하는 플레이어 수
   * @param {number} winProbability - 올인 승률 (기본값: 균등 분할)
   * @returns {Object} 가능한 결과들과 각각의 확률, EV
   */
  calculateAllInEV(stacks, playerIndex, callersCount = 1, winProbability = null) {
    // 기본 승률: 상대 수에 따른 균등 분할
    if (winProbability === null) {
      winProbability = 1 / (callersCount + 1);
    }

    const playerStack = stacks[playerIndex];
    const scenarios = [];

    // 승리 시나리오
    const winStacks = [...stacks];
    let totalWon = 0;

    // 가장 작은 스택들부터 처리 (사이드팟 고려)
    const sortedStacks = stacks
      .map((stack, index) => ({ stack, index }))
      .filter((player) => player.index !== playerIndex)
      .sort((a, b) => a.stack - b.stack);

    let remainingPlayerStack = playerStack;

    for (const opponent of sortedStacks) {
      if (remainingPlayerStack <= 0) {
        break;
      }

      const potSize = Math.min(remainingPlayerStack, opponent.stack);
      totalWon += potSize;
      remainingPlayerStack -= potSize;
      winStacks[opponent.index] -= potSize;
    }

    winStacks[playerIndex] += totalWon;

    scenarios.push({
      probability: winProbability,
      stacks: winStacks,
      description: 'All-in 승리',
    });

    // 패배 시나리오
    const loseStacks = [...stacks];
    loseStacks[playerIndex] = 0;

    scenarios.push({
      probability: 1 - winProbability,
      stacks: loseStacks,
      description: 'All-in 패배',
    });

    // 각 시나리오의 EV 계산
    const currentICM = this.calculateFull(stacks);
    const currentEquity = currentICM.equities[playerIndex];

    let totalEV = 0;
    for (const scenario of scenarios) {
      const scenarioICM = this.calculateFull(scenario.stacks);
      const scenarioEquity = scenarioICM.equities[playerIndex];
      totalEV += scenario.probability * scenarioEquity;
    }

    return {
      currentEquity,
      expectedEquity: totalEV,
      evDifference: totalEV - currentEquity,
      scenarios,
    };
  }

  /**
   * ICM 압박 팩터 계산 (버블 상황에서의 압박 정도)
   * @param {number[]} stacks - 각 플레이어의 칩 스택
   * @param {number} playerIndex - 계산할 플레이어
   * @returns {number} 압박 팩터 (1.0 = 칩 EV와 동일, >1.0 = ICM 압박 존재)
   */
  calculateICMPressure(stacks, playerIndex) {
    const totalChips = stacks.reduce((sum, stack) => sum + stack, 0);
    const chipEquity = stacks[playerIndex] / totalChips;

    const icmResult = this.calculateFull(stacks);
    const icmEquity = icmResult.equities[playerIndex];

    if (icmEquity === 0) {
      return Infinity;
    }

    return chipEquity / icmEquity;
  }

  /**
   * Push EV 계산 (개선된 버전)
   */
  calculatePushEV(params) {
    const {
      pusherIndex,
      pusherStack,
      callerIndex,
      callerStack,
      callProbability,
      winProbability,
      otherStacks = [],
    } = params;

    // 현재 스택 상황
    const currentStacks = [...otherStacks];
    currentStacks.splice(pusherIndex, 0, pusherStack);
    currentStacks.splice(callerIndex, 0, callerStack);

    const currentEquity = this.calculate(currentStacks)[pusherIndex];

    // Fold된 경우의 스택 (블라인드 손실 반영)
    const foldStacks = [...currentStacks];
    const foldEquity = this.calculate(foldStacks)[pusherIndex];

    // Call되어 이긴 경우의 스택
    const winStacks = [...currentStacks];
    winStacks[pusherIndex] = pusherStack + Math.min(pusherStack, callerStack);
    winStacks[callerIndex] = Math.max(0, callerStack - pusherStack);
    const winEquity = this.calculate(winStacks)[pusherIndex];

    // Call되어 진 경우의 스택
    const loseStacks = [...currentStacks];
    loseStacks[pusherIndex] = 0;
    loseStacks[callerIndex] = callerStack + pusherStack;
    const loseEquity = this.calculate(loseStacks)[pusherIndex];

    // Expected Value 계산
    const callEV = winProbability * winEquity + (1 - winProbability) * loseEquity;
    const ev = (1 - callProbability) * foldEquity + callProbability * callEV;

    return {
      currentEquity,
      foldEquity,
      winEquity,
      loseEquity,
      expectedEquity: ev,
      evDifference: ev - currentEquity,
    };
  }

  /**
   * 버블 팩터 계산 (개선된 버전)
   */
  calculateBubbleFactor(stacks, playerIndex = null) {
    const n = stacks.length;
    const inTheMoney = this.prizeStructure.filter((p) => p > 0).length;

    // 헤즈업이거나 모든 플레이어가 상금을 받는 경우
    if (n <= 2 || n <= inTheMoney) {
      return 1.0;
    }

    const totalChips = stacks.reduce((sum, stack) => sum + stack, 0);
    const playersRemaining = stacks.filter((s) => s > 0).length;
    const distanceFromBubble = playersRemaining - inTheMoney;

    if (playerIndex !== null) {
      // 특정 플레이어의 버블 팩터
      const chipEV = stacks[playerIndex] / totalChips;
      const currentEquity = this.calculate(stacks)[playerIndex];

      if (chipEV === 0) {
        return 1.0;
      }

      const bubbleFactor = currentEquity / chipEV;

      // 버블 거리에 따른 조정
      if (distanceFromBubble === 1) {
        return bubbleFactor * 1.5; // 정확히 버블
      } else if (distanceFromBubble === 2) {
        return bubbleFactor * 1.2; // 버블에 가까움
      }

      return bubbleFactor;
    }
    // 전체 테이블의 평균 버블 팩터
    const equities = this.calculate(stacks);
    let totalBubbleFactor = 0;
    let activePlayers = 0;

    for (let i = 0; i < stacks.length; i++) {
      if (stacks[i] > 0) {
        const chipEV = stacks[i] / totalChips;
        const bubbleFactor = equities[i] / chipEV;
        totalBubbleFactor += bubbleFactor;
        activePlayers++;
      }
    }

    return activePlayers > 0 ? totalBubbleFactor / activePlayers : 1.0;
  }
}

/**
 * 간단한 ICM 계산을 위한 유틸리티 함수들
 */

/**
 * 간단한 ICM 계산 (6인 SNG 기본값 사용)
 * @param {number[]} stacks - 각 플레이어의 칩 스택
 * @returns {number[]} 각 플레이어의 equity (0-1)
 */
export function simpleICM(stacks) {
  const calculator = new ICMCalculator();
  return calculator.calculate(stacks);
}

/**
 * ICM 계산 결과를 상세히 반환
 * @param {number[]} stacks - 각 플레이어의 칩 스택
 * @param {number[]} prizeStructure - 상금 구조
 * @returns {ICMResult} 완전한 ICM 결과
 */
export function calculateICM(stacks, prizeStructure = DEFAULT_PRIZE_STRUCTURE) {
  const calculator = new ICMCalculator(prizeStructure);
  return calculator.calculateFull(stacks);
}

/**
 * 두 상황 간 EV 차이 계산
 * @param {number[]} currentStacks - 현재 스택
 * @param {number[]} afterStacks - 액션 후 스택
 * @param {number} playerIndex - 플레이어 인덱스
 * @returns {number} EV 차이
 */
export function calculateEVDifference(currentStacks, afterStacks, playerIndex) {
  const calculator = new ICMCalculator();
  return calculator.calculateEVDifference(currentStacks, afterStacks, playerIndex);
}

// 상수 내보내기
export { DEFAULT_PRIZE_STRUCTURE };

// CommonJS 호환성
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ICMResult,
    ICMCalculator,
    simpleICM,
    calculateICM,
    calculateEVDifference,
    DEFAULT_PRIZE_STRUCTURE,
  };
}
