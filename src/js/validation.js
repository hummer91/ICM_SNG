/**
 * 데이터 검증 계층
 *
 * ICM SNG 포커 앱의 모든 입력 및 계산 결과에 대한 포괄적인 검증 시스템
 * 입력 검증, 계산 결과 검증, 에러 핸들링, 자동 수정 기능 포함
 *
 * @author ICM SNG Poker App
 * @version 1.0.0
 */

import { POSITIONS, ACTIONS } from './pushfold.js';
import { GAME_PHASE } from './gamestate.js';

/**
 * 검증 에러 클래스
 */
export class ValidationError extends Error {
  constructor(message, code, field, suggestion = null) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.field = field;
    this.suggestion = suggestion;
    this.timestamp = new Date();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      field: this.field,
      suggestion: this.suggestion,
      timestamp: this.timestamp,
    };
  }
}

/**
 * 검증 경고 클래스
 */
export class ValidationWarning {
  constructor(message, code, field, suggestion = null) {
    this.message = message;
    this.code = code;
    this.field = field;
    this.suggestion = suggestion;
    this.timestamp = new Date();
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
      field: this.field,
      suggestion: this.suggestion,
      timestamp: this.timestamp,
    };
  }
}

/**
 * 검증 결과 클래스
 */
export class ValidationResult {
  constructor(isValid = true, data = null) {
    this.isValid = isValid;
    this.data = data;
    this.errors = [];
    this.warnings = [];
    this.correctedData = null;
    this.suggestions = [];
  }

  addError(message, code, field, suggestion = null) {
    const error = new ValidationError(message, code, field, suggestion);
    this.errors.push(error);
    this.isValid = false;
    return this;
  }

  addWarning(message, code, field, suggestion = null) {
    const warning = new ValidationWarning(message, code, field, suggestion);
    this.warnings.push(warning);
    return this;
  }

  addSuggestion(suggestion) {
    this.suggestions.push(suggestion);
    return this;
  }

  setCorrectedData(data) {
    this.correctedData = data;
    return this;
  }

  hasErrors() {
    return this.errors.length > 0;
  }

  hasWarnings() {
    return this.warnings.length > 0;
  }

  getFirstError() {
    return this.errors.length > 0 ? this.errors[0] : null;
  }

  getAllMessages() {
    return [
      ...this.errors.map((e) => ({ type: 'error', ...e.toJSON() })),
      ...this.warnings.map((w) => ({ type: 'warning', ...w.toJSON() })),
    ];
  }

  toJSON() {
    return {
      isValid: this.isValid,
      data: this.data,
      correctedData: this.correctedData,
      errors: this.errors.map((e) => e.toJSON()),
      warnings: this.warnings.map((w) => w.toJSON()),
      suggestions: this.suggestions,
    };
  }
}

/**
 * 검증 설정
 */
export const VALIDATION_CONFIG = {
  stackSize: {
    min: 0.5, // 최소 0.5 BB
    max: 100, // 최대 100 BB
    warningMin: 1, // 1 BB 미만 시 경고
    warningMax: 50, // 50 BB 초과 시 경고
  },
  blindLevel: {
    min: 1,
    max: 20,
    maxDuration: 30, // 최대 30분
    validLevels: [
      { small: 10, big: 20, ante: 0 },
      { small: 15, big: 30, ante: 0 },
      { small: 20, big: 40, ante: 0 },
      { small: 30, big: 60, ante: 0 },
      { small: 40, big: 80, ante: 0 },
      { small: 50, big: 100, ante: 0 },
      { small: 60, big: 120, ante: 0 },
      { small: 75, big: 150, ante: 0 },
      { small: 90, big: 180, ante: 0 },
      { small: 100, big: 200, ante: 0 },
      { small: 125, big: 250, ante: 0 },
      { small: 150, big: 300, ante: 0 },
    ],
  },
  icmTolerance: {
    probabilitySum: 0.0001, // 확률 합계 허용 오차
    equitySum: 0.0001, // equity 합계 허용 오차
  },
  evRange: {
    min: -1.0, // 최소 EV (-100%)
    max: 1.0, // 최대 EV (100%)
    warningThreshold: 0.5, // 50% 이상 EV 시 경고
  },
  handRange: {
    maxPercentage: 100, // 최대 100%
    minPercentage: 0, // 최소 0%
  },
  timeouts: {
    actionTimeout: 120, // 액션 타임아웃 (초)
    handTimeout: 600, // 핸드 타임아웃 (초)
  },
};

/**
 * 에러 코드 정의
 */
export const ERROR_CODES = {
  // 스택 검증
  STACK_TOO_SMALL: 'STACK_TOO_SMALL',
  STACK_TOO_LARGE: 'STACK_TOO_LARGE',
  STACK_NEGATIVE: 'STACK_NEGATIVE',
  STACK_INVALID_TYPE: 'STACK_INVALID_TYPE',

  // 포지션 검증
  POSITION_INVALID: 'POSITION_INVALID',
  POSITION_DUPLICATE: 'POSITION_DUPLICATE',
  POSITION_MISSING: 'POSITION_MISSING',

  // 액션 검증
  ACTION_INVALID: 'ACTION_INVALID',
  ACTION_OUT_OF_TURN: 'ACTION_OUT_OF_TURN',
  ACTION_AMOUNT_INVALID: 'ACTION_AMOUNT_INVALID',
  ACTION_INSUFFICIENT_STACK: 'ACTION_INSUFFICIENT_STACK',
  ACTION_SEQUENCE_INVALID: 'ACTION_SEQUENCE_INVALID',

  // 블라인드 검증
  BLIND_LEVEL_INVALID: 'BLIND_LEVEL_INVALID',
  BLIND_STRUCTURE_INVALID: 'BLIND_STRUCTURE_INVALID',
  BLIND_PROGRESSION_INVALID: 'BLIND_PROGRESSION_INVALID',

  // ICM 검증
  ICM_PROBABILITY_SUM_INVALID: 'ICM_PROBABILITY_SUM_INVALID',
  ICM_EQUITY_SUM_INVALID: 'ICM_EQUITY_SUM_INVALID',
  ICM_NEGATIVE_PROBABILITY: 'ICM_NEGATIVE_PROBABILITY',
  ICM_STACKS_INVALID: 'ICM_STACKS_INVALID',

  // EV 검증
  EV_OUT_OF_RANGE: 'EV_OUT_OF_RANGE',
  EV_CALCULATION_ERROR: 'EV_CALCULATION_ERROR',

  // 핸드 범위 검증
  RANGE_PERCENTAGE_INVALID: 'RANGE_PERCENTAGE_INVALID',
  RANGE_HANDS_INVALID: 'RANGE_HANDS_INVALID',
  RANGE_CONSISTENCY_ERROR: 'RANGE_CONSISTENCY_ERROR',
};

