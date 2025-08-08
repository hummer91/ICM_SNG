/**
 * 게임 상태 관리 시스템 테스트
 * Player, ActionHistoryItem, GameStateManager 클래스 검증
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  Player,
  ActionHistoryItem,
  GameStateManager,
  PLAYER_STATUS,
  GAME_PHASE,
} from './gamestate.js';
import { POSITIONS, ACTIONS } from './pushfold.js';

describe('Player 클래스', () => {
  let player;

  beforeEach(() => {
    player = new Player({
      id: 'test-player',
      name: 'Test Player',
      stack: 1500,
      seat: 0,
    });
  });

  describe('기본 기능', () => {
    it('플레이어가 올바르게 초기화되어야 함', () => {
      expect(player.id).toBe('test-player');
      expect(player.name).toBe('Test Player');
      expect(player.stack).toBe(1500);
      expect(player.seat).toBe(0);
      expect(player.status).toBe(PLAYER_STATUS.ACTIVE);
    });

    it('기본값으로 플레이어가 생성되어야 함', () => {
      const defaultPlayer = new Player();

      expect(defaultPlayer.id).toBeDefined();
      expect(defaultPlayer.name).toContain('Player');
      expect(defaultPlayer.stack).toBe(1500);
      expect(defaultPlayer.status).toBe(PLAYER_STATUS.ACTIVE);
    });

    it('고유 ID가 생성되어야 함', () => {
      const player1 = new Player();
      const player2 = new Player();

      expect(player1.id).not.toBe(player2.id);
    });
  });

  describe('상태 관리', () => {
    it('플레이어 상태를 올바르게 설정해야 함', () => {
      player.setStatus(PLAYER_STATUS.FOLDED);

      expect(player.status).toBe(PLAYER_STATUS.FOLDED);
      expect(player.lastActionAt).toBeInstanceOf(Date);
    });

    it('잘못된 상태 설정 시 에러를 던져야 함', () => {
      expect(() => {
        player.setStatus('INVALID_STATUS');
      }).toThrow('Invalid player status');
    });

    it('활성 상태 확인이 올바르게 작동해야 함', () => {
      expect(player.isActive()).toBe(true);

      player.setStatus(PLAYER_STATUS.FOLDED);
      expect(player.isActive()).toBe(false);

      player.setStatus(PLAYER_STATUS.ACTIVE);
      player.stack = 0;
      expect(player.isActive()).toBe(false);
    });

    it('액션 가능 여부를 올바르게 확인해야 함', () => {
      expect(player.canAct()).toBe(true);

      player.hasActed = true;
      expect(player.canAct()).toBe(false);

      player.hasActed = false;
      player.setStatus(PLAYER_STATUS.FOLDED);
      expect(player.canAct()).toBe(false);
    });
  });

  describe('액션 수행', () => {
    it('폴드 액션을 올바르게 처리해야 함', () => {
      player.performAction(ACTIONS.FOLD);

      expect(player.currentAction).toBe(ACTIONS.FOLD);
      expect(player.hasActed).toBe(true);
      expect(player.status).toBe(PLAYER_STATUS.FOLDED);
      expect(player.stack).toBe(1500); // 스택 변화 없음
    });

    it('콜 액션을 올바르게 처리해야 함', () => {
      player.performAction(ACTIONS.CALL, 100);

      expect(player.currentAction).toBe(ACTIONS.CALL);
      expect(player.betAmount).toBe(100);
      expect(player.stack).toBe(1400);
      expect(player.status).toBe(PLAYER_STATUS.ACTIVE);
    });

    it('레이즈 액션을 올바르게 처리해야 함', () => {
      player.performAction(ACTIONS.RAISE, 200);

      expect(player.currentAction).toBe(ACTIONS.RAISE);
      expect(player.betAmount).toBe(200);
      expect(player.stack).toBe(1300);
    });

    it('올인 시 상태가 올바르게 변경되어야 함', () => {
      player.performAction(ACTIONS.PUSH, 1500);

      expect(player.stack).toBe(0);
      expect(player.status).toBe(PLAYER_STATUS.ALL_IN);
    });

    it('잘못된 액션에 대해 에러를 던져야 함', () => {
      expect(() => {
        player.performAction('INVALID_ACTION');
      }).toThrow('Invalid action');
    });
  });

  describe('통계 관리', () => {
    it('통계가 올바르게 업데이트되어야 함', () => {
      const initialHands = player.stats.handsPlayed;
      const initialVPIP = player.stats.vpip;
      const initialPFR = player.stats.pfr;

      player.performAction(ACTIONS.RAISE, 200);

      expect(player.stats.handsPlayed).toBe(initialHands + 1);
      expect(player.stats.vpip).toBe(initialVPIP + 1);
      expect(player.stats.pfr).toBe(initialPFR + 1);
    });

    it('팟 승리 시 통계가 업데이트되어야 함', () => {
      const initialWins = player.stats.wins;
      const initialWinnings = player.stats.totalWinnings;

      player.winPot(500);

      expect(player.stack).toBe(2000);
      expect(player.stats.wins).toBe(initialWins + 1);
      expect(player.stats.totalWinnings).toBe(initialWinnings + 500);
      expect(player.stats.biggestPot).toBe(500);
    });
  });

  describe('유틸리티 메소드', () => {
    it('BB 단위 스택 계산이 올바른지 확인', () => {
      expect(player.getStackInBB(50)).toBe(30); // 1500 / 50 = 30BB
      expect(player.getStackInBB(100)).toBe(15); // 1500 / 100 = 15BB
    });

    it('새 핸드 리셋이 올바르게 작동해야 함', () => {
      player.performAction(ACTIONS.CALL, 100);
      player.setStatus(PLAYER_STATUS.FOLDED);

      player.resetForNewHand();

      expect(player.currentAction).toBe(null);
      expect(player.betAmount).toBe(0);
      expect(player.hasActed).toBe(false);
      expect(player.status).toBe(PLAYER_STATUS.ACTIVE);
    });

    it('JSON 직렬화가 올바르게 작동해야 함', () => {
      const json = player.toJSON();

      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('name');
      expect(json).toHaveProperty('stack');
      expect(json).toHaveProperty('position');
      expect(json).toHaveProperty('status');
      expect(json).toHaveProperty('stats');
    });
  });
});

describe('ActionHistoryItem 클래스', () => {
  let actionItem;

  beforeEach(() => {
    actionItem = new ActionHistoryItem('player-1', ACTIONS.RAISE, 200, {
      handNumber: 5,
      position: POSITIONS.BTN,
      stackBefore: 1500,
      stackAfter: 1300,
    });
  });

  it('액션 히스토리 항목이 올바르게 초기화되어야 함', () => {
    expect(actionItem.playerId).toBe('player-1');
    expect(actionItem.action).toBe(ACTIONS.RAISE);
    expect(actionItem.amount).toBe(200);
    expect(actionItem.handNumber).toBe(5);
    expect(actionItem.position).toBe(POSITIONS.BTN);
    expect(actionItem.timestamp).toBeInstanceOf(Date);
  });

  it('고유 ID가 생성되어야 함', () => {
    const item1 = new ActionHistoryItem('player-1', ACTIONS.FOLD);
    const item2 = new ActionHistoryItem('player-1', ACTIONS.FOLD);

    expect(item1.id).not.toBe(item2.id);
  });

  it('JSON 직렬화가 올바르게 작동해야 함', () => {
    const json = actionItem.toJSON();

    expect(json).toHaveProperty('id');
    expect(json).toHaveProperty('playerId');
    expect(json).toHaveProperty('action');
    expect(json).toHaveProperty('amount');
    expect(json).toHaveProperty('timestamp');
    expect(json).toHaveProperty('handNumber');
  });
});

describe('GameStateManager 클래스', () => {
  let gameManager;

  beforeEach(() => {
    gameManager = new GameStateManager({
      maxPlayers: 6,
      startingStack: 1500,
      startingBlinds: { small: 25, big: 50 },
    });
  });

  describe('기본 기능', () => {
    it('게임 매니저가 올바르게 초기화되어야 함', () => {
      expect(gameManager.gameId).toBeDefined();
      expect(gameManager.phase).toBe(GAME_PHASE.PRE_GAME);
      expect(gameManager.players.size).toBe(0);
      expect(gameManager.blinds.small).toBe(25);
      expect(gameManager.blinds.big).toBe(50);
    });

    it('기본 블라인드 구조가 올바르게 설정되어야 함', () => {
      const blindStructure = gameManager.getDefaultBlindStructure();

      expect(blindStructure).toHaveLength(10);
      expect(blindStructure[0]).toEqual({
        level: 1,
        small: 25,
        big: 50,
        ante: 0,
      });
    });
  });

  describe('플레이어 관리', () => {
    it('플레이어를 올바르게 추가해야 함', () => {
      const player = gameManager.addPlayer({
        name: 'Test Player 1',
      });

      expect(gameManager.players.size).toBe(1);
      expect(gameManager.activePlayers.has(player.seat)).toBe(true);
      expect(player.stack).toBe(1500);
    });

    it('최대 플레이어 수 초과 시 에러를 던져야 함', () => {
      // 6명 추가
      for (let i = 0; i < 6; i++) {
        gameManager.addPlayer({ name: `Player ${i + 1}` });
      }

      expect(() => {
        gameManager.addPlayer({ name: 'Player 7' });
      }).toThrow('Maximum players reached');
    });

    it('플레이어를 올바르게 제거해야 함', () => {
      const player = gameManager.addPlayer({ name: 'Test Player' });
      const { seat } = player;

      gameManager.removePlayer(seat);

      expect(gameManager.players.has(seat)).toBe(false);
      expect(gameManager.activePlayers.has(seat)).toBe(false);
    });

    it('존재하지 않는 플레이어 제거 시 에러를 던져야 함', () => {
      expect(() => {
        gameManager.removePlayer(5);
      }).toThrow('No player at seat 5');
    });
  });

  describe('게임 시작 및 진행', () => {
    beforeEach(() => {
      // 3명의 플레이어 추가
      gameManager.addPlayer({ name: 'Player 1' });
      gameManager.addPlayer({ name: 'Player 2' });
      gameManager.addPlayer({ name: 'Player 3' });
    });

    it('게임을 올바르게 시작해야 함', () => {
      gameManager.startGame();

      expect(gameManager.phase).toBe(GAME_PHASE.PLAYING);
      expect(gameManager.handNumber).toBe(1);
      expect(gameManager.gameStats.startTime).toBeInstanceOf(Date);
    });

    it('플레이어가 2명 미만일 때 게임 시작 시 에러를 던져야 함', () => {
      const singlePlayerManager = new GameStateManager();
      singlePlayerManager.addPlayer({ name: 'Only Player' });

      expect(() => {
        singlePlayerManager.startGame();
      }).toThrow('Need at least 2 players to start');
    });

    it('포지션이 올바르게 할당되어야 함', () => {
      gameManager.startGame();

      const players = Array.from(gameManager.players.values());
      const positions = players.map((p) => p.position);

      expect(positions).toContain(POSITIONS.BTN);
      expect(positions).toContain(POSITIONS.SB);
      expect(positions).toContain(POSITIONS.BB);
    });

    it('블라인드가 올바르게 징수되어야 함', () => {
      gameManager.startGame();

      const sbPlayer = Array.from(gameManager.players.values()).find(
        (p) => p.position === POSITIONS.SB,
      );
      const bbPlayer = Array.from(gameManager.players.values()).find(
        (p) => p.position === POSITIONS.BB,
      );

      expect(sbPlayer.betAmount).toBe(25);
      expect(bbPlayer.betAmount).toBe(50);
      expect(gameManager.pot).toBe(75);
    });
  });

  describe('포지션 관리', () => {
    it('2명일 때 포지션 매핑이 올바른지 확인', () => {
      const mapping = gameManager.getPositionMapping(2);
      expect(mapping).toEqual([POSITIONS.BTN, POSITIONS.BB]);
    });

    it('6명일 때 포지션 매핑이 올바른지 확인', () => {
      const mapping = gameManager.getPositionMapping(6);
      expect(mapping).toEqual([
        POSITIONS.BTN,
        POSITIONS.SB,
        POSITIONS.BB,
        POSITIONS.UTG,
        POSITIONS.MP,
        POSITIONS.CO,
      ]);
    });

    it('지원하지 않는 플레이어 수에 대해 에러를 던져야 함', () => {
      expect(() => {
        gameManager.getPositionMapping(7);
      }).toThrow('Unsupported player count: 7');
    });
  });

  describe('액션 처리', () => {
    beforeEach(() => {
      gameManager.addPlayer({ name: 'Player 1' });
      gameManager.addPlayer({ name: 'Player 2' });
      gameManager.addPlayer({ name: 'Player 3' });
      gameManager.startGame();
    });

    it('플레이어 액션을 올바르게 처리해야 함', () => {
      const currentSeat = gameManager.currentPlayerSeat;
      const player = gameManager.players.get(currentSeat);
      const initialStack = player.stack;

      gameManager.processPlayerAction(currentSeat, ACTIONS.CALL, 50);

      expect(player.currentAction).toBe(ACTIONS.CALL);
      expect(player.stack).toBe(initialStack - 50);
      expect(gameManager.pot).toBeGreaterThan(75); // 블라인드 + 콜
    });

    it('차례가 아닌 플레이어의 액션 시 에러를 던져야 함', () => {
      const currentSeat = gameManager.currentPlayerSeat;
      const wrongSeat = Array.from(gameManager.players.keys()).find((seat) => seat !== currentSeat);

      expect(() => {
        gameManager.processPlayerAction(wrongSeat, ACTIONS.FOLD);
      }).toThrow("Not this player's turn");
    });

    it('잘못된 액션 금액에 대해 에러를 던져야 함', () => {
      const currentSeat = gameManager.currentPlayerSeat;

      expect(() => {
        gameManager.processPlayerAction(currentSeat, ACTIONS.CALL, 1000); // 너무 큰 콜 금액
      }).toThrow('Invalid call amount');
    });
  });

  describe('액션 히스토리', () => {
    beforeEach(() => {
      gameManager.addPlayer({ name: 'Player 1' });
      gameManager.addPlayer({ name: 'Player 2' });
      gameManager.startGame();
    });

    it('액션 히스토리가 올바르게 기록되어야 함', () => {
      const initialHistoryLength = gameManager.actionHistory.length;
      const currentSeat = gameManager.currentPlayerSeat;

      gameManager.processPlayerAction(currentSeat, ACTIONS.FOLD);

      expect(gameManager.actionHistory.length).toBe(initialHistoryLength + 1);

      const lastAction = gameManager.actionHistory[gameManager.actionHistory.length - 1];
      expect(lastAction.action).toBe(ACTIONS.FOLD);
      expect(lastAction.playerId).toBe(gameManager.players.get(currentSeat).id);
    });
  });

  describe('게임 완료', () => {
    it('1명 남을 때 게임이 완료되어야 함', () => {
      // const player1 = gameManager.addPlayer({ name: 'Player 1' }); // Currently unused
      gameManager.addPlayer({ name: 'Player 1' });
      const player2 = gameManager.addPlayer({ name: 'Player 2' });

      gameManager.startGame();

      // 플레이어 2 탈락 시뮬레이션
      player2.stack = 0;
      player2.setStatus(PLAYER_STATUS.ELIMINATED);
      gameManager.activePlayers.delete(player2.seat);

      gameManager.checkEliminations();

      expect(gameManager.activePlayers.size).toBe(1);
    });

    it('최종 상금이 올바르게 계산되어야 함', () => {
      gameManager.addPlayer({ name: 'Player 1' });
      gameManager.addPlayer({ name: 'Player 2' });
      gameManager.addPlayer({ name: 'Player 3' });

      gameManager.calculateFinalPayouts();

      const totalPayout = Array.from(gameManager.gameStats.finalPayouts.values()).reduce(
        (sum, payout) => sum + payout,
        0,
      );

      const expectedTotal = 3 * 1500; // 3명 × 시작 스택
      expect(totalPayout).toBe(expectedTotal);
    });
  });

  describe('블라인드 레벨 관리', () => {
    it('시간 경과에 따른 블라인드 상승이 작동해야 함', () => {
      // 시간을 10분 후로 설정
      gameManager.levelStartTime = new Date(Date.now() - 11 * 60 * 1000);

      const initialLevel = gameManager.level;
      gameManager.checkBlindLevel();

      expect(gameManager.level).toBe(initialLevel + 1);
      expect(gameManager.blinds.small).toBeGreaterThan(25);
    });
  });

  describe('게임 상태 스냅샷', () => {
    it('게임 상태를 올바르게 반환해야 함', () => {
      gameManager.addPlayer({ name: 'Player 1' });
      gameManager.addPlayer({ name: 'Player 2' });

      const gameState = gameManager.getGameState();

      expect(gameState).toHaveProperty('gameId');
      expect(gameState).toHaveProperty('phase');
      expect(gameState).toHaveProperty('players');
      expect(gameState).toHaveProperty('blinds');
      expect(gameState).toHaveProperty('pot');
      expect(gameState.players).toHaveLength(2);
    });
  });

  describe('이벤트 시스템', () => {
    it('이벤트 리스너가 올바르게 작동해야 함', () => {
      const mockCallback = vi.fn();
      gameManager.on('playerAdded', mockCallback);

      gameManager.addPlayer({ name: 'Test Player' });

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          player: expect.any(Player),
          seat: expect.any(Number),
        }),
      );
    });

    it('여러 이벤트 리스너가 올바르게 작동해야 함', () => {
      const mockCallback1 = vi.fn();
      const mockCallback2 = vi.fn();

      gameManager.on('playerAdded', mockCallback1);
      gameManager.on('playerAdded', mockCallback2);

      gameManager.addPlayer({ name: 'Test Player' });

      expect(mockCallback1).toHaveBeenCalledTimes(1);
      expect(mockCallback2).toHaveBeenCalledTimes(1);
    });

    it('이벤트 리스너 에러가 다른 리스너에 영향을 주지 않아야 함', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Test error');
      });
      const normalCallback = vi.fn();

      gameManager.on('playerAdded', errorCallback);
      gameManager.on('playerAdded', normalCallback);

      // 에러가 발생해도 다른 콜백은 실행되어야 함
      gameManager.addPlayer({ name: 'Test Player' });

      expect(errorCallback).toHaveBeenCalledTimes(1);
      expect(normalCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('상태 저장 및 복원', () => {
    // localStorage mock
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });
    });

    it('게임 상태를 저장해야 함', () => {
      gameManager.addPlayer({ name: 'Player 1' });
      gameManager.saveState();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `icm_game_${gameManager.gameId}`,
        expect.any(String),
      );
    });

    it('저장된 게임 상태를 복원해야 함', () => {
      const gameState = {
        gameId: 'test-game',
        phase: GAME_PHASE.PLAYING,
        handNumber: 5,
        players: [
          {
            id: 'player-1',
            name: 'Player 1',
            seat: 0,
            stack: 1000,
            status: PLAYER_STATUS.ACTIVE,
          },
        ],
        activePlayers: [0],
        actionHistory: [],
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(gameState));

      const restored = gameManager.loadState('test-game');

      expect(restored).toBe(true);
      expect(gameManager.gameId).toBe('test-game');
      expect(gameManager.phase).toBe(GAME_PHASE.PLAYING);
      expect(gameManager.handNumber).toBe(5);
    });

    it('잘못된 저장 데이터 복원 시 false를 반환해야 함', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const restored = gameManager.loadState('test-game');

      expect(restored).toBe(false);
    });
  });

  describe('ICM 계산 통합', () => {
    it('현재 ICM을 올바르게 계산해야 함', () => {
      gameManager.addPlayer({ name: 'Player 1' });
      gameManager.addPlayer({ name: 'Player 2' });
      gameManager.addPlayer({ name: 'Player 3' });

      const icmData = gameManager.calculateCurrentICM();

      expect(icmData).toBeDefined();
      expect(icmData.equities).toHaveLength(3);
      expect(icmData.totalChips).toBe(4500); // 3 × 1500
    });

    it('1명만 남았을 때 ICM 계산을 하지 않아야 함', () => {
      gameManager.addPlayer({ name: 'Player 1' });

      const gameState = gameManager.getGameState();

      expect(gameState.icmData).toBe(null);
    });
  });

  describe('엣지 케이스', () => {
    it('딜러 버튼이 탈락한 플레이어에게 있을 때 올바르게 이동해야 함', () => {
      const player1 = gameManager.addPlayer({ name: 'Player 1' });
      const player2 = gameManager.addPlayer({ name: 'Player 2' });
      const player3 = gameManager.addPlayer({ name: 'Player 3' });

      gameManager.dealerSeat = player2.seat;

      // 플레이어 2 탈락
      gameManager.activePlayers.delete(player2.seat);

      gameManager.moveDealer();

      expect([player1.seat, player3.seat]).toContain(gameManager.dealerSeat);
    });

    it('모든 플레이어가 올인일 때 핸드가 올바르게 완료되어야 함', () => {
      gameManager.addPlayer({ name: 'Player 1' });
      gameManager.addPlayer({ name: 'Player 2' });
      gameManager.startGame();

      // 모든 플레이어를 올인 상태로 설정
      gameManager.players.forEach((player) => {
        player.setStatus(PLAYER_STATUS.ALL_IN);
        player.hasActed = true;
      });

      gameManager.currentPlayerSeat = null;
      gameManager.checkHandComplete();

      expect(gameManager.phase).toBe(GAME_PHASE.HAND_COMPLETE);
    });
  });
});
