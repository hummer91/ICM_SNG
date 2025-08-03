/**
 * @fileoverview JSDoc 템플릿 및 예시
 * @module jsdoc-template
 * @author ICM SNG Poker Team
 * @since 1.0.0
 */

/**
 * @namespace Templates
 * @description JSDoc 문서화를 위한 템플릿 모음
 */
const Templates = {};

/**
 * 클래스 문서화 템플릿
 *
 * @class
 * @classdesc 클래스에 대한 상세한 설명을 여기에 작성합니다.
 *
 * @param {Object} options - 설정 옵션
 * @param {string} options.name - 이름
 * @param {number} [options.value=0] - 값 (선택사항, 기본값: 0)
 *
 * @example
 * // 클래스 인스턴스 생성
 * const instance = new ClassName({
 *   name: 'example',
 *   value: 42
 * });
 *
 * @see {@link https://example.com|관련 문서}
 * @since 1.0.0
 */
Templates.ClassTemplate = class {
  constructor(options) {
    /**
     * 인스턴스 이름
     * @type {string}
     * @private
     */
    this._name = options.name;

    /**
     * 인스턴스 값
     * @type {number}
     * @public
     */
    this.value = options.value || 0;
  }

  /**
   * 메서드 설명
   *
   * @param {string} param1 - 첫 번째 매개변수
   * @param {number} [param2=10] - 두 번째 매개변수 (선택)
   * @returns {Object} 반환 객체
   * @returns {boolean} returns.success - 성공 여부
   * @returns {string} returns.message - 결과 메시지
   *
   * @throws {Error} 에러 발생 조건 설명
   *
   * @example
   * const result = instance.methodName('test', 20);
   * console.log(result); // { success: true, message: 'Success' }
   */
  methodName(param1, _param2 = 10) {
    if (!param1) {
      throw new Error('param1 is required');
    }

    return {
      success: true,
      message: 'Success',
    };
  }

  /**
   * 정적 메서드 예시
   *
   * @static
   * @param {Array<number>} numbers - 숫자 배열
   * @returns {number} 배열의 합
   *
   * @example
   * const sum = ClassName.sum([1, 2, 3, 4, 5]);
   * console.log(sum); // 15
   */
  static sum(numbers) {
    return numbers.reduce((acc, num) => acc + num, 0);
  }

  /**
   * getter 예시
   *
   * @readonly
   * @returns {string} 포맷된 이름
   */
  get formattedName() {
    return `Name: ${this._name}`;
  }

  /**
   * setter 예시
   *
   * @param {string} newName - 새로운 이름
   * @throws {TypeError} 이름이 문자열이 아닌 경우
   */
  set name(newName) {
    if (typeof newName !== 'string') {
      throw new TypeError('Name must be a string');
    }
    this._name = newName;
  }
};

/**
 * 함수 문서화 템플릿
 *
 * @function functionTemplate
 * @description 함수의 목적과 동작에 대한 설명
 *
 * @param {string} param1 - 매개변수 설명
 * @param {Object} options - 옵션 객체
 * @param {boolean} [options.flag=false] - 플래그 옵션
 * @param {number} [options.limit=100] - 제한 값
 *
 * @returns {Promise<Object>} 프로미스 반환
 * @returns {boolean} returns.success - 작업 성공 여부
 * @returns {*} returns.data - 반환 데이터
 *
 * @async
 * @since 1.0.0
 *
 * @example
 * // 기본 사용법
 * const result = await functionTemplate('test', { flag: true });
 *
 * @example
 * // 에러 처리 포함
 * try {
 *   const result = await functionTemplate('test', { limit: 50 });
 *   console.log(result.data);
 * } catch (error) {
 *   console.error('Error:', error);
 * }
 */
Templates.functionTemplate = async function (param1, options = {}) {
  const { flag = false, limit = 100 } = options;

  // 구현 로직
  await Promise.resolve(); // async 함수 요구사항 충족
  return {
    success: true,
    data: { param1, flag, limit },
  };
};

/**
 * 타입 정의 템플릿
 *
 * @typedef {Object} PlayerData
 * @property {string} name - 플레이어 이름
 * @property {number} chips - 칩 수
 * @property {string} position - 포지션 (BTN, SB, BB, UTG, MP, CO)
 * @property {boolean} isActive - 활성 상태
 * @property {Array<Card>} cards - 보유 카드
 */

/**
 * 복잡한 타입 정의
 *
 * @typedef {Object} GameState
 * @property {Array<PlayerData>} players - 플레이어 목록
 * @property {number} pot - 현재 팟
 * @property {Object} blinds - 블라인드 정보
 * @property {number} blinds.small - 스몰 블라인드
 * @property {number} blinds.big - 빅 블라인드
 * @property {('preflop'|'flop'|'turn'|'river')} stage - 게임 단계
 */

/**
 * 콜백 타입 정의
 *
 * @callback EventCallback
 * @param {Event} event - 이벤트 객체
 * @param {*} data - 추가 데이터
 * @returns {void}
 */

/**
 * 열거형 문서화
 *
 * @enum {string}
 * @readonly
 */
Templates.ActionTypes = {
  /** 폴드 액션 */
  FOLD: 'fold',
  /** 콜 액션 */
  CALL: 'call',
  /** 레이즈 액션 */
  RAISE: 'raise',
  /** 올인 액션 */
  ALLIN: 'all-in',
};

/**
 * 네임스페이스 문서화
 *
 * @namespace Utils
 * @description 유틸리티 함수 모음
 */
Templates.Utils = {
  /**
   * 숫자 포맷팅
   *
   * @memberof Utils
   * @param {number} num - 포맷할 숫자
   * @param {number} [decimals=2] - 소수점 자리수
   * @returns {string} 포맷된 문자열
   */
  formatNumber(num, decimals = 2) {
    return num.toFixed(decimals);
  },
};

/**
 * 이벤트 문서화
 *
 * @event Templates.ClassTemplate#stateChanged
 * @type {Object}
 * @property {string} oldState - 이전 상태
 * @property {string} newState - 새로운 상태
 * @property {Date} timestamp - 변경 시간
 */

/**
 * 모듈 익스포트
 *
 * @exports Templates
 */
export default Templates;

/**
 * 개별 익스포트
 *
 * @exports
 */
export { Templates };