/**
 * 입력 검증 미들웨어
 */
export class InputValidator {
  constructor(config = VALIDATION_CONFIG) {
    this.config = { ...VALIDATION_CONFIG, ...config };
  }

  /**
   * 스택 사이즈 검증 (BB 단위)
   * @param {number} stackSize - 스택 크기 (BB 단위)
   * @param {string} field - 필드명
   * @param {boolean} autoCorrect - 자동 수정 여부
   * @returns {ValidationResult}
   */
  validateStackSize(stackSize, field = 'stackSize', autoCorrect = true) {
    const result = new ValidationResult(true, stackSize);

    // 타입 검증
    if (typeof stackSize !== 'number' || isNaN(stackSize)) {
      return result.addError(
        `스택 크기는 숫자여야 합니다: ${stackSize}`,
        ERROR_CODES.STACK_INVALID_TYPE,
        field,
        '유효한 숫자를 입력해주세요',
      );
    }

    // 음수 검증
    if (stackSize < 0) {
      if (autoCorrect) {
        result.setCorrectedData(0);
        result.addWarning(
          `음수 스택이 0으로 수정되었습니다: ${stackSize} → 0`,
          ERROR_CODES.STACK_NEGATIVE,
          field,
        );
      } else {
        return result.addError(
          `스택 크기는 음수일 수 없습니다: ${stackSize}`,
          ERROR_CODES.STACK_NEGATIVE,
          field,
          '0 이상의 값을 입력해주세요',
        );
      }
    }

    // 최소값 검증
    if (stackSize < this.config.stackSize.min) {
      if (autoCorrect) {
        result.setCorrectedData(this.config.stackSize.min);
        result.addWarning(
          `스택이 최소값으로 수정되었습니다: ${stackSize} → ${this.config.stackSize.min}BB`,
          ERROR_CODES.STACK_TOO_SMALL,
          field,
        );
      } else {
        return result.addError(
          `스택이 너무 작습니다: ${stackSize}BB (최소: ${this.config.stackSize.min}BB)`,
          ERROR_CODES.STACK_TOO_SMALL,
          field,
          `최소 ${this.config.stackSize.min}BB 이상 입력해주세요`,
        );
      }
    }

    // 최대값 검증
    if (stackSize > this.config.stackSize.max) {
      if (autoCorrect) {
        result.setCorrectedData(this.config.stackSize.max);
        result.addWarning(
          `스택이 최대값으로 수정되었습니다: ${stackSize} → ${this.config.stackSize.max}BB`,
          ERROR_CODES.STACK_TOO_LARGE,
          field,
        );
      } else {
        return result.addError(
          `스택이 너무 큽니다: ${stackSize}BB (최대: ${this.config.stackSize.max}BB)`,
          ERROR_CODES.STACK_TOO_LARGE,
          field,
          `최대 ${this.config.stackSize.max}BB 이하로 입력해주세요`,
        );
      }
    }

    // 경고 범위 검증
    if (stackSize < this.config.stackSize.warningMin) {
      result.addWarning(
        `매우 짧은 스택입니다: ${stackSize}BB`,
        ERROR_CODES.STACK_TOO_SMALL,
        field,
        'Push/Fold 전략을 고려하세요',
      );
    }

    if (stackSize > this.config.stackSize.warningMax) {
      result.addWarning(
        `매우 깊은 스택입니다: ${stackSize}BB`,
        ERROR_CODES.STACK_TOO_LARGE,
        field,
        '복잡한 포스트플랍 플레이가 필요할 수 있습니다',
      );
    }

    return result;
  }

  /**
   * 포지션 유효성 검사
   * @param {string} position - 포지션
   * @param {string} field - 필드명
   * @returns {ValidationResult}
   */
  validatePosition(position, field = 'position') {
    const result = new ValidationResult(true, position);

    if (!position) {
      return result.addError(
        '포지션이 제공되지 않았습니다',
        ERROR_CODES.POSITION_MISSING,
        field,
        '유효한 포지션을 선택해주세요',
      );
    }

    if (!Object.values(POSITIONS).includes(position)) {
      const validPositions = Object.values(POSITIONS).join(', ');
      return result.addError(
        `유효하지 않은 포지션입니다: ${position}`,
        ERROR_CODES.POSITION_INVALID,
        field,
        `유효한 포지션: ${validPositions}`,
      );
    }

    return result;
  }

