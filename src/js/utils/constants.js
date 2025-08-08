/**
 * 게임 상수 정의
 * @module utils/constants
 */

/**
 * 토너먼트 상금 분배 구조
 * @constant {number[]}
 */
export const PRIZE_STRUCTURE = [0.65, 0.35]; // 1st: 65%, 2nd: 35%

/**
 * 포지션 정의
 * @constant {Object}
 */
export const POSITIONS = {
  BTN: 'BTN', // Button
  SB: 'SB', // Small Blind
  BB: 'BB', // Big Blind
  UTG: 'UTG', // Under the Gun
  MP: 'MP', // Middle Position
  CO: 'CO', // Cutoff
};

/**
 * 포지션 순서 (시계 방향)
 * @constant {string[]}
 */
export const POSITION_ORDER = ['BTN', 'SB', 'BB', 'UTG', 'MP', 'CO'];

/**
 * 액션 타입
 * @constant {Object}
 */
export const ACTIONS = {
  FOLD: 'fold',
  CHECK: 'check',
  CALL: 'call',
  RAISE: 'raise',
  ALL_IN: 'all-in',
};

/**
 * 게임 상태
 * @constant {Object}
 */
export const GAME_STATES = {
  WAITING: 'waiting',
  PREFLOP: 'preflop',
  FLOP: 'flop',
  TURN: 'turn',
  RIVER: 'river',
  SHOWDOWN: 'showdown',
  FINISHED: 'finished',
};

/**
 * 기본 게임 설정
 * @constant {Object}
 */
export const DEFAULT_SETTINGS = {
  STARTING_CHIPS: 300,
  STARTING_BLINDS: { small: 10, big: 20 },
  BLIND_LEVELS: [
    { small: 10, big: 20, ante: 0, duration: 10 },
    { small: 15, big: 30, ante: 0, duration: 10 },
    { small: 20, big: 40, ante: 0, duration: 10 },
    { small: 30, big: 60, ante: 0, duration: 10 },
    { small: 40, big: 80, ante: 0, duration: 10 },
    { small: 50, big: 100, ante: 0, duration: 10 },
    { small: 60, big: 120, ante: 0, duration: 10 },
    { small: 75, big: 150, ante: 0, duration: 10 },
    { small: 90, big: 180, ante: 0, duration: 10 },
    { small: 100, big: 200, ante: 0, duration: 10 },
    { small: 125, big: 250, ante: 0, duration: 10 },
    { small: 150, big: 300, ante: 0, duration: 10 },
  ],
};

/**
 * 칩 색상 매핑
 * @constant {Object}
 */
export const CHIP_COLORS = {
  1: '#ffffff', // White
  5: '#ff0000', // Red
  25: '#00ff00', // Green
  100: '#000000', // Black
  500: '#800080', // Purple
  1000: '#ffa500', // Orange
  5000: '#808080', // Gray
};

/**
 * 카드 순위
 * @constant {Object}
 */
export const CARD_RANKS = {
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

/**
 * 카드 수트
 * @constant {Object}
 */
export const CARD_SUITS = {
  s: 'spades',
  h: 'hearts',
  d: 'diamonds',
  c: 'clubs',
};

/**
 * 핸드 랭킹
 * @constant {Object}
 */
export const HAND_RANKINGS = {
  HIGH_CARD: 1,
  PAIR: 2,
  TWO_PAIR: 3,
  THREE_OF_A_KIND: 4,
  STRAIGHT: 5,
  FLUSH: 6,
  FULL_HOUSE: 7,
  FOUR_OF_A_KIND: 8,
  STRAIGHT_FLUSH: 9,
  ROYAL_FLUSH: 10,
};

/**
 * 애니메이션 지속 시간 (ms)
 * @constant {Object}
 */
export const ANIMATION_DURATIONS = {
  CARD_DEAL: 300,
  CHIP_MOVE: 400,
  FOLD: 200,
  POT_COLLECTION: 500,
  BUTTON_MOVE: 300,
};

/**
 * UI 상수
 * @constant {Object}
 */
export const UI_CONSTANTS = {
  TABLE_RADIUS: 200,
  PLAYER_CARD_WIDTH: 180,
  PLAYER_CARD_HEIGHT: 110,
  CARD_WIDTH: 50,
  CARD_HEIGHT: 70,
  CHIP_SIZE: 30,
  MAX_CHIP_STACKS: 5,
};

/**
 * 에러 메시지
 * @constant {Object}
 */
export const ERROR_MESSAGES = {
  INVALID_ACTION: '유효하지 않은 액션입니다.',
  INSUFFICIENT_CHIPS: '칩이 부족합니다.',
  NOT_YOUR_TURN: '당신의 차례가 아닙니다.',
  INVALID_BET_SIZE: '유효하지 않은 베팅 크기입니다.',
  GAME_NOT_STARTED: '게임이 시작되지 않았습니다.',
  PLAYER_NOT_FOUND: '플레이어를 찾을 수 없습니다.',
};

export default {
  PRIZE_STRUCTURE,
  POSITIONS,
  POSITION_ORDER,
  ACTIONS,
  GAME_STATES,
  DEFAULT_SETTINGS,
  CHIP_COLORS,
  CARD_RANKS,
  CARD_SUITS,
  HAND_RANKINGS,
  ANIMATION_DURATIONS,
  UI_CONSTANTS,
  ERROR_MESSAGES,
};
