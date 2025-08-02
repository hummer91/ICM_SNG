/**
 * ICM (Independent Chip Model) 계산 엔진
 * 
 * Malmuth-Harville 공식을 사용하여 토너먼트 equity 계산
 */

export class ICMCalculator {
  constructor(prizeStructure = [0.5, 0.3, 0.2]) {
    this.prizeStructure = prizeStructure;
  }

  /**
   * 각 플레이어의 토너먼트 equity 계산
   * @param {number[]} stacks - 각 플레이어의 칩 스택
   * @returns {number[]} - 각 플레이어의 equity (0-1)
   */
  calculate(stacks) {
    if (!stacks || stacks.length === 0) {
      return [];
    }

    // 음수 스택을 0으로 처리
    const cleanStacks = stacks.map(stack => Math.max(0, stack));
    const totalChips = cleanStacks.reduce((sum, stack) => sum + stack, 0);
    
    if (totalChips === 0) {
      return cleanStacks.map(() => 0);
    }

    const n = cleanStacks.length;
    const equities = new Array(n).fill(0);

    // 각 플레이어에 대해 equity 계산
    for (let i = 0; i < n; i++) {
      if (cleanStacks[i] === 0) {
        equities[i] = 0;
        continue;
      }

      // 플레이어 i가 각 순위를 차지할 확률 계산
      for (let place = 0; place < Math.min(n, this.prizeStructure.length); place++) {
        const prob = this.calculatePlaceProbability(cleanStacks, i, place);
        equities[i] += prob * this.prizeStructure[place];
      }
    }

    return equities;
  }

  /**
   * 플레이어가 특정 순위를 차지할 확률 계산
   * @private
   */
  calculatePlaceProbability(stacks, playerIndex, place) {
    const n = stacks.length;
    const totalChips = stacks.reduce((sum, stack) => sum + stack, 0);
    
    if (place === 0) {
      // 1등 확률 = 칩 비율
      return stacks[playerIndex] / totalChips;
    }

    // 2등 이하: 재귀적 계산
    let probability = 0;
    
    // 각 플레이어가 1등을 하는 경우를 고려
    for (let winner = 0; winner < n; winner++) {
      if (winner === playerIndex || stacks[winner] === 0) continue;
      
      // winner가 1등할 확률
      const winProb = stacks[winner] / totalChips;
      
      // winner를 제외한 나머지 스택
      const remainingStacks = stacks.filter((_, idx) => idx !== winner);
      const remainingPlayerIndex = playerIndex > winner ? playerIndex - 1 : playerIndex;
      
      if (playerIndex !== winner) {
        // 재귀적으로 나머지 플레이어들 중에서 place-1 등을 할 확률 계산
        const remainingProb = this.calculatePlaceProbability(
          remainingStacks,
          remainingPlayerIndex,
          place - 1
        );
        probability += winProb * remainingProb;
      }
    }
    
    return probability;
  }

  /**
   * Push EV 계산
   */
  calculatePushEV(params) {
    const {
      pusherIndex,
      pusherStack,
      callerIndex,
      callerStack,
      callProbability,
      winProbability,
      otherStacks = []
    } = params;

    // 현재 스택 상황
    const currentStacks = [...otherStacks];
    currentStacks.splice(pusherIndex, 0, pusherStack);
    currentStacks.splice(callerIndex, 0, callerStack);
    
    const currentEquity = this.calculate(currentStacks)[pusherIndex];

    // Fold된 경우의 스택
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
    
    return ev - currentEquity;
  }

  /**
   * 버블 팩터 계산
   */
  calculateBubbleFactor(stacks, pusherIndex, callerIndex) {
    const n = stacks.length;
    const inTheMoney = this.prizeStructure.filter(p => p > 0).length;
    
    // 헤즈업이거나 모든 플레이어가 상금을 받는 경우
    if (n <= 2 || n <= inTheMoney) {
      return 1.0;
    }

    // 칩 EV
    const totalChips = stacks.reduce((sum, stack) => sum + stack, 0);
    const chipEV = stacks[callerIndex] / totalChips;

    // ICM EV
    const currentEquity = this.calculate(stacks)[callerIndex];
    
    // 버블 팩터 = ICM 압력 / 칩 압력
    const bubbleFactor = currentEquity / chipEV;
    
    // 버블에 가까울수록 팩터가 증가
    const playersRemaining = stacks.filter(s => s > 0).length;
    const distanceFromBubble = playersRemaining - inTheMoney;
    
    if (distanceFromBubble === 1) {
      // 정확히 버블 상황
      return bubbleFactor * 1.5;
    } else if (distanceFromBubble === 2) {
      // 버블에 가까운 상황
      return bubbleFactor * 1.2;
    }
    
    return bubbleFactor;
  }
}