  /**
   * 액션 시퀀스 검증
   * @param {string} action - 액션
   * @param {number} amount - 액션 금액
   * @param {Object} context - 컨텍스트 (플레이어, 게임 상태 등)
   * @param {string} field - 필드명
   * @returns {ValidationResult}
   */
  validateActionSequence(action, amount, context = {}, field = 'action') {
    const result = new ValidationResult(true, { action, amount });
    const { player, currentBet = 0, minRaise = 0, gamePhase } = context;

    // 액션 유효성 검증
    if (!Object.values(ACTIONS).includes(action)) {
      return result.addError(
        `유효하지 않은 액션입니다: ${action}`,
        ERROR_CODES.ACTION_INVALID,
        field,
        `유효한 액션: ${Object.values(ACTIONS).join(', ')}`,
      );
    }

    // 게임 단계 검증
    if (gamePhase !== GAME_PHASE.PLAYING) {
      return result.addError(
        `현재 게임 단계에서는 액션할 수 없습니다: ${gamePhase}`,
        ERROR_CODES.ACTION_SEQUENCE_INVALID,
        field,
        '게임이 진행 중일 때만 액션할 수 있습니다',
      );
    }

    // 플레이어 검증
    if (!player) {
      return result.addError(
        '플레이어 정보가 없습니다',
        ERROR_CODES.ACTION_SEQUENCE_INVALID,
        field,
      );
    }

    // 플레이어 상태 검증
    if (!player.canAct()) {
      return result.addError(
        `현재 플레이어는 액션할 수 없습니다 (상태: ${player.status})`,
        ERROR_CODES.ACTION_OUT_OF_TURN,
        field,
        '활성 상태의 플레이어만 액션할 수 있습니다',
      );
    }

    // 액션별 세부 검증
    switch (action) {
      case ACTIONS.FOLD:
        // 폴드는 항상 가능
        break;

      case ACTIONS.CALL: {
        const callAmount = currentBet - (player.betAmount || 0);
        const maxCallAmount = Math.min(callAmount, player.stack);

        if (amount !== maxCallAmount) {
          if (amount === player.stack && amount < callAmount) {
            // 올인 콜인 경우
            result.addWarning(
              `올인 콜: ${amount} (필요한 금액: ${callAmount})`,
              ERROR_CODES.ACTION_AMOUNT_INVALID,
              field,
            );
          } else {
            return result.addError(
              `잘못된 콜 금액입니다: ${amount} (필요: ${maxCallAmount})`,
              ERROR_CODES.ACTION_AMOUNT_INVALID,
              field,
              `${maxCallAmount} 칩을 베팅해야 합니다`,
            );
          }
        }
        break;
      }

      case ACTIONS.RAISE: {
        const minRaiseAmount = currentBet + minRaise;

        if (amount < minRaiseAmount && amount !== player.stack) {
          return result.addError(
            `레이즈 금액이 부족합니다: ${amount} (최소: ${minRaiseAmount})`,
            ERROR_CODES.ACTION_AMOUNT_INVALID,
            field,
            `최소 ${minRaiseAmount} 칩을 베팅해야 합니다`,
          );
        }

        if (amount > player.stack) {
          return result.addError(
            `보유 칩보다 많은 베팅입니다: ${amount} (보유: ${player.stack})`,
            ERROR_CODES.ACTION_INSUFFICIENT_STACK,
            field,
            `최대 ${player.stack} 칩까지 베팅할 수 있습니다`,
          );
        }
        break;
      }

      case ACTIONS.PUSH: {
        if (amount !== player.stack) {
          return result.addError(
            `올인 금액이 잘못되었습니다: ${amount} (전체 스택: ${player.stack})`,
            ERROR_CODES.ACTION_AMOUNT_INVALID,
            field,
            `올인은 전체 스택과 같아야 합니다: ${player.stack}`,
          );
        }
        break;
      }

      default:
        return result.addError(
          `지원되지 않는 액션입니다: ${action}`,
          ERROR_CODES.ACTION_INVALID,
          field,
        );
    }

    return result;
  }

  /**
   * 블라인드 레벨 유효성 검증
   * @param {Object} blindLevel - 블라인드 레벨 정보
   * @param {string} field - 필드명
   * @returns {ValidationResult}
   */
  validateBlindLevel(blindLevel, field = 'blindLevel') {
    const result = new ValidationResult(true, blindLevel);

    if (!blindLevel || typeof blindLevel !== 'object') {
      return result.addError(
        '블라인드 레벨 정보가 유효하지 않습니다',
        ERROR_CODES.BLIND_LEVEL_INVALID,
        field,
      );
    }

    const { small, big, ante = 0 } = blindLevel;

    // 블라인드 크기 검증
    if (typeof small !== 'number' || small <= 0) {
      return result.addError(
        `유효하지 않은 스몰 블라인드입니다: ${small}`,
        ERROR_CODES.BLIND_STRUCTURE_INVALID,
        field,
        '스몰 블라인드는 양수여야 합니다',
      );
    }

    if (typeof big !== 'number' || big <= 0) {
      return result.addError(
        `유효하지 않은 빅 블라인드입니다: ${big}`,
        ERROR_CODES.BLIND_STRUCTURE_INVALID,
        field,
        '빅 블라인드는 양수여야 합니다',
      );
    }

    if (big <= small) {
      return result.addError(
        `빅 블라인드가 스몰 블라인드보다 작거나 같습니다: ${big} <= ${small}`,
        ERROR_CODES.BLIND_STRUCTURE_INVALID,
        field,
        '빅 블라인드는 스몰 블라인드보다 커야 합니다',
      );
    }

    // 토너먼트 블라인드 구조 검증
    const validLevel = this.config.blindLevel.validLevels.find(
      (level) => level.small === small && level.big === big && level.ante === ante,
    );

    if (!validLevel) {
      const validLevelsStr = this.config.blindLevel.validLevels
        .map((level) => `${level.small}/${level.big}`)
        .join(', ');
      return result.addError(
        `유효하지 않은 블라인드 구조입니다: ${small}/${big} (안테: ${ante})`,
        ERROR_CODES.BLIND_STRUCTURE_INVALID,
        field,
        `유효한 블라인드 레벨: ${validLevelsStr}. 안테는 항상 0이어야 합니다.`,
      );
    }

    // 안테 검증 - 새로운 토너먼트는 안테가 없음
    if (ante !== 0) {
      return result.addError(
        `이 토너먼트에서는 안테가 허용되지 않습니다: ${ante}`,
        ERROR_CODES.BLIND_STRUCTURE_INVALID,
        field,
        '안테는 반드시 0이어야 합니다',
      );
    }

    return result;
  }

