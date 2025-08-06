/**
 * 게임 상태 관리 시스템
 *
 * 6인 SNG 토너먼트의 완전한 게임 상태를 관리하는 모듈
 * 플레이어 데이터, 블라인드 구조, 액션 히스토리, 포지션 관리 등을 포함
 *
 * @author ICM SNG Poker App
 * @version 1.0.0
 */

import { POSITIONS, ACTIONS } from './pushfold.js';
import { ICMCalculator } from './icm.js';

/**
 * 플레이어 상태 정의
 */
export const PLAYER_STATUS = {
  ACTIVE: 'ACTIVE', // 활성 플레이어
  FOLDED: 'FOLDED', // 현재 핸드에서 폴드
  ALL_IN: 'ALL_IN', // 올인 상태
  SITTING_OUT: 'SITTING_OUT', // 자리 비움
  ELIMINATED: 'ELIMINATED', // 탈락
};

/**
 * 게임 단계 정의
 */
export const GAME_PHASE = {
  PRE_GAME: 'PRE_GAME', // 게임 시작 전
  PLAYING: 'PLAYING', // 진행 중
  HAND_COMPLETE: 'HAND_COMPLETE', // 핸드 완료
  TOURNAMENT_COMPLETE: 'TOURNAMENT_COMPLETE', // 토너먼트 완료
};

/**
 * 플레이어 데이터 모델
 */
export class Player {
  constructor(config = {}) {
    this.id = config.id || this.generateId();
    this.name = config.name || `Player ${this.id}`;
    this.stack = config.stack || 1500; // 시작 칩
    this.position = config.position || null;
    this.status = config.status || PLAYER_STATUS.ACTIVE;
    this.seat = config.seat || null; // 0-5 (6인 테이블)

    // 현재 핸드 정보
    this.currentAction = null;
    this.betAmount = 0;
    this.hasActed = false;
    this.cards = config.cards || null;

    // 통계 정보
    this.stats = {
      handsPlayed: 0,
      vpip: 0, // Voluntarily Put In Pot
      pfr: 0, // Pre-Flop Raise
      aggression: 0,
      showdowns: 0,
      wins: 0,
      totalWinnings: 0,
      biggestPot: 0,
      ...config.stats,
    };

    // UI 관련
    this.avatar = config.avatar || null;
    this.color = config.color || this.getRandomColor();
    this.isHuman = config.isHuman || true;
    this.isDealer = false;

    // 시간 관리
    this.timeBank = config.timeBank || 30; // 초
    this.actionStartTime = null;

    // 메타 정보
    this.createdAt = new Date();
    this.lastActionAt = null;
  }

