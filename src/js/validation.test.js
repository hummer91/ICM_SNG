/**
 * 데이터 검증 계층 테스트
 * 모든 검증 클래스와 기능에 대한 포괄적인 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ValidationError,
  ValidationWarning,
  ValidationResult,
  InputValidator,
  CalculationValidator,
  DataValidator,
  VALIDATION_CONFIG,
  ERROR_CODES,
  defaultValidator,
} from './validation.js';
import { POSITIONS, ACTIONS } from './pushfold.js';
import { PLAYER_STATUS, GAME_PHASE } from './gamestate.js';

describe('ValidationError 클래스', () => {
  it('ValidationError 객체가 올바르게 생성되어야 함', () => {
    const error = new ValidationError(
      'Test error message',
      ERROR_CODES.STACK_TOO_SMALL,
      'stackSize',
      'Test suggestion',
    );

    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('Test error message');
    expect(error.code).toBe(ERROR_CODES.STACK_TOO_SMALL);
    expect(error.field).toBe('stackSize');
    expect(error.suggestion).toBe('Test suggestion');
    expect(error.timestamp).toBeInstanceOf(Date);
  });

  it('JSON 직렬화가 올바르게 작동해야 함', () => {
    const error = new ValidationError('Test error', ERROR_CODES.STACK_TOO_SMALL, 'test');
    const json = error.toJSON();

    expect(json).toHaveProperty('name');
    expect(json).toHaveProperty('message');
    expect(json).toHaveProperty('code');
    expect(json).toHaveProperty('field');
    expect(json).toHaveProperty('timestamp');
  });
});

describe('ValidationResult 클래스', () => {
  let result;

  beforeEach(() => {
    result = new ValidationResult(true, { test: 'data' });
  });

  it('ValidationResult 객체가 올바르게 초기화되어야 함', () => {
    expect(result.isValid).toBe(true);
    expect(result.data).toEqual({ test: 'data' });
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('에러 추가가 올바르게 작동해야 함', () => {
    result.addError('Test error', ERROR_CODES.STACK_TOO_SMALL, 'test');

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toBeInstanceOf(ValidationError);
    expect(result.hasErrors()).toBe(true);
  });

  it('경고 추가가 올바르게 작동해야 함', () => {
    result.addWarning('Test warning', ERROR_CODES.STACK_TOO_SMALL, 'test');

    expect(result.isValid).toBe(true); // 경고는 유효성에 영향 없음
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toBeInstanceOf(ValidationWarning);
    expect(result.hasWarnings()).toBe(true);
  });

  it('수정된 데이터 설정이 올바르게 작동해야 함', () => {
    const correctedData = { corrected: 'data' };
    result.setCorrectedData(correctedData);

    expect(result.correctedData).toEqual(correctedData);
  });

  it('첫 번째 에러 반환이 올바르게 작동해야 함', () => {
    result.addError('First error', ERROR_CODES.STACK_TOO_SMALL, 'test1');
    result.addError('Second error', ERROR_CODES.STACK_TOO_LARGE, 'test2');

    const firstError = result.getFirstError();
    expect(firstError.message).toBe('First error');
  });
});

describe('InputValidator 클래스', () => {
  let validator;

  beforeEach(() => {
    validator = new InputValidator();
  });

  describe('스택 사이즈 검증', () => {
    it('유효한 스택 사이즈를 통과시켜야 함', () => {
      const result = validator.validateStackSize(10);

      expect(result.isValid).toBe(true);
      expect(result.hasErrors()).toBe(false);
    });

    it('너무 작은 스택에 대해 에러를 반환해야 함', () => {
      const result = validator.validateStackSize(0.3, 'stack', false);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe(ERROR_CODES.STACK_TOO_SMALL);
    });

    it('너무 큰 스택에 대해 에러를 반환해야 함', () => {
      const result = validator.validateStackSize(150, 'stack', false);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe(ERROR_CODES.STACK_TOO_LARGE);
    });

    it('음수 스택을 자동 수정해야 함', () => {
      const result = validator.validateStackSize(-10, 'stack', true);

      expect(result.isValid).toBe(true);
      expect(result.correctedData).toBe(0);
      expect(result.hasWarnings()).toBe(true);
    });

    it('잘못된 타입에 대해 에러를 반환해야 함', () => {
      const result = validator.validateStackSize('invalid');

      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe(ERROR_CODES.STACK_INVALID_TYPE);
    });

    it('경고 범위에서 경고를 발생시켜야 함', () => {
      const result = validator.validateStackSize(0.8); // warningMin보다 작음

      expect(result.isValid).toBe(true);
      expect(result.hasWarnings()).toBe(true);
    });
  });

  describe('포지션 검증', () => {
    it('유효한 포지션을 통과시켜야 함', () => {
      Object.values(POSITIONS).forEach((position) => {
        const result = validator.validatePosition(position);
        expect(result.isValid).toBe(true);
      });
    });

    it('유효하지 않은 포지션에 대해 에러를 반환해야 함', () => {
      const result = validator.validatePosition('INVALID_POSITION');

      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe(ERROR_CODES.POSITION_INVALID);
    });

    it('빈 포지션에 대해 에러를 반환해야 함', () => {
      const result = validator.validatePosition(null);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe(ERROR_CODES.POSITION_MISSING);
    });
  });

  describe('액션 시퀀스 검증', () => {
    const mockPlayer = {
      stack: 1000,
      betAmount: 0,
      status: PLAYER_STATUS.ACTIVE,
      hasActed: false,
      canAct: () => true,
    };

    const mockContext = {
      player: mockPlayer,
      currentBet: 50,
      minRaise: 50,
      gamePhase: GAME_PHASE.PLAYING,
    };

    it('유효한 폴드 액션을 통과시켜야 함', () => {
      const result = validator.validateActionSequence(ACTIONS.FOLD, 0, mockContext);

      expect(result.isValid).toBe(true);
    });

    it('유효한 콜 액션을 통과시켜야 함', () => {
      const result = validator.validateActionSequence(ACTIONS.CALL, 50, mockContext);

      expect(result.isValid).toBe(true);
    });

    it('유효하지 않은 액션에 대해 에러를 반환해야 함', () => {
      const result = validator.validateActionSequence('INVALID_ACTION', 0, mockContext);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe(ERROR_CODES.ACTION_INVALID);
    });

    it('잘못된 게임 단계에서 에러를 반환해야 함', () => {
      const invalidContext = { ...mockContext, gamePhase: GAME_PHASE.PRE_GAME };
      const result = validator.validateActionSequence(ACTIONS.FOLD, 0, invalidContext);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe(ERROR_CODES.ACTION_SEQUENCE_INVALID);
    });

    it('액션할 수 없는 플레이어에 대해 에러를 반환해야 함', () => {
      const inactivePlayer = { ...mockPlayer, canAct: () => false };
      const invalidContext = { ...mockContext, player: inactivePlayer };
      const result = validator.validateActionSequence(ACTIONS.FOLD, 0, invalidContext);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe(ERROR_CODES.ACTION_OUT_OF_TURN);
    });

    it('잘못된 콜 금액에 대해 에러를 반환해야 함', () => {
      const result = validator.validateActionSequence(ACTIONS.CALL, 100, mockContext); // 50이 올바름

      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe(ERROR_CODES.ACTION_AMOUNT_INVALID);
    });

    it('부족한 레이즈 금액에 대해 에러를 반환해야 함', () => {
      const result = validator.validateActionSequence(ACTIONS.RAISE, 80, mockContext); // 최소 100 필요

      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe(ERROR_CODES.ACTION_AMOUNT_INVALID);
    });

    it('올인 올인 금액 검증이 올바르게 작동해야 함', () => {
      const result = validator.validateActionSequence(ACTIONS.PUSH, 1000, mockContext);

      expect(result.isValid).toBe(true);
    });

    it('잘못된 올인 금액에 대해 에러를 반환해야 함', () => {
      const result = validator.validateActionSequence(ACTIONS.PUSH, 500, mockContext);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe(ERROR_CODES.ACTION_AMOUNT_INVALID);
    });
  });

  describe('블라인드 레벨 검증', () => {
    it('유효한 블라인드 레벨을 통과시켜야 함', () => {
      const blindLevel = {
        level: 1,
        small: 25,
        big: 50,
        ante: 0,
        duration: 10,
      };

      const result = validator.validateBlindLevel(blindLevel);

      expect(result.isValid).toBe(true);
    });

    it('유효하지 않은 블라인드 레벨에 대해 에러를 반환해야 함', () => {
      const invalidLevel = {
        level: 0, // 최소 1 이상
        small: 25,
        big: 50,
      };

      const result = validator.validateBlindLevel(invalidLevel);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe(ERROR_CODES.BLIND_LEVEL_INVALID);
    });

    it('빅 블라인드가 스몰 블라인드보다 작은 경우 에러를 반환해야 함', () => {
      const invalidStructure = {
        level: 1,
        small: 50,
        big: 25, // small보다 작음
      };

      const result = validator.validateBlindLevel(invalidStructure);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe(ERROR_CODES.BLIND_STRUCTURE_INVALID);
    });

    it('음수 안테에 대해 에러를 반환해야 함', () => {
      const invalidAnte = {
        level: 1,
        small: 25,
        big: 50,
        ante: -10,
      };

      const result = validator.validateBlindLevel(invalidAnte);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe(ERROR_CODES.BLIND_STRUCTURE_INVALID);
    });
  });

  describe('플레이어 배열 검증', () => {
    it('유효한 플레이어 배열을 통과시켜야 함', () => {
      const players = [
        { stack: 1500, position: POSITIONS.BTN },
        { stack: 1500, position: POSITIONS.SB },
        { stack: 1500, position: POSITIONS.BB },
      ];

      const result = validator.validatePlayers(players);

      expect(result.isValid).toBe(true);
    });

    it('플레이어가 부족한 경우 에러를 반환해야 함', () => {
      const players = [{ stack: 1500 }]; // 1명만

      const result = validator.validatePlayers(players);

      expect(result.isValid).toBe(false);
    });

    it('너무 많은 플레이어에 대해 에러를 반환해야 함', () => {
      const players = Array(7).fill({ stack: 1500 }); // 7명

      const result = validator.validatePlayers(players);

      expect(result.isValid).toBe(false);
    });

    it('중복된 포지션에 대해 에러를 반환해야 함', () => {
      const players = [
        { stack: 1500, position: POSITIONS.BTN },
        { stack: 1500, position: POSITIONS.BTN }, // 중복
      ];

      const result = validator.validatePlayers(players);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === ERROR_CODES.POSITION_DUPLICATE)).toBe(true);
    });
  });
});

describe('CalculationValidator 클래스', () => {
  let validator;

  beforeEach(() => {
    validator = new CalculationValidator();
  });

  describe('ICM 확률 검증', () => {
    it('유효한 ICM 확률을 통과시켜야 함', () => {
      const probabilities = [
        [0.5, 0.3, 0.2], // 플레이어 0: 1위 50%, 2위 30%, 3위 20%
        [0.3, 0.4, 0.3], // 플레이어 1
        [0.2, 0.3, 0.5], // 플레이어 2
      ];

      const result = validator.validateICMProbabilities(probabilities);

      expect(result.isValid).toBe(true);
    });

    it('확률 합계가 1이 아닌 경우 에러를 반환해야 함', () => {
      const probabilities = [
        [0.6, 0.3, 0.2], // 합계 1.1
        [0.3, 0.4, 0.3],
        [0.2, 0.3, 0.5],
      ];

      const result = validator.validateICMProbabilities(probabilities);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe(ERROR_CODES.ICM_PROBABILITY_SUM_INVALID);
    });

    it('음수 확률에 대해 에러를 반환해야 함', () => {
      const probabilities = [
        [0.6, 0.3, 0.1],
        [0.3, 0.4, 0.3],
        [-0.1, 0.6, 0.5], // 음수 확률
      ];

      const result = validator.validateICMProbabilities(probabilities);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === ERROR_CODES.ICM_NEGATIVE_PROBABILITY)).toBe(true);
    });

    it('순위별 확률 합계가 1이 아닌 경우 에러를 반환해야 함', () => {
      const probabilities = [
        [0.6, 0.2, 0.2], // 1위 확률 합계: 0.6 + 0.2 + 0.1 = 0.9
        [0.2, 0.4, 0.4],
        [0.1, 0.4, 0.5],
      ];

      const result = validator.validateICMProbabilities(probabilities);

      expect(result.isValid).toBe(false);
    });
  });

  describe('ICM equity 검증', () => {
    it('유효한 ICM equity를 통과시켜야 함', () => {
      const equities = [0.4, 0.35, 0.25]; // 합계 1.0

      const result = validator.validateICMEquities(equities);

      expect(result.isValid).toBe(true);
    });

    it('equity 합계가 1이 아닌 경우 에러를 반환해야 함', () => {
      const equities = [0.5, 0.35, 0.25]; // 합계 1.1

      const result = validator.validateICMEquities(equities);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe(ERROR_CODES.ICM_EQUITY_SUM_INVALID);
    });

    it('범위를 벗어난 equity에 대해 에러를 반환해야 함', () => {
      const equities = [1.2, -0.1, 0.9]; // 1.2 > 1, -0.1 < 0

      const result = validator.validateICMEquities(equities);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('EV 범위 검증', () => {
    it('유효한 EV를 통과시켜야 함', () => {
      const result = validator.validateEVRange(0.15);

      expect(result.isValid).toBe(true);
    });

    it('범위를 벗어난 EV에 대해 에러를 반환해야 함', () => {
      const result = validator.validateEVRange(1.5); // > 1.0

      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe(ERROR_CODES.EV_OUT_OF_RANGE);
    });

    it('극단적인 EV에 대해 경고를 발생시켜야 함', () => {
      const result = validator.validateEVRange(0.8); // > warningThreshold

      expect(result.isValid).toBe(true);
      expect(result.hasWarnings()).toBe(true);
    });

    it('유효하지 않은 타입에 대해 에러를 반환해야 함', () => {
      const result = validator.validateEVRange('invalid');

      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe(ERROR_CODES.EV_CALCULATION_ERROR);
    });
  });

  describe('Push/Fold 범위 검증', () => {
    it('유효한 Push/Fold 범위를 통과시켜야 함', () => {
      const range = ['AA', 'KK', 'QQ', 'AKs', 'AKo'];
      const percentage = 3.0; // 5개 핸드 ≈ 3%

      const result = validator.validatePushFoldRange(range, percentage);

      expect(result.isValid).toBe(true);
    });

    it('잘못된 퍼센트에 대해 에러를 반환해야 함', () => {
      const range = ['AA'];
      const percentage = 150; // > 100%

      const result = validator.validatePushFoldRange(range, percentage);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe(ERROR_CODES.RANGE_PERCENTAGE_INVALID);
    });

    it('중복된 핸드에 대해 에러를 반환해야 함', () => {
      const range = ['AA', 'AA', 'KK']; // AA 중복
      const percentage = 2;

      const result = validator.validatePushFoldRange(range, percentage);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe(ERROR_CODES.RANGE_HANDS_INVALID);
    });

    it('유효하지 않은 핸드 표기에 대해 에러를 반환해야 함', () => {
      const range = ['AA', 'INVALID', 'KK'];
      const percentage = 2;

      const result = validator.validatePushFoldRange(range, percentage);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe(ERROR_CODES.RANGE_HANDS_INVALID);
    });

    it('핸드 수와 퍼센트 불일치 시 경고를 발생시켜야 함', () => {
      const range = ['AA']; // 1개 핸드
      const percentage = 10; // 10% = 약 17개 핸드

      const result = validator.validatePushFoldRange(range, percentage);

      expect(result.hasWarnings()).toBe(true);
      expect(result.warnings[0].code).toBe(ERROR_CODES.RANGE_CONSISTENCY_ERROR);
    });
  });
});

describe('DataValidator 클래스', () => {
  let validator;

  beforeEach(() => {
    validator = new DataValidator();
  });

  describe('게임 설정 전체 검증', () => {
    it('유효한 게임 설정을 통과시켜야 함', () => {
      const gameConfig = {
        players: [
          { stack: 1500, position: POSITIONS.BTN },
          { stack: 1500, position: POSITIONS.SB },
        ],
        startingStack: 1500,
        blindStructure: [{ level: 1, small: 25, big: 50, ante: 0 }],
      };

      const result = validator.validateGameConfig(gameConfig);

      expect(result.isValid).toBe(true);
    });

    it('잘못된 설정에 대해 종합적인 에러를 반환해야 함', () => {
      const gameConfig = {
        players: [{ stack: -100 }], // 음수 스택, 플레이어 부족
        startingStack: 200, // 너무 큰 스택
        blindStructure: [
          { level: 0, small: 50, big: 25 }, // 잘못된 레벨, 빅 < 스몰
        ],
      };

      const result = validator.validateGameConfig(gameConfig, false);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('자동 수정이 올바르게 작동해야 함', () => {
      const gameConfig = {
        startingStack: -100, // 음수 스택
      };

      const result = validator.validateGameConfig(gameConfig, true);

      expect(result.correctedData.startingStack).toBe(0);
    });
  });

  describe('ICM 결과 전체 검증', () => {
    it('유효한 ICM 결과를 통과시켜야 함', () => {
      const icmResult = {
        probabilities: [
          [0.4, 0.3, 0.3],
          [0.35, 0.35, 0.3],
          [0.25, 0.35, 0.4],
        ],
        equities: [0.38, 0.345, 0.275],
      };

      const result = validator.validateICMResult(icmResult);

      expect(result.isValid).toBe(true);
    });

    it('잘못된 ICM 결과에 대해 에러를 반환해야 함', () => {
      const icmResult = {
        probabilities: [
          [0.5, 0.3, 0.3], // 합계 1.1
          [0.3, 0.4, 0.3],
          [0.2, 0.3, 0.5],
        ],
        equities: [0.4, 0.35, 0.3], // 합계 1.05
      };

      const result = validator.validateICMResult(icmResult);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('자동 수정 적용', () => {
    it('수정된 데이터를 올바르게 적용해야 함', () => {
      const originalData = -10;
      const validationResult = new ValidationResult();
      validationResult.setCorrectedData(0);

      const correctedData = validator.applyAutoCorrection(originalData, validationResult);

      expect(correctedData).toBe(0);
    });

    it('수정이 없는 경우 원본 데이터를 반환해야 함', () => {
      const originalData = 10;
      const validationResult = new ValidationResult();

      const result = validator.applyAutoCorrection(originalData, validationResult);

      expect(result).toBe(originalData);
    });
  });

  describe('검증 결과 요약', () => {
    it('검증 요약을 올바르게 생성해야 함', () => {
      const validationResult = new ValidationResult();
      validationResult.addError('Test error', ERROR_CODES.STACK_TOO_SMALL, 'test');
      validationResult.addWarning('Test warning', ERROR_CODES.STACK_TOO_LARGE, 'test');
      validationResult.addSuggestion('Test suggestion');

      const summary = validator.summarizeValidation(validationResult);

      expect(summary.isValid).toBe(false);
      expect(summary.errorCount).toBe(1);
      expect(summary.warningCount).toBe(1);
      expect(summary.summary.errors).toHaveLength(1);
      expect(summary.summary.warnings).toHaveLength(1);
      expect(summary.summary.suggestions).toHaveLength(1);
    });
  });
});

describe('기본 검증기', () => {
  it('defaultValidator가 올바르게 인스턴스화되어야 함', () => {
    expect(defaultValidator).toBeInstanceOf(DataValidator);
    expect(defaultValidator.inputValidator).toBeInstanceOf(InputValidator);
    expect(defaultValidator.calculationValidator).toBeInstanceOf(CalculationValidator);
  });
});

describe('검증 설정', () => {
  it('VALIDATION_CONFIG가 올바른 구조를 가져야 함', () => {
    expect(VALIDATION_CONFIG).toHaveProperty('stackSize');
    expect(VALIDATION_CONFIG).toHaveProperty('blindLevel');
    expect(VALIDATION_CONFIG).toHaveProperty('icmTolerance');
    expect(VALIDATION_CONFIG).toHaveProperty('evRange');
    expect(VALIDATION_CONFIG).toHaveProperty('handRange');

    expect(VALIDATION_CONFIG.stackSize.min).toBe(0.5);
    expect(VALIDATION_CONFIG.stackSize.max).toBe(100);
  });
});

describe('에러 코드', () => {
  it('모든 필요한 에러 코드가 정의되어야 함', () => {
    expect(ERROR_CODES).toHaveProperty('STACK_TOO_SMALL');
    expect(ERROR_CODES).toHaveProperty('STACK_TOO_LARGE');
    expect(ERROR_CODES).toHaveProperty('POSITION_INVALID');
    expect(ERROR_CODES).toHaveProperty('ACTION_INVALID');
    expect(ERROR_CODES).toHaveProperty('ICM_PROBABILITY_SUM_INVALID');
    expect(ERROR_CODES).toHaveProperty('EV_OUT_OF_RANGE');
    expect(ERROR_CODES).toHaveProperty('RANGE_PERCENTAGE_INVALID');
  });
});

describe('실제 사용 시나리오', () => {
  let validator;

  beforeEach(() => {
    validator = new DataValidator();
  });

  it('실제 게임 시나리오에서 검증이 올바르게 작동해야 함', () => {
    // 실제 6인 SNG 설정
    const gameConfig = {
      players: [
        { stack: 1500, position: POSITIONS.BTN },
        { stack: 1500, position: POSITIONS.SB },
        { stack: 1500, position: POSITIONS.BB },
        { stack: 1500, position: POSITIONS.UTG },
        { stack: 1500, position: POSITIONS.MP },
        { stack: 1500, position: POSITIONS.CO },
      ],
      startingStack: 1500,
      blindStructure: [
        { level: 1, small: 25, big: 50, ante: 0 },
        { level: 2, small: 50, big: 100, ante: 0 },
        { level: 3, small: 75, big: 150, ante: 25 },
      ],
    };

    const result = validator.validateGameConfig(gameConfig);

    expect(result.isValid).toBe(true);
    expect(result.hasErrors()).toBe(false);
  });

  it('실제 ICM 계산 결과 검증이 올바르게 작동해야 함', () => {
    // 실제 3인 ICM 계산 결과 시뮬레이션
    const icmResult = {
      probabilities: [
        [0.333, 0.333, 0.334], // 플레이어 0 (반올림으로 인한 소수점 차이)
        [0.333, 0.334, 0.333], // 플레이어 1
        [0.334, 0.333, 0.333], // 플레이어 2
      ],
      equities: [0.333, 0.333, 0.334], // 동일한 스택, 거의 동일한 equity
    };

    const result = validator.validateICMResult(icmResult);

    expect(result.isValid).toBe(true);
  });

  it('잘못된 액션 시퀀스를 올바르게 감지해야 함', () => {
    const mockPlayer = {
      stack: 800,
      betAmount: 50,
      status: PLAYER_STATUS.ACTIVE,
      hasActed: false,
      canAct: () => true,
    };

    const context = {
      player: mockPlayer,
      currentBet: 100,
      minRaise: 50,
      gamePhase: GAME_PHASE.PLAYING,
    };

    // 콜해야 하는데 레이즈하려고 함
    const result = validator.inputValidator.validateActionSequence(
      ACTIONS.RAISE,
      120, // 최소 150 필요 (currentBet 100 + minRaise 50)
      context,
    );

    expect(result.isValid).toBe(false);
    expect(result.errors[0].code).toBe(ERROR_CODES.ACTION_AMOUNT_INVALID);
  });
});