  /**
   * 플레이어 배열 검증
   * @param {Array} players - 플레이어 배열
   * @param {string} field - 필드명
   * @returns {ValidationResult}
   */
  validatePlayers(players, field = 'players') {
    const result = new ValidationResult(true, players);

    if (!Array.isArray(players)) {
      return result.addError(
        '플레이어 정보가 배열이 아닙니다',
        ERROR_CODES.STACK_INVALID_TYPE,
        field,
        '플레이어는 배열 형태여야 합니다',
      );
    }

    if (players.length < 2) {
      return result.addError(
        `플레이어가 부족합니다: ${players.length}명 (최소 2명 필요)`,
        ERROR_CODES.STACK_INVALID_TYPE,
        field,
        '최소 2명의 플레이어가 필요합니다',
      );
    }

    if (players.length > 6) {
      return result.addError(
        `플레이어가 너무 많습니다: ${players.length}명 (최대 6명)`,
        ERROR_CODES.STACK_INVALID_TYPE,
        field,
        '최대 6명까지만 참여할 수 있습니다',
      );
    }

    // 개별 플레이어 검증
    const positions = new Set();
    players.forEach((player, index) => {
      if (!player) {
        result.addError(
          `플레이어 ${index + 1}의 정보가 없습니다`,
          ERROR_CODES.STACK_INVALID_TYPE,
          `${field}[${index}]`,
        );
        return;
      }

      // 스택 검증
      const stackResult = this.validateStackSize(player.stack, `${field}[${index}].stack`, false);
      if (stackResult.hasErrors()) {
        result.errors.push(...stackResult.errors);
      }

      // 포지션 중복 검증
      if (player.position) {
        if (positions.has(player.position)) {
          result.addError(
            `중복된 포지션입니다: ${player.position}`,
            ERROR_CODES.POSITION_DUPLICATE,
            `${field}[${index}].position`,
            '각 플레이어는 고유한 포지션을 가져야 합니다',
          );
        } else {
          positions.add(player.position);
        }
      }
    });

    return result;
  }
}

/**
 * 계산 결과 검증기
 */
export class CalculationValidator {
  constructor(config = VALIDATION_CONFIG) {
    this.config = { ...VALIDATION_CONFIG, ...config };
  }

  /**
   * ICM 확률 합계 검증
   * @param {Array} probabilities - 확률 배열 [플레이어][순위]
   * @param {string} field - 필드명
   * @returns {ValidationResult}
   */
  validateICMProbabilities(probabilities, field = 'icmProbabilities') {
    const result = new ValidationResult(true, probabilities);

    if (!Array.isArray(probabilities)) {
      return result.addError(
        'ICM 확률이 배열이 아닙니다',
        ERROR_CODES.ICM_PROBABILITY_SUM_INVALID,
        field,
      );
    }

    // const numPlayers = probabilities.length; // Currently unused
    const numPositions = probabilities[0]?.length || 0;

    // 각 플레이어의 확률 합계 검증 (≤ 1.0)
    probabilities.forEach((playerProbs, playerIndex) => {
      if (!Array.isArray(playerProbs)) {
        result.addError(
          `플레이어 ${playerIndex}의 확률이 배열이 아닙니다`,
          ERROR_CODES.ICM_PROBABILITY_SUM_INVALID,
          `${field}[${playerIndex}]`,
        );
        return;
      }

      const playerTotal = playerProbs.reduce((sum, prob) => sum + prob, 0);

      if (Math.abs(playerTotal - 1.0) > this.config.icmTolerance.probabilitySum) {
        result.addError(
          `플레이어 ${playerIndex}의 확률 합계가 1이 아닙니다: ${playerTotal}`,
          ERROR_CODES.ICM_PROBABILITY_SUM_INVALID,
          `${field}[${playerIndex}]`,
          '각 플레이어의 순위 확률 합계는 1이어야 합니다',
        );
      }

      // 음수 확률 검증
      playerProbs.forEach((prob, posIndex) => {
        if (prob < 0) {
          result.addError(
            `음수 확률이 발견되었습니다: 플레이어 ${playerIndex}, 순위 ${posIndex + 1}: ${prob}`,
            ERROR_CODES.ICM_NEGATIVE_PROBABILITY,
            `${field}[${playerIndex}][${posIndex}]`,
            '확률은 0 이상이어야 합니다',
          );
        }
      });
    });

    // 각 순위별 확률 합계 검증 (= 1.0)
    for (let position = 0; position < numPositions; position++) {
      const positionTotal = probabilities.reduce(
        (sum, playerProbs) => sum + (playerProbs[position] || 0),
        0,
      );

      if (Math.abs(positionTotal - 1.0) > this.config.icmTolerance.probabilitySum) {
        result.addError(
          `순위 ${position + 1}의 확률 합계가 1이 아닙니다: ${positionTotal}`,
          ERROR_CODES.ICM_PROBABILITY_SUM_INVALID,
          `${field}[*][${position}]`,
          '각 순위의 모든 플레이어 확률 합계는 1이어야 합니다',
        );
      }
    }

    return result;
  }

  /**
   * ICM equity 합계 검증
   * @param {Array} equities - equity 배열
   * @param {string} field - 필드명
   * @returns {ValidationResult}
   */
  validateICMEquities(equities, field = 'icmEquities') {
    const result = new ValidationResult(true, equities);

    if (!Array.isArray(equities)) {
      return result.addError(
        'ICM equity가 배열이 아닙니다',
        ERROR_CODES.ICM_EQUITY_SUM_INVALID,
        field,
      );
    }

    // equity 합계 검증 (= 1.0)
    const totalEquity = equities.reduce((sum, equity) => sum + equity, 0);

    if (Math.abs(totalEquity - 1.0) > this.config.icmTolerance.equitySum) {
      result.addError(
        `ICM equity 합계가 1이 아닙니다: ${totalEquity}`,
        ERROR_CODES.ICM_EQUITY_SUM_INVALID,
        field,
        'ICM equity의 총합은 1이어야 합니다',
      );
    }

    // 개별 equity 검증
    equities.forEach((equity, index) => {
      if (typeof equity !== 'number' || isNaN(equity)) {
        result.addError(
          `유효하지 않은 equity입니다: 플레이어 ${index}: ${equity}`,
          ERROR_CODES.ICM_EQUITY_SUM_INVALID,
          `${field}[${index}]`,
          'Equity는 숫자여야 합니다',
        );
      } else if (equity < 0 || equity > 1) {
        result.addError(
          `Equity가 범위를 벗어났습니다: 플레이어 ${index}: ${equity}`,
          ERROR_CODES.ICM_EQUITY_SUM_INVALID,
          `${field}[${index}]`,
          'Equity는 0과 1 사이여야 합니다',
        );
      }
    });

    return result;
  }