  /**
   * 고유 ID 생성
   * @returns {string}
   */
  generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * 랜덤 색상 생성
   * @returns {string}
   */
  getRandomColor() {
    const colors = [
      '#5e6ad2',
      '#4cb782',
      '#f2c94c',
      '#eb5757',
      '#4ea7fc',
      '#9b59b6',
      '#e67e22',
      '#1abc9c',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * 플레이어 상태 업데이트
   * @param {string} status - 새로운 상태
   */
  setStatus(status) {
    if (!Object.values(PLAYER_STATUS).includes(status)) {
      throw new Error(`Invalid player status: ${status}`);
    }
    this.status = status;
    this.lastActionAt = new Date();
  }

  /**
   * 베팅/액션 수행
   * @param {string} action - 액션 타입
   * @param {number} amount - 베팅 금액 (해당하는 경우)
   */
  performAction(action, amount = 0) {
    if (!Object.values(ACTIONS).includes(action)) {
      throw new Error(`Invalid action: ${action}`);
    }

    this.currentAction = action;
    this.betAmount = amount;
    this.hasActed = true;
    this.lastActionAt = new Date();

    // 스택 조정
    if (action === ACTIONS.CALL || action === ACTIONS.RAISE || action === ACTIONS.PUSH) {
      this.stack -= amount;
      if (this.stack <= 0) {
        this.stack = 0;
        this.setStatus(PLAYER_STATUS.ALL_IN);
      }
    }

    // 폴드 처리
    if (action === ACTIONS.FOLD) {
      this.setStatus(PLAYER_STATUS.FOLDED);
    }

    // 통계 업데이트
    this.updateStats(action, amount);
  }

  /**
   * 통계 업데이트
   * @param {string} action - 수행한 액션
   * @param {number} amount - 베팅 금액
   */
  updateStats(action, amount) {
    this.stats.handsPlayed++;

    if (action !== ACTIONS.FOLD && amount > 0) {
      this.stats.vpip++;
    }

    if (action === ACTIONS.RAISE || action === ACTIONS.PUSH) {
      this.stats.pfr++;
      this.stats.aggression += 1;
    }
  }

  /**
   * 새 핸드 준비
   */
  resetForNewHand() {
    this.currentAction = null;
    this.betAmount = 0;
    this.hasActed = false;
    this.cards = null;
    this.actionStartTime = null;

    // 탈락하지 않은 플레이어만 활성화
    if (this.stack > 0 && this.status !== PLAYER_STATUS.ELIMINATED) {
      this.status = PLAYER_STATUS.ACTIVE;
    }
  }

  /**
   * 팟 수익 지급
   * @param {number} amount - 수익 금액
   */
  winPot(amount) {
    this.stack += amount;
    this.stats.wins++;
    this.stats.totalWinnings += amount;
    this.stats.showdowns++;

    if (amount > this.stats.biggestPot) {
      this.stats.biggestPot = amount;
    }
  }

  /**
   * 플레이어가 활성 상태인지 확인
   * @returns {boolean}
   */
  isActive() {
    return this.status === PLAYER_STATUS.ACTIVE && this.stack > 0;
  }

  /**
   * 플레이어가 액션 가능한지 확인
   * @returns {boolean}
   */
  canAct() {
    return this.isActive() && !this.hasActed;
  }

  /**
   * Big Blind 단위로 스택 크기 반환
   * @param {number} bigBlind - 빅 블라인드 크기
   * @returns {number}
   */
  getStackInBB(bigBlind) {
    return this.stack / bigBlind;
  }

  /**
   * 플레이어 정보 직렬화
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      stack: this.stack,
      position: this.position,
      status: this.status,
      seat: this.seat,
      currentAction: this.currentAction,
      betAmount: this.betAmount,
      hasActed: this.hasActed,
      stats: { ...this.stats },
      isDealer: this.isDealer,
      timeBank: this.timeBank,
      createdAt: this.createdAt,
      lastActionAt: this.lastActionAt,
    };
  }
}

/**
 * 액션 히스토리 항목
 */
export class ActionHistoryItem {
  constructor(playerId, action, amount = 0, metadata = {}) {
    this.id = this.generateId();
    this.playerId = playerId;
    this.action = action;
    this.amount = amount;
    this.timestamp = new Date();
    this.handNumber = metadata.handNumber || null;
    this.position = metadata.position || null;
    this.stackBefore = metadata.stackBefore || null;
    this.stackAfter = metadata.stackAfter || null;
    this.potSize = metadata.potSize || null;
    this.note = metadata.note || null;
  }

  generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  toJSON() {
    return {
      id: this.id,
      playerId: this.playerId,
      action: this.action,
      amount: this.amount,
      timestamp: this.timestamp,
      handNumber: this.handNumber,
      position: this.position,
      stackBefore: this.stackBefore,
      stackAfter: this.stackAfter,
      potSize: this.potSize,
      note: this.note,
    };
  }
}

/**
 * 게임 상태 관리자
 */
export class GameStateManager {
  constructor(config = {}) {
    // 기본 설정
    this.config = {
      maxPlayers: 6,
      startingStack: 1500,
      startingBlinds: { small: 25, big: 50 },
      blindLevels: this.getDefaultBlindStructure(),
      levelDuration: 10, // 분
      ...config,
    };

    // 게임 상태
    this.gameId = this.generateGameId();
    this.phase = GAME_PHASE.PRE_GAME;
    this.handNumber = 0;
    this.level = 1;
    this.levelStartTime = null;

    // 플레이어 관리
    this.players = new Map(); // seat -> Player
    this.playerOrder = []; // 액션 순서
    this.dealerSeat = 0;
    this.activePlayers = new Set();

    // 블라인드 및 베팅
    this.blinds = { ...this.config.startingBlinds };
    this.pot = 0;
    this.currentBet = 0;
    this.minRaise = 0;

    // 액션 관리
    this.actionHistory = [];
    this.currentPlayerSeat = null;
    this.actionTimeout = null;

    // ICM 계산기
    this.icmCalculator = new ICMCalculator();

    // 이벤트 리스너
    this.eventListeners = new Map();

    // 통계
    this.gameStats = {
      startTime: null,
      endTime: null,
      totalHands: 0,
      averageHandTime: 0,
      eliminationOrder: [],
      finalPayouts: new Map(),
    };
  }

  /**
   * 게임 ID 생성
   * @returns {string}
   */
  generateGameId() {
    return `game_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * 기본 블라인드 구조 반환
   * @returns {Array}
   */
  getDefaultBlindStructure() {
    return [
      { level: 1, small: 25, big: 50, ante: 0 },
      { level: 2, small: 50, big: 100, ante: 0 },
      { level: 3, small: 75, big: 150, ante: 25 },
      { level: 4, small: 100, big: 200, ante: 25 },
      { level: 5, small: 150, big: 300, ante: 50 },
      { level: 6, small: 200, big: 400, ante: 50 },
      { level: 7, small: 300, big: 600, ante: 75 },
      { level: 8, small: 400, big: 800, ante: 100 },
      { level: 9, small: 500, big: 1000, ante: 125 },
      { level: 10, small: 600, big: 1200, ante: 150 },
    ];
  }

  /**
   * 플레이어 추가
   * @param {Object} playerConfig - 플레이어 설정
   * @returns {Player}
   */
  addPlayer(playerConfig = {}) {
    if (this.players.size >= this.config.maxPlayers) {
      throw new Error('Maximum players reached');
    }

    // 빈 자리 찾기
    let seat = null;
    for (let i = 0; i < this.config.maxPlayers; i++) {
      if (!this.players.has(i)) {
        seat = i;
        break;
      }
    }

    if (seat === null) {
      throw new Error('No available seats');
    }

    const player = new Player({
      ...playerConfig,
      seat,
      stack: this.config.startingStack,
    });

    this.players.set(seat, player);
    this.activePlayers.add(seat);
    this.updatePlayerOrder();

    this.emit('playerAdded', { player, seat });
    return player;
  }

  /**
   * 플레이어 제거
   * @param {number} seat - 자리 번호
   */
  removePlayer(seat) {
    if (!this.players.has(seat)) {
      throw new Error(`No player at seat ${seat}`);
    }

    const player = this.players.get(seat);
    this.players.delete(seat);
    this.activePlayers.delete(seat);
    this.updatePlayerOrder();

    this.emit('playerRemoved', { player, seat });
  }

  /**
   * 게임 시작
   */
  startGame() {
    if (this.players.size < 2) {
      throw new Error('Need at least 2 players to start');
    }

    this.phase = GAME_PHASE.PLAYING;
    this.gameStats.startTime = new Date();
    this.levelStartTime = new Date();

    this.emit('gameStarted', {
      gameId: this.gameId,
      players: Array.from(this.players.values()),
      blinds: this.blinds,
    });

    this.startNewHand();
  }

  /**
   * 새 핸드 시작
   */
  startNewHand() {
    this.handNumber++;
    this.pot = 0;
    this.currentBet = 0;
    this.minRaise = this.blinds.big;

    // 블라인드 레벨 확인 및 업데이트
    this.checkBlindLevel();

    // 플레이어 상태 리셋
    this.players.forEach((player) => {
      player.resetForNewHand();
    });

    // 포지션 설정
    this.assignPositions();

    // 블라인드 징수
    this.collectBlinds();

    // 액션 순서 설정
    this.setActionOrder();

    this.phase = GAME_PHASE.PLAYING;
    this.emit('handStarted', {
      handNumber: this.handNumber,
      dealerSeat: this.dealerSeat,
      blinds: this.blinds,
      positions: this.getPositions(),
    });
  }

  /**
   * 블라인드 레벨 확인 및 업데이트
   */
  checkBlindLevel() {
    if (!this.levelStartTime) {
      return;
    }

    const elapsedMinutes = (Date.now() - this.levelStartTime.getTime()) / (1000 * 60);

    if (elapsedMinutes >= this.config.levelDuration) {
      this.level++;
      const newLevel = this.config.blindLevels.find((level) => level.level === this.level);

      if (newLevel) {
        this.blinds = {
          small: newLevel.small,
          big: newLevel.big,
          ante: newLevel.ante || 0,
        };
        this.levelStartTime = new Date();
        this.minRaise = this.blinds.big;

        this.emit('blindLevelUp', {
          level: this.level,
          blinds: this.blinds,
          nextLevelIn: this.config.levelDuration,
        });
      }
    }
  }

  /**
   * 포지션 할당
   */
  assignPositions() {
    const activeSeats = Array.from(this.activePlayers).sort((a, b) => a - b);
    const playerCount = activeSeats.length;

    if (playerCount < 2) {
      throw new Error('Need at least 2 active players');
    }

    // 딜러 버튼 위치 찾기
    const dealerIndex = activeSeats.indexOf(this.dealerSeat);

    // 포지션 매핑 (플레이어 수에 따라 동적 조정)
    const positionMap = this.getPositionMapping(playerCount);

    activeSeats.forEach((seat, index) => {
      const player = this.players.get(seat);
      const relativePosition = (index - dealerIndex + playerCount) % playerCount;
      player.position = positionMap[relativePosition];
      player.isDealer = seat === this.dealerSeat;
    });
  }

  /**
   * 플레이어 수에 따른 포지션 매핑 반환
   * @param {number} playerCount - 활성 플레이어 수
   * @returns {Array}
   */
  getPositionMapping(playerCount) {
    switch (playerCount) {
      case 2:
        return [POSITIONS.BTN, POSITIONS.BB]; // BTN은 SB 역할도 함
      case 3:
        return [POSITIONS.BTN, POSITIONS.SB, POSITIONS.BB];
      case 4:
        return [POSITIONS.BTN, POSITIONS.SB, POSITIONS.BB, POSITIONS.UTG];
      case 5:
        return [POSITIONS.BTN, POSITIONS.SB, POSITIONS.BB, POSITIONS.UTG, POSITIONS.MP];
      case 6:
        return [
          POSITIONS.BTN,
          POSITIONS.SB,
          POSITIONS.BB,
          POSITIONS.UTG,
          POSITIONS.MP,
          POSITIONS.CO,
        ];
      default:
        throw new Error(`Unsupported player count: ${playerCount}`);
    }
  }

  /**
   * 블라인드 징수
   */
  collectBlinds() {
    const activeSeats = Array.from(this.activePlayers).sort((a, b) => a - b);
    const playerCount = activeSeats.length;

    if (playerCount === 2) {
      // 헤즈업: BTN이 SB, 다른 플레이어가 BB
      const btnPlayer = this.players.get(this.dealerSeat);
      const bbPlayer = this.players.get(activeSeats.find((seat) => seat !== this.dealerSeat));

      this.forceBlind(btnPlayer, this.blinds.small, 'Small Blind');
      this.forceBlind(bbPlayer, this.blinds.big, 'Big Blind');
    } else {
      // 3인 이상: 정상적인 SB/BB 순서
      activeSeats.forEach((seat) => {
        const player = this.players.get(seat);
        if (player.position === POSITIONS.SB) {
          this.forceBlind(player, this.blinds.small, 'Small Blind');
        } else if (player.position === POSITIONS.BB) {
          this.forceBlind(player, this.blinds.big, 'Big Blind');
        }
      });
    }

    // 안테 징수 (있는 경우)
    if (this.blinds.ante && this.blinds.ante > 0) {
      activeSeats.forEach((seat) => {
        const player = this.players.get(seat);
        this.forceBlind(player, this.blinds.ante, 'Ante');
      });
    }
  }

  /**
   * 강제 블라인드/안테 징수
   * @param {Player} player - 플레이어
   * @param {number} amount - 금액
   * @param {string} type - 블라인드 타입
   */
  forceBlind(player, amount, type) {
    const actualAmount = Math.min(amount, player.stack);
    player.stack -= actualAmount;
    player.betAmount = actualAmount;
    this.pot += actualAmount;

    if (player.stack === 0) {
      player.setStatus(PLAYER_STATUS.ALL_IN);
    }

    this.addActionToHistory(player.id, type, actualAmount, {
      handNumber: this.handNumber,
      position: player.position,
      stackBefore: player.stack + actualAmount,
      stackAfter: player.stack,
      potSize: this.pot,
    });

    // 현재 베팅 크기 업데이트
    if (actualAmount > this.currentBet) {
      this.currentBet = actualAmount;
    }
  }

  /**
   * 액션 순서 설정
   */
  setActionOrder() {
    const activeSeats = Array.from(this.activePlayers).sort((a, b) => a - b);
    const playerCount = activeSeats.length;

    if (playerCount === 2) {
      // 헤즈업: BB부터 액션
      const bbSeat = activeSeats.find((seat) => this.players.get(seat).position === POSITIONS.BB);
      this.currentPlayerSeat = bbSeat;
    } else {
      // 3인 이상: UTG부터 액션
      const utgSeat = activeSeats.find((seat) => this.players.get(seat).position === POSITIONS.UTG);
      this.currentPlayerSeat = utgSeat || activeSeats[0];
    }

    this.playerOrder = this.getActionOrder();
  }

  /**
   * 액션 순서 반환
   * @returns {Array}
   */
  getActionOrder() {
    const activeSeats = Array.from(this.activePlayers).sort((a, b) => a - b);
    const startIndex = activeSeats.indexOf(this.currentPlayerSeat);

    // 현재 플레이어부터 시계방향으로 순서 생성
    const order = [];
    for (let i = 0; i < activeSeats.length; i++) {
      const seatIndex = (startIndex + i) % activeSeats.length;
      order.push(activeSeats[seatIndex]);
    }

    return order;
  }

  /**
   * 플레이어 액션 처리
   * @param {number} seat - 플레이어 자리
   * @param {string} action - 액션 타입
   * @param {number} amount - 베팅 금액
   */
  processPlayerAction(seat, action, amount = 0) {
    if (this.currentPlayerSeat !== seat) {
      throw new Error("Not this player's turn");
    }

    const player = this.players.get(seat);
    if (!player || !player.canAct()) {
      throw new Error('Player cannot act');
    }

    // 액션 유효성 검사
    this.validateAction(player, action, amount);

    const stackBefore = player.stack;

    // 액션 실행
    player.performAction(action, amount);

    // 팟 업데이트
    if (amount > 0) {
      this.pot += amount;
    }

    // 베팅 크기 업데이트
    if (action === ACTIONS.RAISE || action === ACTIONS.PUSH) {
      this.currentBet = player.betAmount;
      this.minRaise = Math.max(this.minRaise, amount - this.currentBet);
    } else if (action === ACTIONS.CALL) {
      // 콜은 현재 베팅과 맞춤
    }

    // 액션 히스토리 추가
    this.addActionToHistory(player.id, action, amount, {
      handNumber: this.handNumber,
      position: player.position,
      stackBefore,
      stackAfter: player.stack,
      potSize: this.pot,
    });

    this.emit('playerAction', {
      player,
      action,
      amount,
      pot: this.pot,
      currentBet: this.currentBet,
    });

    // 다음 플레이어로 이동
    this.moveToNextPlayer();

    // 핸드 종료 조건 확인
    this.checkHandComplete();
  }

  /**
   * 액션 유효성 검사
   * @param {Player} player - 플레이어
   * @param {string} action - 액션
   * @param {number} amount - 금액
   */
  validateAction(player, action, amount) {
    switch (action) {
      case ACTIONS.FOLD:
        // 폴드는 항상 가능
        break;

      case ACTIONS.CALL: {
        const callAmount = this.currentBet - player.betAmount;
        if (amount !== Math.min(callAmount, player.stack)) {
          throw new Error('Invalid call amount');
        }
        break;
      }

      case ACTIONS.RAISE: {
        const minRaiseAmount = this.currentBet + this.minRaise;
        if (amount < minRaiseAmount && amount !== player.stack) {
          throw new Error('Raise amount too small');
        }
        break;
      }

      case ACTIONS.PUSH: {
        if (amount !== player.stack) {
          throw new Error('Push must be all-in');
        }
        break;
      }

      default:
        throw new Error(`Invalid action: ${action}`);
    }
  }

  /**
   * 다음 플레이어로 이동
   */
  moveToNextPlayer() {
    const activePlayers = this.getActivePlayers();

    if (activePlayers.length <= 1) {
      this.currentPlayerSeat = null;
      return;
    }

    // 액션하지 않은 플레이어 찾기
    const currentIndex = this.playerOrder.indexOf(this.currentPlayerSeat);

    for (let i = 1; i < this.playerOrder.length; i++) {
      const nextIndex = (currentIndex + i) % this.playerOrder.length;
      const nextSeat = this.playerOrder[nextIndex];
      const nextPlayer = this.players.get(nextSeat);

      if (nextPlayer && nextPlayer.canAct()) {
        this.currentPlayerSeat = nextSeat;
        return;
      }
    }

    // 모든 플레이어가 액션 완료
    this.currentPlayerSeat = null;
  }

  /**
   * 활성 플레이어 목록 반환
   * @returns {Array}
   */
  getActivePlayers() {
    return Array.from(this.activePlayers)
      .map((seat) => this.players.get(seat))
      .filter((player) => player && player.status !== PLAYER_STATUS.FOLDED && player.stack >= 0);
  }

  /**
   * 핸드 완료 확인
   */
  checkHandComplete() {
    const activePlayers = this.getActivePlayers();
    const playersCanAct = activePlayers.filter((p) => p.canAct());

    if (playersCanAct.length === 0 || activePlayers.length === 1) {
      this.completeHand();
    }
  }

  /**
   * 핸드 완료 처리
   */
  completeHand() {
    this.phase = GAME_PHASE.HAND_COMPLETE;

    // 승자 결정 및 팟 분배
    const winners = this.determineWinners();
    this.distributePot(winners);

    // 탈락 플레이어 확인
    this.checkEliminations();

    // 딜러 버튼 이동
    this.moveDealer();

    // 게임 종료 확인
    if (this.activePlayers.size <= 1) {
      this.completeGame();
    } else {
      // 다음 핸드 준비
      setTimeout(() => this.startNewHand(), 2000);
    }

    this.emit('handComplete', {
      handNumber: this.handNumber,
      winners,
      pot: this.pot,
      activePlayers: this.activePlayers.size,
    });
  }

  /**
   * 승자 결정 (간단한 구현 - 실제로는 쇼다운 로직 필요)
   * @returns {Array}
   */
  determineWinners() {
    const activePlayers = this.getActivePlayers().filter((p) => p.status !== PLAYER_STATUS.FOLDED);

    if (activePlayers.length === 1) {
      return [activePlayers[0]];
    }

    // 임시: 남은 플레이어들이 팟 분할
    return activePlayers;
  }

  /**
   * 팟 분배
   * @param {Array} winners - 승자 목록
   */
  distributePot(winners) {
    if (winners.length === 0) {
      return;
    }

    const winAmount = Math.floor(this.pot / winners.length);

    winners.forEach((winner) => {
      winner.winPot(winAmount);
    });

    this.pot = 0;
  }

  /**
   * 탈락 확인 및 처리
   */
  checkEliminations() {
    const toEliminate = [];

    this.players.forEach((player, seat) => {
      if (player.stack === 0 && player.status !== PLAYER_STATUS.ELIMINATED) {
        player.setStatus(PLAYER_STATUS.ELIMINATED);
        this.activePlayers.delete(seat);
        toEliminate.push({ player, seat, position: this.activePlayers.size + 1 });
      }
    });

    toEliminate.forEach((elimination) => {
      this.gameStats.eliminationOrder.push(elimination);
      this.emit('playerEliminated', elimination);
    });
  }

  /**
   * 딜러 버튼 이동
   */
  moveDealer() {
    const activeSeats = Array.from(this.activePlayers).sort((a, b) => a - b);
    const currentIndex = activeSeats.indexOf(this.dealerSeat);

    if (currentIndex === -1 || activeSeats.length <= 1) {
      this.dealerSeat = activeSeats[0] || 0;
    } else {
      this.dealerSeat = activeSeats[(currentIndex + 1) % activeSeats.length];
    }
  }

  /**
   * 게임 완료
   */
  completeGame() {
    this.phase = GAME_PHASE.TOURNAMENT_COMPLETE;
    this.gameStats.endTime = new Date();

    // 최종 순위 및 상금 계산
    this.calculateFinalPayouts();

    this.emit('gameComplete', {
      gameId: this.gameId,
      winner: Array.from(this.players.values()).find((p) => p.stack > 0),
      finalStandings: this.gameStats.eliminationOrder.reverse(),
      payouts: this.gameStats.finalPayouts,
      gameStats: this.gameStats,
    });
  }

  /**
   * 최종 상금 계산
   */
  calculateFinalPayouts() {
    const totalPrizePool = this.config.maxPlayers * this.config.startingStack;
    const payoutStructure = [0.5, 0.3, 0.2]; // 1위 50%, 2위 30%, 3위 20%

    const standings = [...this.gameStats.eliminationOrder].reverse();
    standings.forEach((standing, index) => {
      const payoutPercent = payoutStructure[index] || 0;
      const payout = totalPrizePool * payoutPercent;
      this.gameStats.finalPayouts.set(standing.player.id, payout);
    });
  }

  /**
   * 액션 히스토리 추가
   * @param {string} playerId - 플레이어 ID
   * @param {string} action - 액션
   * @param {number} amount - 금액
   * @param {Object} metadata - 메타데이터
   */
  addActionToHistory(playerId, action, amount, metadata = {}) {
    const historyItem = new ActionHistoryItem(playerId, action, amount, metadata);
    this.actionHistory.push(historyItem);

    this.emit('actionHistoryUpdated', {
      action: historyItem,
      totalActions: this.actionHistory.length,
    });
  }

  /**
   * 플레이어 순서 업데이트
   */
  updatePlayerOrder() {
    const activeSeats = Array.from(this.activePlayers).sort((a, b) => a - b);
    this.playerOrder = activeSeats;
  }

  /**
   * 현재 포지션 정보 반환
   * @returns {Object}
   */
  getPositions() {
    const positions = {};
    this.players.forEach((player, seat) => {
      positions[seat] = {
        position: player.position,
        isDealer: player.isDealer,
        isActive: this.activePlayers.has(seat),
      };
    });
    return positions;
  }

  /**
   * 현재 ICM equity 계산
   * @returns {Object}
   */
  calculateCurrentICM() {
    const stacks = Array.from(this.activePlayers).map((seat) => this.players.get(seat).stack);

    return this.icmCalculator.calculateFull(stacks);
  }

  /**
   * 게임 상태 스냅샷 반환
   * @returns {Object}
   */
  getGameState() {
    return {
      gameId: this.gameId,
      phase: this.phase,
      handNumber: this.handNumber,
      level: this.level,
      blinds: this.blinds,
      pot: this.pot,
      currentBet: this.currentBet,
      currentPlayerSeat: this.currentPlayerSeat,
      dealerSeat: this.dealerSeat,
      players: Array.from(this.players.entries()).map(([seat, player]) => ({
        seat,
        ...player.toJSON(),
      })),
      activePlayers: Array.from(this.activePlayers),
      positions: this.getPositions(),
      actionHistory: this.actionHistory.slice(-20), // 최근 20개 액션
      gameStats: { ...this.gameStats },
      icmData: this.activePlayers.size > 1 ? this.calculateCurrentICM() : null,
    };
  }

  /**
   * 이벤트 리스너 등록
   * @param {string} event - 이벤트명
   * @param {Function} callback - 콜백 함수
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * 이벤트 발생
   * @param {string} event - 이벤트명
   * @param {Object} data - 이벤트 데이터
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * 상태 저장 (localStorage)
   */
  saveState() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`icm_game_${this.gameId}`, JSON.stringify(this.getGameState()));
    }
  }

  /**
   * 상태 복원 (localStorage)
   * @param {string} gameId - 게임 ID
   * @returns {boolean} 복원 성공 여부
   */
  loadState(gameId) {
    if (typeof localStorage !== 'undefined') {
      const savedState = localStorage.getItem(`icm_game_${gameId}`);
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          this.restoreFromState(state);
          return true;
        } catch (error) {
          console.error('Failed to load game state:', error);
        }
      }
    }
    return false;
  }

  /**
   * 상태에서 복원
   * @param {Object} state - 저장된 상태
   */
  restoreFromState(state) {
    this.gameId = state.gameId;
    this.phase = state.phase;
    this.handNumber = state.handNumber;
    this.level = state.level;
    this.blinds = state.blinds;
    this.pot = state.pot;
    this.currentBet = state.currentBet;
    this.currentPlayerSeat = state.currentPlayerSeat;
    this.dealerSeat = state.dealerSeat;
    this.activePlayers = new Set(state.activePlayers);
    this.actionHistory = state.actionHistory.map(
      (item) => new ActionHistoryItem(item.playerId, item.action, item.amount, item),
    );
    this.gameStats = state.gameStats;

    // 플레이어 복원
    this.players.clear();
    state.players.forEach((playerData) => {
      const player = new Player(playerData);
      this.players.set(playerData.seat, player);
    });

    this.updatePlayerOrder();
  }
}

// CommonJS 호환성
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Player,
    ActionHistoryItem,
    GameStateManager,
    PLAYER_STATUS,
    GAME_PHASE,
  };
}
