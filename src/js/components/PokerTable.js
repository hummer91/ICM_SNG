/**
 * Linear 포커 테이블 컴포넌트
 * 6인 SNG 테이블을 시각화하는 고급 컴포넌트
 *
 * 기능:
 * - 6인 원형 테이블 레이아웃
 * - 플레이어 포지션 표시
 * - 칩 스택 시각화
 * - 딜러 버튼 표시
 * - 액티브 플레이어 하이라이트
 * - 실시간 업데이트
 */

// Theme and Card imports removed as they are not used in this file

export class PokerTable {
  constructor() {
    this.element = null;
    this.players = new Map(); // seat -> player data
    this.activeSeat = null;
    this.dealerSeat = null;
    this.pot = 0;
    this.blinds = { small: 25, big: 50 };

    // 포지션 매핑 (6인 기준)
    this.positionMapping = {
      0: { name: 'BTN', angle: 0, x: 50, y: 80 },
      1: { name: 'SB', angle: 60, x: 80, y: 65 },
      2: { name: 'BB', angle: 120, x: 80, y: 35 },
      3: { name: 'UTG', angle: 180, x: 50, y: 20 },
      4: { name: 'MP', angle: 240, x: 20, y: 35 },
      5: { name: 'CO', angle: 300, x: 20, y: 65 },
    };

    this.init();
  }

  init() {
    this.createElement();
    this.attachStyles();
    this.setupEventListeners();
  }

  createElement() {
    this.element = document.createElement('div');
    this.element.className = 'poker-table';
    this.element.innerHTML = this.getTableHTML();
  }

  getTableHTML() {
    return `
      <div class="table-container">
        <!-- 테이블 배경 -->
        <div class="table-surface">
          <div class="table-felt"></div>
          
          <!-- 중앙 팟 영역 -->
          <div class="pot-area">
            <div class="pot-chips">
              <div class="pot-amount">$0</div>
              <div class="pot-label">Pot</div>
            </div>
          </div>

          <!-- 블라인드 정보 -->
          <div class="blinds-info">
            <div class="blind-level">Level 1</div>
            <div class="blind-amounts">${this.blinds.small}/${this.blinds.big}</div>
          </div>

          <!-- 딜러 버튼 -->
          <div class="dealer-button" id="dealer-button">
            <span>D</span>
          </div>

          <!-- 플레이어 좌석들 -->
          ${this.renderPlayerSeats()}
        </div>
      </div>
    `;
  }

  renderPlayerSeats() {
    let seatsHTML = '';

    for (let seat = 0; seat < 6; seat++) {
      const position = this.positionMapping[seat];
      seatsHTML += `
        <div class="player-seat" 
             id="seat-${seat}"
             data-seat="${seat}"
             data-position="${position.name}"
             style="left: ${position.x}%; top: ${position.y}%;">
          
          <div class="player-container">
            <!-- 플레이어 카드 -->
            <div class="player-card empty-seat">
              <div class="player-avatar">
                <div class="avatar-placeholder">?</div>
              </div>
              <div class="player-info">
                <div class="player-name">Empty</div>
                <div class="player-stack">-</div>
              </div>
              <div class="player-status"></div>
            </div>

            <!-- 포지션 라벨 -->
            <div class="position-label">${position.name}</div>

            <!-- 칩 스택 표시 -->
            <div class="chip-stack">
              <div class="chip-visual"></div>
              <div class="stack-amount">-</div>
            </div>

            <!-- 액션 표시 -->
            <div class="action-indicator"></div>

            <!-- 베팅 칩 -->
            <div class="bet-chips">
              <div class="bet-amount"></div>
            </div>
          </div>
        </div>
      `;
    }

    return seatsHTML;
  }