  /**
   * EV 계산 범위 검증
   * @param {number} ev - EV 값
   * @param {string} field - 필드명
   * @returns {ValidationResult}
   */
  validateEVRange(ev, field = 'ev') {
    const result = new ValidationResult(true, ev);

    if (typeof ev !== 'number' || isNaN(ev)) {
      return result.addError(
        `유효하지 않은 EV입니다: ${ev}`,
        ERROR_CODES.EV_CALCULATION_ERROR,
        field,
        'EV는 숫자여야 합니다',
      );
    }

    if (ev < this.config.evRange.min || ev > this.config.evRange.max) {
      return result.addError(
        `EV가 허용 범위를 벗어났습니다: ${ev} (범위: ${this.config.evRange.min} ~ ${this.config.evRange.max})`,
        ERROR_CODES.EV_OUT_OF_RANGE,
        field,
        `EV는 ${this.config.evRange.min}과 ${this.config.evRange.max} 사이여야 합니다`,
      );
    }

    // 극단적인 EV 경고
    if (Math.abs(ev) > this.config.evRange.warningThreshold) {
      result.addWarning(
        `극단적인 EV입니다: ${ev}`,
        ERROR_CODES.EV_OUT_OF_RANGE,
        field,
        'EV가 매우 높거나 낮습니다. 계산을 다시 확인해보세요',
      );
    }

    return result;
  }

  /**
   * Push/Fold 범위 일관성 검사
   * @param {Array} range - 핸드 범위
   * @param {number} percentage - 범위 퍼센트
   * @param {string} field - 필드명
   * @returns {ValidationResult}
   */
  validatePushFoldRange(range, percentage, field = 'pushFoldRange') {
    const result = new ValidationResult(true, { range, percentage });

    if (!Array.isArray(range)) {
      return result.addError(
        '핸드 범위가 배열이 아닙니다',
        ERROR_CODES.RANGE_HANDS_INVALID,
        field,
        '핸드 범위는 배열이어야 합니다',
      );
    }

    // 퍼센트 검증
    if (typeof percentage !== 'number' || isNaN(percentage)) {
      return result.addError(
        `유효하지 않은 퍼센트입니다: ${percentage}`,
        ERROR_CODES.RANGE_PERCENTAGE_INVALID,
        `${field}.percentage`,
        '퍼센트는 숫자여야 합니다',
      );
    }

    if (
      percentage < this.config.handRange.minPercentage ||
      percentage > this.config.handRange.maxPercentage
    ) {
      return result.addError(
        `퍼센트가 범위를 벗어났습니다: ${percentage}% (범위: 0-100%)`,
        ERROR_CODES.RANGE_PERCENTAGE_INVALID,
        `${field}.percentage`,
        '퍼센트는 0과 100 사이여야 합니다',
      );
    }

    // 범위와 퍼센트 일관성 검증
    const expectedHandCount = Math.floor((percentage / 100) * 169); // 총 169개 홀덤 핸드
    const actualHandCount = range.length;
    const tolerance = 5; // 5개 핸드 허용 오차

    if (Math.abs(actualHandCount - expectedHandCount) > tolerance) {
      result.addWarning(
        `핸드 수와 퍼센트가 일치하지 않습니다: ${actualHandCount}개 핸드 ≠ ${percentage}% (예상: ${expectedHandCount}개)`,
        ERROR_CODES.RANGE_CONSISTENCY_ERROR,
        field,
        '핸드 수와 퍼센트를 다시 확인해주세요',
      );
    }

    // 중복 핸드 검증
    const uniqueHands = new Set(range);
    if (uniqueHands.size !== range.length) {
      result.addError(
        '중복된 핸드가 포함되어 있습니다',
        ERROR_CODES.RANGE_HANDS_INVALID,
        `${field}.range`,
        '각 핸드는 한 번씩만 포함되어야 합니다',
      );
    }

    // 유효한 핸드 표기 검증 (간단한 검증)
    const invalidHands = range.filter((hand) => {
      if (typeof hand !== 'string') {
        return true;
      }
      // 간단한 핸드 표기 검증 (예: AA, AKs, AKo, 72o 등)
      return !/^([AKQJT2-9]{2}[so]?|[AKQJT2-9]{2})$/.test(hand);
    });

    if (invalidHands.length > 0) {
      result.addError(
        `유효하지 않은 핸드 표기가 있습니다: ${invalidHands.slice(0, 5).join(', ')}${invalidHands.length > 5 ? '...' : ''}`,
        ERROR_CODES.RANGE_HANDS_INVALID,
        `${field}.range`,
        '올바른 핸드 표기를 사용해주세요 (예: AA, AKs, AKo)',
      );
    }

    return result;
  }
}

/**
 * 통합 검증기
 */
export class DataValidator {
  constructor(config = VALIDATION_CONFIG) {
    this.inputValidator = new InputValidator(config);
    this.calculationValidator = new CalculationValidator(config);
    this.config = config;
  }

