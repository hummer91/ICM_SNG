/**
 * Push/Fold 차트 로직
 *
 * 6인 SNG에서 Nash Equilibrium 기반 Push/Fold 결정을 위한 모듈
 * 포지션, 스택 깊이, 이전 액션에 따른 최적 범위 계산
 *
 * @author ICM SNG Poker App
 * @version 1.0.0
 */

import { ICMCalculator } from './icm.js';

/**
 * 포커 포지션 정의
 */
export const POSITIONS = {
  BTN: 'BTN', // Button
  SB: 'SB', // Small Blind
  BB: 'BB', // Big Blind
  UTG: 'UTG', // Under The Gun
  MP: 'MP', // Middle Position
  CO: 'CO', // Cut Off
};

/**
 * 액션 타입 정의
 */
export const ACTIONS = {
  FOLD: 'FOLD',
  CALL: 'CALL',
  RAISE: 'RAISE',
  PUSH: 'PUSH',
};

/**
 * 핸드 순위 매트릭스 (169개 홀덤 시작 핸드)
 * 13x13 그리드: 행 = 첫 번째 카드, 열 = 두 번째 카드
 * 대각선 = 포켓 페어, 상삼각 = 수티드, 하삼각 = 오프수트
 */
const HAND_MATRIX = [
  // AA AKs AQs AJs ATs A9s A8s A7s A6s A5s A4s A3s A2s
  ['AA', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s'],
  // AKo KK KQs KJs KTs K9s K8s K7s K6s K5s K4s K3s K2s
  ['AKo', 'KK', 'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s'],
  // AQo KQo QQ QJs QTs Q9s Q8s Q7s Q6s Q5s Q4s Q3s Q2s
  ['AQo', 'KQo', 'QQ', 'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s', 'Q4s', 'Q3s', 'Q2s'],
  // AJo KJo QJo JJ JTs J9s J8s J7s J6s J5s J4s J3s J2s
  ['AJo', 'KJo', 'QJo', 'JJ', 'JTs', 'J9s', 'J8s', 'J7s', 'J6s', 'J5s', 'J4s', 'J3s', 'J2s'],
  // ATo KTo QTo JTo TT T9s T8s T7s T6s T5s T4s T3s T2s
  ['ATo', 'KTo', 'QTo', 'JTo', 'TT', 'T9s', 'T8s', 'T7s', 'T6s', 'T5s', 'T4s', 'T3s', 'T2s'],
  // A9o K9o Q9o J9o T9o 99 98s 97s 96s 95s 94s 93s 92s
  ['A9o', 'K9o', 'Q9o', 'J9o', 'T9o', '99', '98s', '97s', '96s', '95s', '94s', '93s', '92s'],
  // A8o K8o Q8o J8o T8o 98o 88 87s 86s 85s 84s 83s 82s
  ['A8o', 'K8o', 'Q8o', 'J8o', 'T8o', '98o', '88', '87s', '86s', '85s', '84s', '83s', '82s'],
  // A7o K7o Q7o J7o T7o 97o 87o 77 76s 75s 74s 73s 72s
  ['A7o', 'K7o', 'Q7o', 'J7o', 'T7o', '97o', '87o', '77', '76s', '75s', '74s', '73s', '72s'],
  // A6o K6o Q6o J6o T6o 96o 86o 76o 66 65s 64s 63s 62s
  ['A6o', 'K6o', 'Q6o', 'J6o', 'T6o', '96o', '86o', '76o', '66', '65s', '64s', '63s', '62s'],
  // A5o K5o Q5o J5o T5o 95o 85o 75o 65o 55 54s 53s 52s
  ['A5o', 'K5o', 'Q5o', 'J5o', 'T5o', '95o', '85o', '75o', '65o', '55', '54s', '53s', '52s'],
  // A4o K4o Q4o J4o T4o 94o 84o 74o 64o 54o 44 43s 42s
  ['A4o', 'K4o', 'Q4o', 'J4o', 'T4o', '94o', '84o', '74o', '64o', '54o', '44', '43s', '42s'],
  // A3o K3o Q3o J3o T3o 93o 83o 73o 63o 53o 43o 33 32s
  ['A3o', 'K3o', 'Q3o', 'J3o', 'T3o', '93o', '83o', '73o', '63o', '53o', '43o', '33', '32s'],
  // A2o K2o Q2o J2o T2o 92o 82o 72o 62o 52o 42o 32o 22
  ['A2o', 'K2o', 'Q2o', 'J2o', 'T2o', '92o', '82o', '72o', '62o', '52o', '42o', '32o', '22'],
];

/**
 * 핸드를 매트릭스 좌표로 변환
 * @param {string} hand - 핸드 표기 (예: 'AA', 'AKs', 'AKo')
 * @returns {Object} {row, col} 좌표
 */
// Commented out - function not used currently
// function handToMatrix(hand) {
//   for (let row = 0; row < 13; row++) {
//     for (let col = 0; col < 13; col++) {
//       if (HAND_MATRIX[row][col] === hand) {
//         return { row, col };
//       }
//     }
//   }
//   return null;
// }

/**
 * 매트릭스 좌표를 핸드로 변환
 * @param {number} row - 행
 * @param {number} col - 열
 * @returns {string} 핸드 표기
 */
// Commented out - function not used currently
// function matrixToHand(row, col) {
//   if (row >= 0 && row < 13 && col >= 0 && col < 13) {
//     return HAND_MATRIX[row][col];
//   }
//   return null;
// }

/**
 * Push/Fold 계산기 클래스
 */
export class PushFoldCalculator {
  constructor() {
    this.icmCalculator = new ICMCalculator();
    this.ranges = new Map(); // 범위 데이터 캐시
  }

  /**
   * 특정 상황에서의 Push 범위 계산
   * @param {Object} situation - 게임 상황
   * @param {Array} situation.stacks - 각 플레이어 스택 (BB 단위)
   * @param {string} situation.position - 현재 플레이어 포지션
   * @param {number} situation.playerIndex - 현재 플레이어 인덱스
   * @param {Array} situation.previousActions - 이전 액션들
   * @param {number} situation.blindLevel - 블라인드 레벨
   * @returns {Array} Push 범위 핸드 목록
   */
  calculatePushRange(situation) {
    const { stacks, position, playerIndex, previousActions = [] } = situation;

    // 유효성 검사
    this.validateSituation(situation);

    // 캐시 키 생성
    const cacheKey = this.generateCacheKey(situation);

    // 캐시된 결과 확인
    if (this.ranges.has(cacheKey)) {
      return this.ranges.get(cacheKey);
    }

    // 스택 깊이 계산 (현재 플레이어의 유효 스택)
    const effectiveStack = this.calculateEffectiveStack(stacks, playerIndex);

    // ICM 압박 계산
    const icmPressure = this.icmCalculator.calculateICMPressure(stacks, playerIndex);

    // 기본 Nash 범위 가져오기
    const baseRange = this.getBaseNashRange(position, effectiveStack);

    // ICM 조정 적용
    const icmAdjustedRange = this.applyICMAdjustment(baseRange, icmPressure, effectiveStack);

    // 이전 액션에 따른 조정
    const finalRange = this.adjustForPreviousActions(icmAdjustedRange, previousActions, position);

    // 결과 캐싱
    this.ranges.set(cacheKey, finalRange);

    return finalRange;
  }

  /**
   * 특정 핸드의 Push EV 계산
   * @param {string} hand - 핸드 (예: 'AA', 'AKs')
   * @param {Object} situation - 게임 상황
   * @returns {Object} EV 계산 결과
   */
  calculateHandPushEV(hand, situation) {
    const { stacks, playerIndex, position } = situation;

    // 콜 확률 추정 (상대 포지션과 스택 기반)
    const callProbability = this.estimateCallProbability(situation, hand);

    // 핸드 승률 계산 (평균적인 콜링 레인지 대비)
    const winProbability = this.calculateHandEquity(hand, position);

    // ICM 기반 Push EV 계산
    const pushEV = this.icmCalculator.calculatePushEV({
      pusherIndex: playerIndex,
      pusherStack: stacks[playerIndex],
      callerIndex: this.getNextActivePlayer(stacks, playerIndex),
      callerStack: stacks[this.getNextActivePlayer(stacks, playerIndex)],
      callProbability,
      winProbability,
      otherStacks: stacks.filter(
        (_, i) => i !== playerIndex && i !== this.getNextActivePlayer(stacks, playerIndex),
      ),
    });

    return {
      hand,
      currentEquity: pushEV.currentEquity,
      pushEquity: pushEV.expectedEquity,
      evDifference: pushEV.evDifference,
      winProbability,
      callProbability,
      profitable: pushEV.evDifference > 0,
    };
  }

  /**
   * 전체 핸드 레인지의 EV 계산
   * @param {Object} situation - 게임 상황
   * @returns {Array} 각 핸드의 EV 결과 배열
   */
  calculateFullRangeEV(situation) {
    const results = [];

    // 모든 169개 핸드에 대해 계산
    for (let row = 0; row < 13; row++) {
      for (let col = 0; col < 13; col++) {
        const hand = HAND_MATRIX[row][col];
        const handEV = this.calculateHandPushEV(hand, situation);
        results.push({
          ...handEV,
          row,
          col,
          hand,
        });
      }
    }

    // EV 순으로 정렬
    return results.sort((a, b) => b.evDifference - a.evDifference);
  }

  /**
   * 기본 Nash Equilibrium 범위 가져오기
   * @param {string} position - 포지션
   * @param {number} effectiveStack - 유효 스택 (BB 단위)
   * @returns {Array} 기본 push 범위
   */
  getBaseNashRange(position, effectiveStack) {
    // 스택 깊이에 따른 기본 범위 (임시 구현)
    // 실제로는 ranges.json에서 로드하거나 정확한 Nash 데이터 사용

    if (effectiveStack <= 10) {
      // 10BB 이하: 매우 넓은 범위
      return this.getWideRange(position, 0.4); // 상위 40%
    } else if (effectiveStack <= 15) {
      // 15BB 이하: 넓은 범위
      return this.getWideRange(position, 0.25); // 상위 25%
    } else if (effectiveStack <= 20) {
      // 20BB 이하: 중간 범위
      return this.getWideRange(position, 0.15); // 상위 15%
    }
    // 20BB 초과: 타이트한 범위
    return this.getWideRange(position, 0.08); // 상위 8%
  }

  /**
   * 포지션과 퍼센티지에 따른 핸드 범위 생성
   * @param {string} position - 포지션
   * @param {number} percentage - 포함할 핸드 비율 (0-1)
   * @returns {Array} 핸드 목록
   */
  getWideRange(position, percentage) {
    // 간단한 핸드 순위 (실제로는 더 정교한 순위 필요)
    const handRankings = [
      'AA',
      'KK',
      'QQ',
      'AKs',
      'JJ',
      'AQs',
      'KQs',
      'AJs',
      'KJs',
      'TT',
      'AKo',
      'ATs',
      'QJs',
      'KTs',
      'QTs',
      'JTs',
      '99',
      'AQo',
      'A9s',
      'KQo',
      '88',
      'K9s',
      'T9s',
      'A8s',
      'Q9s',
      'J9s',
      'AJo',
      'A5s',
      '77',
      'A7s',
      'KJo',
      'A4s',
      'A3s',
      'A6s',
      'QJo',
      '66',
      'K8s',
      'T8s',
      'A2s',
      '98s',
      'J8s',
      'ATo',
      'Q8s',
      'K7s',
      'KTo',
      '55',
      'JTo',
      '87s',
      'QTo',
      '44',
      '33',
      '22',
      '97s',
      '76s',
      'K6s',
      'K5s',
      'K4s',
      'K3s',
      'K2s',
      'Q7s',
      '86s',
      '65s',
      'J7s',
      '54s',
      'Q6s',
      '75s',
      '85s',
      'J6s',
      'Q5s',
      '64s',
      'Q4s',
      'Q3s',
      'T7s',
      'Q2s',
      '96s',
      '53s',
      '85o',
      '74s',
      '84s',
      '95s',
      'J5s',
      '43s',
      '73s',
      '63s',
      '94s',
      '52s',
      '84o',
      '42s',
      '93s',
      '74o',
      '32s',
      '92s',
      '62s',
      '83s',
      '72s',
      '82s',
      '73o',
      '92o',
      '62o',
      '52o',
      '72o',
      '42o',
      '32o',
    ];

    // 포지션별 조정
    let adjustedPercentage = percentage;
    switch (position) {
      case POSITIONS.BTN:
        adjustedPercentage *= 1.3; // 30% 더 넓게
        break;
      case POSITIONS.SB:
        adjustedPercentage *= 1.2; // 20% 더 넓게
        break;
      case POSITIONS.BB:
        adjustedPercentage *= 0.8; // 20% 더 타이트하게
        break;
      case POSITIONS.UTG:
        adjustedPercentage *= 0.7; // 30% 더 타이트하게
        break;
      case POSITIONS.MP:
        adjustedPercentage *= 0.85; // 15% 더 타이트하게
        break;
      case POSITIONS.CO:
        adjustedPercentage *= 1.1; // 10% 더 넓게
        break;
    }

    // 범위를 0-1로 제한
    adjustedPercentage = Math.max(0, Math.min(1, adjustedPercentage));

    const handCount = Math.floor(handRankings.length * adjustedPercentage);
    return handRankings.slice(0, handCount);
  }

  /**
   * ICM 압박에 따른 범위 조정
   * @param {Array} baseRange - 기본 범위
   * @param {number} icmPressure - ICM 압박 팩터
   * @param {number} effectiveStack - 유효 스택
   * @returns {Array} 조정된 범위
   */
  applyICMAdjustment(baseRange, icmPressure, _effectiveStack) {
    // ICM 압박이 높을수록 더 타이트하게
    // const icmFactor = Math.max(0.5, Math.min(1.5, 2 - icmPressure)); // Currently unused

    // 버블 상황에서는 더욱 타이트하게
    if (icmPressure > 1.5) {
      return baseRange.slice(0, Math.floor(baseRange.length * 0.7));
    } else if (icmPressure > 1.2) {
      return baseRange.slice(0, Math.floor(baseRange.length * 0.85));
    }

    return baseRange;
  }

  /**
   * 이전 액션에 따른 범위 조정
   * @param {Array} range - 현재 범위
   * @param {Array} previousActions - 이전 액션들
   * @param {string} position - 현재 포지션
   * @returns {Array} 조정된 범위
   */
  adjustForPreviousActions(range, previousActions, _position) {
    let adjustedRange = [...range];

    // 앞에서 레이즈가 있었다면 더 타이트하게
    const hasRaise = previousActions.some(
      (action) => action.type === ACTIONS.RAISE || action.type === ACTIONS.PUSH,
    );

    if (hasRaise) {
      // 레이즈 대응 시 범위를 30% 줄임
      adjustedRange = adjustedRange.slice(0, Math.floor(adjustedRange.length * 0.7));
    }

    // 여러 명이 액션했다면 더욱 타이트하게
    const activeActions = previousActions.filter((action) => action.type !== ACTIONS.FOLD).length;

    if (activeActions > 1) {
      adjustedRange = adjustedRange.slice(0, Math.floor(adjustedRange.length * 0.8));
    }

    return adjustedRange;
  }

  /**
   * 유효 스택 계산
   * @param {Array} stacks - 모든 플레이어 스택
   * @param {number} playerIndex - 현재 플레이어 인덱스
   * @returns {number} 유효 스택 (BB 단위)
   */
  calculateEffectiveStack(stacks, playerIndex) {
    const currentStack = stacks[playerIndex];
    const otherStacks = stacks.filter((_, i) => i !== playerIndex && stacks[i] > 0);

    if (otherStacks.length === 0) {
      return currentStack;
    }

    // 가장 큰 상대 스택과 현재 스택 중 작은 값
    const maxOpponentStack = Math.max(...otherStacks);
    return Math.min(currentStack, maxOpponentStack);
  }

  /**
   * 콜 확률 추정
   * @param {Object} situation - 게임 상황
   * @param {string} hand - 푸시하는 핸드
   * @returns {number} 콜 확률 (0-1)
   */
  estimateCallProbability(situation, _hand) {
    const { stacks, playerIndex, position } = situation;
    const effectiveStack = this.calculateEffectiveStack(stacks, playerIndex);
    const nextPlayer = this.getNextActivePlayer(stacks, playerIndex);
    const nextPlayerStack = stacks[nextPlayer];

    // 스택 비율에 따른 기본 콜 확률
    let baseProbability;
    if (effectiveStack <= 8) {
      baseProbability = 0.4; // 짧은 스택에서는 많이 콜
    } else if (effectiveStack <= 15) {
      baseProbability = 0.25;
    } else {
      baseProbability = 0.15; // 깊은 스택에서는 적게 콜
    }

    // 포지션별 조정
    if (position === POSITIONS.BTN || position === POSITIONS.SB) {
      baseProbability *= 1.2; // 블라인드 공격은 더 많이 콜당함
    }

    // 상대 스택 크기에 따른 조정
    const stackRatio = nextPlayerStack / effectiveStack;
    if (stackRatio > 2) {
      baseProbability *= 1.3; // 상대가 깊은 스택이면 더 많이 콜
    } else if (stackRatio < 0.8) {
      baseProbability *= 0.7; // 상대 스택이 작으면 덜 콜
    }

    return Math.max(0.05, Math.min(0.8, baseProbability));
  }

  /**
   * 핸드 승률 계산 (간단한 룩업 테이블)
   * @param {string} hand - 핸드
   * @param {string} position - 포지션
   * @returns {number} 승률 (0-1)
   */
  calculateHandEquity(hand, _position) {
    // 간단한 핸드 승률 테이블 (실제로는 더 정교한 계산 필요)
    const equityTable = {
      AA: 0.85,
      KK: 0.82,
      QQ: 0.8,
      JJ: 0.77,
      TT: 0.75,
      99: 0.72,
      88: 0.69,
      77: 0.66,
      66: 0.63,
      55: 0.6,
      44: 0.57,
      33: 0.54,
      22: 0.51,
      AKs: 0.67,
      AQs: 0.66,
      AJs: 0.65,
      ATs: 0.64,
      A9s: 0.62,
      AKo: 0.65,
      AQo: 0.64,
      AJo: 0.63,
      ATo: 0.62,
      A9o: 0.6,
      KQs: 0.63,
      KJs: 0.61,
      KTs: 0.6,
      K9s: 0.58,
      KQo: 0.61,
      KJo: 0.59,
      KTo: 0.58,
      K9o: 0.56,
      QJs: 0.6,
      QTs: 0.58,
      Q9s: 0.56,
      QJo: 0.58,
      QTo: 0.56,
      Q9o: 0.54,
      JTs: 0.57,
      J9s: 0.55,
      T9s: 0.54,
      JTo: 0.55,
      J9o: 0.53,
      T9o: 0.52,
    };

    // 기본값: 평균적인 랜덤 핸드 승률
    let baseEquity = equityTable[hand] || 0.5;

    // 멀티웨이 팟에서는 승률 감소
    baseEquity *= 0.85; // 평균 2.5명 정도와 대결한다고 가정

    return baseEquity;
  }

  /**
   * 다음 활성 플레이어 찾기
   * @param {Array} stacks - 스택 배열
   * @param {number} currentIndex - 현재 플레이어 인덱스
   * @returns {number} 다음 활성 플레이어 인덱스
   */
  getNextActivePlayer(stacks, currentIndex) {
    for (let i = 1; i < stacks.length; i++) {
      const nextIndex = (currentIndex + i) % stacks.length;
      if (stacks[nextIndex] > 0) {
        return nextIndex;
      }
    }
    return currentIndex; // 자기 자신만 남은 경우
  }

  /**
   * 상황 유효성 검사
   * @param {Object} situation - 게임 상황
   * @throws {Error} 유효하지 않은 상황일 때
   */
  validateSituation(situation) {
    const { stacks, position, playerIndex } = situation;

    if (!Array.isArray(stacks) || stacks.length < 2) {
      throw new Error('스택 배열이 유효하지 않습니다.');
    }

    if (!Object.values(POSITIONS).includes(position)) {
      throw new Error('유효하지 않은 포지션입니다.');
    }

    if (playerIndex < 0 || playerIndex >= stacks.length) {
      throw new Error('플레이어 인덱스가 유효하지 않습니다.');
    }

    if (stacks[playerIndex] <= 0) {
      throw new Error('현재 플레이어의 스택이 0 이하입니다.');
    }
  }

  /**
   * 캐시 키 생성
   * @param {Object} situation - 게임 상황
   * @returns {string} 캐시 키
   */
  generateCacheKey(situation) {
    const { stacks, position, playerIndex, previousActions = [] } = situation;

    // 상황을 문자열로 직렬화
    const stacksKey = stacks.map((s) => Math.floor(s)).join(',');
    const actionsKey = previousActions.map((a) => `${a.type}:${a.position}`).join('|');

    return `${position}:${playerIndex}:${stacksKey}:${actionsKey}`;
  }

  /**
   * 캐시 클리어
   */
  clearCache() {
    this.ranges.clear();
  }
}

/**
 * 유틸리티 함수들
 */

/**
 * 핸드가 포켓 페어인지 확인
 * @param {string} hand - 핸드
 * @returns {boolean}
 */
export function isPocketPair(hand) {
  return hand.length === 2 && hand[0] === hand[1];
}

/**
 * 핸드가 수티드인지 확인
 * @param {string} hand - 핸드
 * @returns {boolean}
 */
export function isSuited(hand) {
  return hand.endsWith('s');
}

/**
 * 핸드가 오프수트인지 확인
 * @param {string} hand - 핸드
 * @returns {boolean}
 */
export function isOffsuit(hand) {
  return hand.endsWith('o');
}

/**
 * 핸드 범위를 퍼센트로 변환
 * @param {Array} range - 핸드 범위
 * @returns {number} 퍼센트 (0-100)
 */
export function rangeToPercentage(range) {
  return (range.length / 169) * 100;
}

/**
 * 간단한 Push/Fold 추천 함수
 * @param {Object} situation - 게임 상황
 * @returns {Object} 추천 결과
 */
export function getQuickRecommendation(situation) {
  const calculator = new PushFoldCalculator();
  const pushRange = calculator.calculatePushRange(situation);
  const percentage = rangeToPercentage(pushRange);

  return {
    action: pushRange.length > 0 ? ACTIONS.PUSH : ACTIONS.FOLD,
    range: pushRange,
    percentage: percentage.toFixed(1),
    confidence: percentage > 20 ? 'high' : percentage > 10 ? 'medium' : 'low',
  };
}

// 기본 내보내기
export default PushFoldCalculator;

// CommonJS 호환성
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PushFoldCalculator,
    POSITIONS,
    ACTIONS,
    isPocketPair,
    isSuited,
    isOffsuit,
    rangeToPercentage,
    getQuickRecommendation,
  };
}