  attachStyles() {
    if (document.getElementById('poker-table-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'poker-table-styles';
    style.textContent = `
      .poker-table {
        width: 100%;
        height: 600px;
        position: relative;
        background: var(--bg-primary);
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      }

      .table-container {
        width: 100%;
        height: 100%;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .table-surface {
        width: 90%;
        height: 85%;
        position: relative;
        background: var(--bg-secondary);
        border-radius: 50%;
        border: 8px solid var(--border-primary);
        box-shadow: 
          inset 0 4px 12px rgba(0, 0, 0, 0.3),
          0 4px 20px rgba(0, 0, 0, 0.2);
      }

      .table-felt {
        position: absolute;
        inset: 12px;
        background: linear-gradient(135deg, 
          var(--bg-tertiary) 0%, 
          var(--bg-secondary) 50%, 
          var(--bg-tertiary) 100%);
        border-radius: 50%;
        border: 2px solid rgba(94, 106, 210, 0.1);
      }

      /* 중앙 팟 영역 */
      .pot-area {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        z-index: 10;
      }

      .pot-chips {
        background: var(--bg-tertiary);
        border: 2px solid var(--border-primary);
        border-radius: 12px;
        padding: 12px 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      .pot-amount {
        font-size: 18px;
        font-weight: 600;
        color: var(--success);
        margin-bottom: 4px;
      }

      .pot-label {
        font-size: 12px;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      /* 블라인드 정보 */
      .blinds-info {
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg-tertiary);
        border: 1px solid var(--border-primary);
        border-radius: 8px;
        padding: 8px 12px;
        text-align: center;
        z-index: 10;
      }

      .blind-level {
        font-size: 12px;
        color: var(--text-secondary);
        margin-bottom: 2px;
      }

      .blind-amounts {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
      }

      /* 딜러 버튼 */
      .dealer-button {
        position: absolute;
        width: 32px;
        height: 32px;
        background: var(--brand-purple);
        border: 2px solid var(--text-primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        color: white;
        font-size: 14px;
        z-index: 15;
        transition: all var(--animation-duration-200) var(--animation-easing-smooth);
        box-shadow: 0 3px 8px rgba(94, 106, 210, 0.4);
        opacity: 0;
      }

      .dealer-button.visible {
        opacity: 1;
      }

      /* 플레이어 좌석 */
      .player-seat {
        position: absolute;
        width: 120px;
        height: 100px;
        transform: translate(-50%, -50%);
        z-index: 20;
      }

      .player-container {
        position: relative;
        width: 100%;
        height: 100%;
      }

      .player-card {
        background: var(--bg-secondary);
        border: 2px solid var(--border-primary);
        border-radius: 12px;
        padding: 8px;
        text-align: center;
        transition: all var(--animation-duration-200) var(--animation-easing-smooth);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        min-height: 80px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .player-card.empty-seat {
        background: var(--bg-tertiary);
        border-color: var(--border-primary);
        opacity: 0.6;
      }

      .player-card.active {
        border-color: var(--brand-purple);
        box-shadow: 
          0 4px 12px rgba(0, 0, 0, 0.2),
          0 0 0 2px rgba(94, 106, 210, 0.3);
        transform: scale(1.05);
      }

      .player-card.folded {
        opacity: 0.4;
        filter: grayscale(1);
      }

      .player-card.all-in {
        border-color: var(--error);
        box-shadow: 
          0 4px 12px rgba(0, 0, 0, 0.2),
          0 0 0 2px rgba(235, 87, 87, 0.3);
      }

      .player-avatar {
        width: 32px;
        height: 32px;
        margin: 0 auto 6px;
        border-radius: 50%;
        background: var(--bg-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border-primary);
      }

      .avatar-placeholder {
        color: var(--text-secondary);
        font-size: 16px;
        font-weight: 600;
      }

      .player-info {
        flex: 1;
      }

      .player-name {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .empty-seat .player-name {
        color: var(--text-secondary);
      }

      .player-stack {
        font-size: 11px;
        color: var(--text-secondary);
      }

      /* 포지션 라벨 */
      .position-label {
        position: absolute;
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg-primary);
        border: 1px solid var(--border-primary);
        border-radius: 4px;
        padding: 2px 6px;
        font-size: 10px;
        font-weight: 600;
        color: var(--brand-purple);
        white-space: nowrap;
      }

      /* 칩 스택 시각화 */
      .chip-stack {
        position: absolute;
        bottom: -25px;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        opacity: 0;
        transition: opacity var(--animation-duration-200);
      }

      .player-seat:hover .chip-stack {
        opacity: 1;
      }

      .chip-visual {
        width: 20px;
        height: 8px;
        background: linear-gradient(to bottom, #4a5568, #2d3748);
        border-radius: 10px;
        margin: 0 auto 2px;
        border: 1px solid var(--border-primary);
      }

      .stack-amount {
        font-size: 10px;
        color: var(--text-secondary);
        font-weight: 600;
      }

      /* 액션 표시 */
      .action-indicator {
        position: absolute;
        top: -8px;
        right: -8px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        font-size: 10px;
        font-weight: 700;
        display: none;
        align-items: center;
        justify-content: center;
        color: white;
        text-transform: uppercase;
      }

      .action-indicator.fold {
        background: var(--error);
        display: flex;
      }

      .action-indicator.call {
        background: var(--warning);
        display: flex;
      }

      .action-indicator.raise {
        background: var(--success);
        display: flex;
      }

      .action-indicator.allin {
        background: var(--brand-purple);
        display: flex;
      }

      /* 베팅 칩 */
      .bet-chips {
        position: absolute;
        top: -30px;
        right: -10px;
        background: var(--warning);
        border: 1px solid var(--border-primary);
        border-radius: 4px;
        padding: 2px 6px;
        font-size: 10px;
        font-weight: 600;
        color: var(--bg-primary);
        display: none;
      }

      .bet-chips.visible {
        display: block;
      }

      /* 반응형 디자인 */
      @media (max-width: 768px) {
        .poker-table {
          height: 500px;
        }

        .player-seat {
          width: 100px;
          height: 80px;
        }

        .player-card {
          padding: 6px;
          min-height: 65px;
        }

        .player-avatar {
          width: 24px;
          height: 24px;
        }

        .avatar-placeholder {
          font-size: 12px;
        }

        .player-name {
          font-size: 10px;
        }

        .player-stack {
          font-size: 9px;
        }
      }

      /* 애니메이션 */
      @keyframes chipStack {
        0% { transform: translateY(5px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }

      @keyframes dealerMove {
        0% { transform: scale(1) rotate(0deg); }
        50% { transform: scale(1.1) rotate(180deg); }
        100% { transform: scale(1) rotate(360deg); }
      }

      .dealer-button.moving {
        animation: dealerMove var(--animation-duration-300) var(--animation-easing-smooth);
      }

      .chip-visual {
        animation: chipStack var(--animation-duration-200) var(--animation-easing-smooth);
      }
    `;

    document.head.appendChild(style);
  }

  setupEventListeners() {
    // 플레이어 좌석 클릭 이벤트
    this.element.addEventListener('click', (e) => {
      const seat = e.target.closest('.player-seat');
      if (seat) {
        const seatNumber = parseInt(seat.dataset.seat, 10);
        this.onSeatClick(seatNumber);
      }
    });

    // 호버 효과
    this.element.addEventListener('mouseenter', (e) => {
      if (e.target.closest('.player-seat')) {
        this.showPlayerDetails(e.target.closest('.player-seat'));
      }
    });
  }

  /**
   * 플레이어를 좌석에 추가
   */
  addPlayer(seatNumber, playerData) {
    if (seatNumber < 0 || seatNumber > 5) {
      throw new Error('Invalid seat number');
    }

    this.players.set(seatNumber, playerData);
    this.updatePlayerSeat(seatNumber, playerData);
  }

  /**
   * 플레이어 좌석 업데이트
   */
  updatePlayerSeat(seatNumber, playerData) {
    const seat = this.element.querySelector(`#seat-${seatNumber}`);
    if (!seat) {
      return;
    }

    const playerCard = seat.querySelector('.player-card');
    const playerName = seat.querySelector('.player-name');
    const playerStack = seat.querySelector('.player-stack');
    const stackAmount = seat.querySelector('.stack-amount');
    const avatar = seat.querySelector('.avatar-placeholder');

    // 빈 좌석에서 플레이어 좌석으로 변경
    playerCard.classList.remove('empty-seat');

    // 플레이어 정보 업데이트
    playerName.textContent = playerData.name || `Player ${seatNumber + 1}`;
    playerStack.textContent = `$${playerData.stack || 0}`;
    stackAmount.textContent = `${this.formatStackInBB(playerData.stack)}BB`;
    avatar.textContent = (playerData.name || 'P').charAt(0).toUpperCase();

    // 상태별 스타일링
    this.updatePlayerStatus(seatNumber, playerData.status);
  }

  /**
   * 플레이어 상태 업데이트
   */
  updatePlayerStatus(seatNumber, status) {
    const seat = this.element.querySelector(`#seat-${seatNumber}`);
    if (!seat) {
      return;
    }

    const playerCard = seat.querySelector('.player-card');
    const actionIndicator = seat.querySelector('.action-indicator');

    // 기존 상태 클래스 제거
    playerCard.classList.remove('active', 'folded', 'all-in');
    actionIndicator.classList.remove('fold', 'call', 'raise', 'allin');

    // 새 상태 적용
    switch (status) {
      case 'ACTIVE':
        playerCard.classList.add('active');
        break;
      case 'FOLDED':
        playerCard.classList.add('folded');
        actionIndicator.classList.add('fold');
        actionIndicator.textContent = 'F';
        break;
      case 'ALL_IN':
        playerCard.classList.add('all-in');
        actionIndicator.classList.add('allin');
        actionIndicator.textContent = 'AI';
        break;
    }
  }

  /**
   * 액티브 플레이어 설정
   */
  setActivePlayer(seatNumber) {
    // 기존 액티브 플레이어 해제
    this.element.querySelectorAll('.player-card.active').forEach((card) => {
      card.classList.remove('active');
    });

    // 새 액티브 플레이어 설정
    if (seatNumber !== null && seatNumber !== undefined) {
      const seat = this.element.querySelector(`#seat-${seatNumber}`);
      if (seat) {
        const playerCard = seat.querySelector('.player-card');
        playerCard.classList.add('active');
      }
    }

    this.activeSeat = seatNumber;
  }

  /**
   * 딜러 버튼 이동
   */
  moveDealerButton(seatNumber) {
    const dealerButton = this.element.querySelector('.dealer-button');
    const targetSeat = this.element.querySelector(`#seat-${seatNumber}`);

    if (!targetSeat) {
      return;
    }

    const position = this.positionMapping[seatNumber];

    // 애니메이션 효과
    dealerButton.classList.add('moving');

    setTimeout(() => {
      dealerButton.style.left = `${position.x}%`;
      dealerButton.style.top = `${position.y}%`;
      dealerButton.classList.remove('moving');
      dealerButton.classList.add('visible');
    }, 150);

    this.dealerSeat = seatNumber;
  }

  /**
   * 팟 금액 업데이트
   */
  updatePot(amount) {
    const potAmount = this.element.querySelector('.pot-amount');
    if (potAmount) {
      potAmount.textContent = `$${amount}`;
    }
    this.pot = amount;
  }

  /**
   * 블라인드 레벨 업데이트
   */
  updateBlinds(level, small, big) {
    const blindLevel = this.element.querySelector('.blind-level');
    const blindAmounts = this.element.querySelector('.blind-amounts');

    if (blindLevel) {
      blindLevel.textContent = `Level ${level}`;
    }
    if (blindAmounts) {
      blindAmounts.textContent = `${small}/${big}`;
    }

    this.blinds = { small, big };
  }

  /**
   * 플레이어 베팅 표시
   */
  showPlayerBet(seatNumber, amount) {
    const seat = this.element.querySelector(`#seat-${seatNumber}`);
    if (!seat) {
      return;
    }

    const betChips = seat.querySelector('.bet-chips');
    const betAmount = seat.querySelector('.bet-amount');

    if (amount > 0) {
      betAmount.textContent = `$${amount}`;
      betChips.classList.add('visible');
    } else {
      betChips.classList.remove('visible');
    }
  }

  /**
   * 스택을 BB 단위로 포맷
   */
  formatStackInBB(stack) {
    if (!stack || this.blinds.big === 0) {
      return '-';
    }
    return Math.round((stack / this.blinds.big) * 10) / 10;
  }

  /**
   * 플레이어 제거
   */
  removePlayer(seatNumber) {
    this.players.delete(seatNumber);

    const seat = this.element.querySelector(`#seat-${seatNumber}`);
    if (!seat) {
      return;
    }

    const playerCard = seat.querySelector('.player-card');
    const playerName = seat.querySelector('.player-name');
    const playerStack = seat.querySelector('.player-stack');
    const stackAmount = seat.querySelector('.stack-amount');
    const avatar = seat.querySelector('.avatar-placeholder');

    // 빈 좌석으로 되돌리기
    playerCard.className = 'player-card empty-seat';
    playerName.textContent = 'Empty';
    playerStack.textContent = '-';
    stackAmount.textContent = '-';
    avatar.textContent = '?';

    // 베팅 숨기기
    this.showPlayerBet(seatNumber, 0);
  }

  /**
   * 테이블 초기화
   */
  reset() {
    this.players.clear();
    this.activeSeat = null;
    this.dealerSeat = null;
    this.pot = 0;

    // 모든 좌석 초기화
    for (let i = 0; i < 6; i++) {
      this.removePlayer(i);
    }

    // 딜러 버튼 숨기기
    const dealerButton = this.element.querySelector('.dealer-button');
    dealerButton.classList.remove('visible');

    // 팟 초기화
    this.updatePot(0);
  }

  /**
   * 좌석 클릭 이벤트 핸들러
   */
  onSeatClick(seatNumber) {
    const event = new CustomEvent('seatclick', {
      detail: {
        seat: seatNumber,
        player: this.players.get(seatNumber),
      },
    });
    this.element.dispatchEvent(event);
  }

  /**
   * 플레이어 상세 정보 표시
   */
  showPlayerDetails(_seatElement) {
    // 구현 예정: 툴팁이나 모달로 상세 정보 표시
  }

  /**
   * 정적 팩토리 메소드
   */
  static create(config = {}) {
    const table = new PokerTable();

    if (config.players) {
      config.players.forEach((player, index) => {
        table.addPlayer(index, player);
      });
    }

    if (config.dealerSeat !== undefined) {
      table.moveDealerButton(config.dealerSeat);
    }

    if (config.activeSeat !== undefined) {
      table.setActivePlayer(config.activeSeat);
    }

    return table;
  }
}