  /**
   * 게임 설정 전체 검증
   * @param {Object} gameConfig - 게임 설정
   * @param {boolean} autoCorrect - 자동 수정 여부
   * @returns {ValidationResult}
   */
  validateGameConfig(gameConfig, autoCorrect = true) {
    const result = new ValidationResult(true, gameConfig);
    const correctedConfig = { ...gameConfig };

    // 플레이어 검증
    if (gameConfig.players) {
      const playersResult = this.inputValidator.validatePlayers(gameConfig.players);
      if (playersResult.hasErrors()) {
        result.errors.push(...playersResult.errors);
      }
      result.warnings.push(...playersResult.warnings);
    }

    // 블라인드 구조 검증
    if (gameConfig.blindStructure) {
      gameConfig.blindStructure.forEach((level, index) => {
        const levelResult = this.inputValidator.validateBlindLevel(
          level,
          `blindStructure[${index}]`,
        );
        if (levelResult.hasErrors()) {
          result.errors.push(...levelResult.errors);
        }
        result.warnings.push(...levelResult.warnings);
      });
    }

    // 시작 스택 검증
    if (gameConfig.startingStack) {
      const stackResult = this.inputValidator.validateStackSize(
        gameConfig.startingStack,
        'startingStack',
        autoCorrect,
      );
      if (stackResult.hasErrors()) {
        result.errors.push(...stackResult.errors);
      } else if (stackResult.correctedData !== null) {
        correctedConfig.startingStack = stackResult.correctedData;
      }
      result.warnings.push(...stackResult.warnings);
    }

    if (autoCorrect && Object.keys(correctedConfig).length > 0) {
      result.setCorrectedData(correctedConfig);
    }

    return result;
  }

  /**
   * ICM 계산 결과 전체 검증
   * @param {Object} icmResult - ICM 계산 결과
   * @returns {ValidationResult}
   */
  validateICMResult(icmResult) {
    const result = new ValidationResult(true, icmResult);

    if (!icmResult || typeof icmResult !== 'object') {
      return result.addError(
        'ICM 결과가 유효하지 않습니다',
        ERROR_CODES.ICM_CALCULATION_ERROR,
        'icmResult',
      );
    }

    // 확률 검증
    if (icmResult.probabilities) {
      const probResult = this.calculationValidator.validateICMProbabilities(
        icmResult.probabilities,
      );
      if (probResult.hasErrors()) {
        result.errors.push(...probResult.errors);
      }
    }

    // Equity 검증
    if (icmResult.equities) {
      const equityResult = this.calculationValidator.validateICMEquities(icmResult.equities);
      if (equityResult.hasErrors()) {
        result.errors.push(...equityResult.errors);
      }
    }

    return result;
  }

  /**
   * 자동 수정 적용
   * @param {*} data - 원본 데이터
   * @param {ValidationResult} validationResult - 검증 결과
   * @returns {*} 수정된 데이터
   */
  applyAutoCorrection(data, validationResult) {
    if (validationResult.correctedData !== null) {
      return validationResult.correctedData;
    }
    return data;
  }

  /**
   * 검증 결과 요약
   * @param {ValidationResult} result - 검증 결과
   * @returns {Object} 검증 요약
   */
  summarizeValidation(result) {
    return {
      isValid: result.isValid,
      errorCount: result.errors.length,
      warningCount: result.warnings.length,
      hasCorrections: result.correctedData !== null,
      summary: {
        errors: result.errors.map((e) => ({ code: e.code, message: e.message, field: e.field })),
        warnings: result.warnings.map((w) => ({
          code: w.code,
          message: w.message,
          field: w.field,
        })),
        suggestions: result.suggestions,
      },
    };
  }
}

/**
 * 시나리오 데이터 검증 시스템
 * 포커 기본 규칙과 ICM 계산 무결성을 자동 검증
 */
export class ScenarioValidator {
  constructor() {
    this.validationRules = {
      blindPosting: true,
      antePosting: true,
      stackConsistency: true,
      positionLogic: true,
      icmCalculation: true,
    };
  }

  /**
   * 전체 시나리오 검증
   * @param {Array} scenarios - 검증할 시나리오 배열
   * @returns {Object} 검증 결과와 오류 목록
   */
  validateAllScenarios(scenarios) {
    const results = {
      totalScenarios: scenarios.length,
      passedScenarios: 0,
      failedScenarios: 0,
      errors: [],
      warnings: [],
    };

    scenarios.forEach((scenario, index) => {
      const scenarioResult = this.validateScenario(scenario, index + 1);

      if (scenarioResult.isValid) {
        results.passedScenarios++;
      } else {
        results.failedScenarios++;
        results.errors.push({
          scenarioId: scenario.id,
          scenarioIndex: index + 1,
          errors: scenarioResult.errors,
        });
      }

      if (scenarioResult.warnings.length > 0) {
        results.warnings.push({
          scenarioId: scenario.id,
          scenarioIndex: index + 1,
          warnings: scenarioResult.warnings,
        });
      }
    });

    return results;
  }

  /**
   * 개별 시나리오 검증
   * @param {Object} scenario - 검증할 시나리오 객체
   * @param {number} index - 시나리오 인덱스
   * @returns {Object} 검증 결과
   */
  validateScenario(scenario, index) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    try {
      // 1. 블라인드 포스팅 검증
      this.validateBlindPosting(scenario, result);

      // 2. 안테 포스팅 검증
      this.validateAntePosting(scenario, result);

      // 3. 스택 일관성 검증
      this.validateStackConsistency(scenario, result);

      // 4. 포지션 로직 검증
      this.validatePositionLogic(scenario, result);

      // 5. 팟 계산 검증
      this.validatePotCalculation(scenario, result);

      // 6. ICM 데이터 일관성 검증
      this.validateICMData(scenario, result);

      // 오류가 있으면 전체 검증 실패
      if (result.errors.length > 0) {
        result.isValid = false;
      }
    } catch (error) {
      result.isValid = false;
      result.errors.push(`시나리오 ${index} 검증 중 예외 발생: ${error.message}`);
    }

    return result;
  }

  /**
   * 블라인드 포스팅 규칙 검증
   * - SB는 small blind 금액을 포스팅해야 함
   * - BB는 big blind 금액을 포스팅해야 함
   */
  validateBlindPosting(scenario, result) {
    const { situation } = scenario;
    const { blindLevel, playerBets, positions } = situation;

    // 포지션별 플레이어 찾기
    const sbPlayer = positions.find((pos) => pos.includes('SB') || pos === 'SB');
    const bbPlayer = positions.find((pos) => pos.includes('BB') || pos === 'BB');

    // SB 검증
    if (sbPlayer) {
      const sbKey = sbPlayer.includes('HERO') ? 'HERO' : 'SB';
      const expectedSB = blindLevel.small;
      const actualSB = playerBets[sbKey] || 0;

      // SB가 올인한 경우가 아니라면 정확히 small blind를 포스팅해야 함
      const remainingStack = situation.remainingStacks[sbKey];
      const isAllIn = remainingStack === 0 && actualSB > 0;

      if (!isAllIn && actualSB !== expectedSB) {
        result.errors.push(
          `블라인드 포스팅 오류: SB(${sbKey})는 ${expectedSB}을 포스팅해야 하지만 ${actualSB}을 포스팅했습니다.`,
        );
      } else if (isAllIn && actualSB < expectedSB) {
        // 올인인데 SB보다 적게 베팅한 경우 (숏스택 상황)
        result.warnings.push(
          `SB 숏스택 올인: SB(${sbKey})가 ${expectedSB} 대신 ${actualSB}을 올인했습니다 (숏스택).`,
        );
      }
    }

    // BB 검증
    if (bbPlayer) {
      const bbKey = bbPlayer.includes('HERO') ? 'HERO' : 'BB';
      const expectedBB = blindLevel.big;
      const actualBB = playerBets[bbKey] || 0;

      // BB가 올인한 경우가 아니라면 정확히 big blind를 포스팅해야 함
      const remainingStack = situation.remainingStacks[bbKey];
      const isAllIn = remainingStack === 0 && actualBB > 0;

      if (!isAllIn && actualBB !== expectedBB) {
        result.errors.push(
          `블라인드 포스팅 오류: BB(${bbKey})는 ${expectedBB}를 포스팅해야 하지만 ${actualBB}을 포스팅했습니다.`,
        );
      }
    }
  }

  /**
   * 안테 포스팅 검증
   * - 모든 활성 플레이어가 안테를 포스팅했는지 확인
   */
  validateAntePosting(scenario, result) {
    const { situation } = scenario;
    const { blindLevel, playersLeft } = situation;
    const expectedTotalAnte = blindLevel.ante * playersLeft;
    const actualTotalAnte = situation.pot || 0;

    if (expectedTotalAnte !== actualTotalAnte) {
      result.warnings.push(
        `안테 계산 불일치: 예상 안테 ${expectedTotalAnte}, 실제 팟 ${actualTotalAnte}`,
      );
    }
  }

  /**
   * 스택 일관성 검증
   * - remainingStacks + playerBets = 원래 스택
   * - 0 스택 플레이어는 올인 상태여야 함
   */
  validateStackConsistency(scenario, result) {
    const { situation } = scenario;
    const { playerBets, remainingStacks } = situation;

    Object.keys(playerBets).forEach((player) => {
      const bet = playerBets[player] || 0;
      const stack = remainingStacks[player] || 0;

      // 스택이 0이면 반드시 베팅이 있어야 함 (올인 상태)
      if (stack === 0 && bet === 0) {
        result.errors.push(
          `스택 일관성 오류: ${player}의 스택이 0인데 베팅도 0입니다. 올인 상태가 아닙니다.`,
        );
      }

      // 베팅이 있으면 스택이나 베팅 중 하나는 0보다 커야 함
      if (bet < 0 || stack < 0) {
        result.errors.push(
          `스택 일관성 오류: ${player}의 베팅(${bet}) 또는 스택(${stack})이 음수입니다.`,
        );
      }
    });
  }

  /**
   * 포지션 로직 검증
   * - 딜러 포지션이 올바른지 확인
   * - 포지션 순서가 올바른지 확인
   */
  validatePositionLogic(scenario, result) {
    const { situation } = scenario;
    const { positions, dealerPosition, playersLeft } = situation;

    // 포지션 수와 남은 플레이어 수 일치 확인
    if (positions.length !== playersLeft) {
      result.errors.push(
        `포지션 불일치: 포지션 배열 길이(${positions.length})와 남은 플레이어 수(${playersLeft})가 다릅니다.`,
      );
    }

    // 딜러 포지션이 포지션 배열에 있는지 확인
    const dealerInPositions = positions.some(
      (pos) => pos === dealerPosition || pos.includes(dealerPosition),
    );

    if (!dealerInPositions) {
      result.warnings.push(`딜러 포지션 경고: 딜러(${dealerPosition})가 포지션 배열에 없습니다.`);
    }
  }

  /**
   * 팟 계산 검증
   * - totalPotForCalculation = pot + sum(playerBets)
   */
  validatePotCalculation(scenario, result) {
    const { situation } = scenario;
    const { pot, playerBets, totalPotForCalculation } = situation;

    const calculatedTotal = pot + Object.values(playerBets).reduce((sum, bet) => sum + bet, 0);

    if (calculatedTotal !== totalPotForCalculation) {
      result.errors.push(
        `팟 계산 오류: 계산된 총 팟(${calculatedTotal})과 저장된 값(${totalPotForCalculation})이 다릅니다.`,
      );
    }
  }

  /**
   * ICM 데이터 일관성 검증
   * - equity 합계가 100에 가까운지 확인
   * - pushEV > foldEV인 경우 정답이 push인지 확인
   */
  validateICMData(scenario, result) {
    const { icmAnalysis, correctAnswer } = scenario;

    if (icmAnalysis) {
      // Equity 합계 검증 (오차 허용 범위 ±2%)
      if (icmAnalysis.equity) {
        const totalEquity = Object.values(icmAnalysis.equity).reduce((sum, eq) => sum + eq, 0);
        if (Math.abs(totalEquity - 100) > 2) {
          result.warnings.push(`ICM equity 합계가 100에서 벗어남: ${totalEquity.toFixed(1)}%`);
        }
      }

      // EV 차이와 정답 일관성 검증
      const { pushEV, foldEV, difference } = icmAnalysis;
      if (pushEV && foldEV) {
        const calculatedDiff = pushEV - foldEV;

        // EV 차이 계산 검증
        if (Math.abs(calculatedDiff - difference) > 0.1) {
          result.warnings.push(
            `EV 차이 불일치: 계산값(${calculatedDiff.toFixed(1)}) vs 저장값(${difference})`,
          );
        }

        // 정답과 EV 일관성 검증
        if (pushEV > foldEV && correctAnswer !== 'push') {
          result.errors.push(
            `정답 불일치: pushEV(${pushEV}) > foldEV(${foldEV})인데 정답이 '${correctAnswer}'입니다.`,
          );
        } else if (foldEV > pushEV && correctAnswer !== 'fold') {
          result.errors.push(
            `정답 불일치: foldEV(${foldEV}) > pushEV(${pushEV})인데 정답이 '${correctAnswer}'입니다.`,
          );
        }
      }
    }
  }

  /**
   * 검증 결과를 콘솔에 출력
   * @param {Object} results - validateAllScenarios 결과
   */
  printValidationResults(results) {
    console.group('🎯 시나리오 검증 결과');

    console.log(`📊 전체 시나리오: ${results.totalScenarios}`);
    console.log(`✅ 통과: ${results.passedScenarios}`);
    console.log(`❌ 실패: ${results.failedScenarios}`);

    if (results.errors.length > 0) {
      console.group('❌ 오류 목록');
      results.errors.forEach((error) => {
        console.group(`시나리오 ${error.scenarioIndex} (${error.scenarioId})`);
        error.errors.forEach((err) => console.error(`• ${err}`));
        console.groupEnd();
      });
      console.groupEnd();
    }

    if (results.warnings.length > 0) {
      console.group('⚠️ 경고 목록');
      results.warnings.forEach((warning) => {
        console.group(`시나리오 ${warning.scenarioIndex} (${warning.scenarioId})`);
        warning.warnings.forEach((warn) => console.warn(`• ${warn}`));
        console.groupEnd();
      });
      console.groupEnd();
    }

    console.groupEnd();
  }
}

/**
 * 시나리오 데이터 자동 수정 도구
 */
export class ScenarioAutoFixer {
  constructor() {
    this.validator = new ScenarioValidator();
  }

  /**
   * 블라인드 포스팅 자동 수정
   * @param {Object} scenario - 수정할 시나리오
   * @returns {Object} 수정된 시나리오
   */
  fixBlindPosting(scenario) {
    const { situation } = scenario;
    const { blindLevel, positions } = situation;

    // 포지션별 플레이어 찾기 및 수정
    positions.forEach((position) => {
      if (position.includes('SB') || position === 'SB') {
        const key = position.includes('HERO') ? 'HERO' : 'SB';
        const currentStack = situation.remainingStacks[key] || 0;
        const currentBet = situation.playerBets[key] || 0;
        const totalStack = currentStack + currentBet;

        // SB가 올인이 아니면 정확한 SB 금액으로 수정
        if (totalStack >= blindLevel.small) {
          situation.playerBets[key] = blindLevel.small;
          situation.remainingStacks[key] = totalStack - blindLevel.small;
        }
      }

      if (position.includes('BB') || position === 'BB') {
        const key = position.includes('HERO') ? 'HERO' : 'BB';
        const currentStack = situation.remainingStacks[key] || 0;
        const currentBet = situation.playerBets[key] || 0;
        const totalStack = currentStack + currentBet;

        // BB가 올인이 아니면 정확한 BB 금액으로 수정
        if (totalStack >= blindLevel.big) {
          situation.playerBets[key] = blindLevel.big;
          situation.remainingStacks[key] = totalStack - blindLevel.big;
        }
      }
    });

    // 총 팟 재계산
    const newTotalPot =
      situation.pot + Object.values(situation.playerBets).reduce((sum, bet) => sum + bet, 0);
    situation.totalPotForCalculation = newTotalPot;

    return scenario;
  }

  /**
   * 전체 시나리오 자동 수정
   * @param {Array} scenarios - 수정할 시나리오 배열
   * @returns {Array} 수정된 시나리오 배열
   */
  autoFixAllScenarios(scenarios) {
    return scenarios.map((scenario) => {
      const fixed = { ...scenario };

      // 각종 자동 수정 적용
      this.fixBlindPosting(fixed);

      return fixed;
    });
  }
}

// 개발용 검증 실행 함수
export async function validateScenariosInConsole() {
  if (typeof window !== 'undefined') {
    try {
      // fetch API를 사용해 JSON 데이터 로드
      const response = await fetch('/src/data/scenarios.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const { scenarios } = data;

      if (!scenarios || !Array.isArray(scenarios)) {
        throw new Error('시나리오 데이터가 올바르지 않습니다');
      }

      const validator = new ScenarioValidator();
      const results = validator.validateAllScenarios(scenarios);
      validator.printValidationResults(results);

      console.log('\n💡 추가 검증 정보:');
      console.log(`- 검증된 시나리오: ${scenarios.length}개`);
      console.log(
        `- 성공률: ${((results.passedScenarios / results.totalScenarios) * 100).toFixed(1)}%`,
      );

      return results;
    } catch (error) {
      console.error('시나리오 데이터를 불러올 수 없습니다:', error);
      console.error('fetch 경로:', '/src/data/scenarios.json');
      return null;
    }
  } else {
    console.error('브라우저 환경이 아닙니다.');
    return null;
  }
}

// 기본 검증기 인스턴스
export const defaultValidator = new DataValidator();
export const scenarioValidator = new ScenarioValidator();

// CommonJS 호환성
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ValidationError,
    ValidationWarning,
    ValidationResult,
    InputValidator,
    CalculationValidator,
    DataValidator,
    VALIDATION_CONFIG,
    ERROR_CODES,
    defaultValidator,
  };
}
