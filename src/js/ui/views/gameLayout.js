/**
 * 게임 레이아웃 뷰
 * @module ui/views/gameLayout
 */

import { Button, Card } from '../../components/index.js';
import { POSITIONS, UI_CONSTANTS } from '../../utils/constants.js';
import config from '../../../config/environment.js';

/**
 * 게임 레이아웃 초기화
 */
export function initializeGameLayout() {
  const app = document.getElementById('app');

  // 기본 구조 생성
  app.innerHTML = `
    <header class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <h1 class="app-title">ICM SNG Poker</h1>
          <p class="app-subtitle">6-Max Push/Fold Strategy</p>
        </div>
        <div class="header-actions">
          <button id="settings-btn" class="icon-button" title="설정">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" stroke-width="1.5"/>
              <path d="M10 3.33334V1.66667M10 18.3333V16.6667M16.6667 10H18.3333M1.66667 10H3.33334M14.7141 14.7141L15.8926 15.8926M4.10744 4.10745L5.28595 5.28596M14.7141 5.28596L15.8926 4.10745M4.10744 15.8926L5.28595 14.7141" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
          <button id="help-btn" class="icon-button" title="도움말">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8.33333" stroke="currentColor" stroke-width="1.5"/>
              <path d="M7.5 7.5C7.5 6.11929 8.61929 5 10 5C11.3807 5 12.5 6.11929 12.5 7.5C12.5 8.88071 11.3807 10 10 10V11.6667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="10" cy="14.1667" r="0.833333" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
    
    <main class="app-main">
      <div class="game-container">
        <!-- 포커 테이블 영역 -->
        <div class="table-section">
          <div class="poker-table-container">
            <div class="poker-table">
              <!-- 테이블 배경 -->
              <div class="table-felt">
                <div class="table-edge"></div>
                <div class="table-center">
                  <div class="pot-display">
                    <span class="pot-label">POT</span>
                    <span class="pot-amount">0</span>
                  </div>
                </div>
              </div>
              
              <!-- 플레이어 위치 -->
              <div class="players-container" id="players-container">
                <!-- 동적으로 생성됩니다 -->
              </div>
              
              <!-- 딜러 버튼 -->
              <div class="dealer-button" id="dealer-button">
                <span>D</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 컨트롤 패널 -->
        <div class="control-section">
          <div class="control-panel">
            <!-- ICM 정보 패널 -->
            <div class="icm-panel" id="icm-panel">
              <!-- 동적으로 생성됩니다 -->
            </div>
            
            <!-- 액션 컨트롤 -->
            <div class="action-controls" id="action-controls">
              <!-- 동적으로 생성됩니다 -->
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <!-- 모달 컨테이너 -->
    <div id="modal-container"></div>
  `;

  // 스타일 클래스 추가
  document.body.classList.add('poker-app');

  // 플레이어 위치 초기화
  initializePlayerPositions();

  // 컨트롤 패널 초기화
  initializeControlPanel();

  // 이벤트 리스너 설정
  setupEventListeners();

  if (config.debug) {
    console.info('Game layout initialized');
  }
}

/**
 * 플레이어 위치 초기화
 */
function initializePlayerPositions() {
  const container = document.getElementById('players-container');
  const positions = Object.values(POSITIONS);

  positions.forEach((position, index) => {
    // 원형 테이블에서의 위치 계산
    const angle = (index * 60 - 90) * (Math.PI / 180); // 60도 간격, -90도 시작
    const radius = UI_CONSTANTS.TABLE_RADIUS;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    // 플레이어 카드 생성
    const playerCard = Card.create({
      title: `Player ${index + 1}`,
      subtitle: position,
      className: 'player-card',
      variant: 'elevated',
    });

    // 위치 설정
    playerCard.style.position = 'absolute';
    playerCard.style.left = `calc(50% + ${x}px - ${UI_CONSTANTS.PLAYER_CARD_WIDTH / 2}px)`;
    playerCard.style.top = `calc(50% + ${y}px - ${UI_CONSTANTS.PLAYER_CARD_HEIGHT / 2}px)`;
    playerCard.style.width = `${UI_CONSTANTS.PLAYER_CARD_WIDTH}px`;
    playerCard.style.height = `${UI_CONSTANTS.PLAYER_CARD_HEIGHT}px`;

    // 플레이어 정보 추가
    playerCard.innerHTML = `
      <div class="player-info">
        <div class="player-header">
          <span class="player-name">Player ${index + 1}</span>
          <span class="player-position">${position}</span>
        </div>
        <div class="player-chips">
          <span class="chip-count">1500</span>
          <span class="chip-label">chips</span>
        </div>
        <div class="player-cards">
          <!-- 카드가 여기에 표시됩니다 -->
        </div>
      </div>
    `;

    playerCard.dataset.position = position;
    playerCard.dataset.playerIndex = index;

    container.appendChild(playerCard);
  });
}

/**
 * 컨트롤 패널 초기화
 */
function initializeControlPanel() {
  // ICM 정보 패널
  const icmPanel = document.getElementById('icm-panel');
  const icmCard = Card.create({
    title: 'ICM Equity',
    className: 'icm-info-card',
  });

  icmCard.innerHTML = `
    <div class="icm-content">
      <div class="icm-header">
        <h3>Tournament Equity</h3>
      </div>
      <div class="icm-values">
        <div class="icm-item">
          <span class="icm-label">Your Equity:</span>
          <span class="icm-value">16.67%</span>
        </div>
        <div class="icm-item">
          <span class="icm-label">Prize Pool:</span>
          <span class="icm-value">$600</span>
        </div>
      </div>
      <div class="payouts">
        <h4>Payouts</h4>
        <div class="payout-list">
          <div class="payout-item">
            <span class="place">1st:</span>
            <span class="amount">$300 (50%)</span>
          </div>
          <div class="payout-item">
            <span class="place">2nd:</span>
            <span class="amount">$180 (30%)</span>
          </div>
          <div class="payout-item">
            <span class="place">3rd:</span>
            <span class="amount">$120 (20%)</span>
          </div>
        </div>
      </div>
    </div>
  `;

  icmPanel.appendChild(icmCard);

  // 액션 컨트롤
  const actionControls = document.getElementById('action-controls');
  const controlCard = Card.create({
    title: 'Actions',
    className: 'action-control-card',
  });

  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'action-buttons';

  // 액션 버튼들
  const foldBtn = Button.create({
    text: 'FOLD',
    variant: 'danger',
    size: 'lg',
    onClick: () => handleAction('fold'),
  });

  const callBtn = Button.create({
    text: 'CALL',
    variant: 'secondary',
    size: 'lg',
    onClick: () => handleAction('call'),
  });

  const raiseBtn = Button.create({
    text: 'RAISE',
    variant: 'primary',
    size: 'lg',
    onClick: () => handleAction('raise'),
  });

  const allInBtn = Button.create({
    text: 'ALL IN',
    variant: 'primary',
    size: 'lg',
    className: 'all-in-button',
    onClick: () => handleAction('all-in'),
  });

  actionsDiv.appendChild(foldBtn);
  actionsDiv.appendChild(callBtn);
  actionsDiv.appendChild(raiseBtn);
  actionsDiv.appendChild(allInBtn);

  controlCard.appendChild(actionsDiv);

  // Push/Fold 추천 섹션
  const recommendationDiv = document.createElement('div');
  recommendationDiv.className = 'push-fold-recommendation';
  recommendationDiv.innerHTML = `
    <h4>Push/Fold 추천</h4>
    <div class="recommendation-content">
      <div class="recommendation-result">
        <span class="recommendation-label">추천 액션:</span>
        <span class="recommendation-value push">PUSH</span>
      </div>
      <div class="hand-range">
        <span class="range-label">Push 범위:</span>
        <span class="range-value">22+, A2s+, A5o+, K9s+, KTo+</span>
      </div>
    </div>
  `;

  controlCard.appendChild(recommendationDiv);
  actionControls.appendChild(controlCard);
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
  // 설정 버튼
  document.getElementById('settings-btn').addEventListener('click', () => {
    // TODO: 설정 모달 열기
  });

  // 도움말 버튼
  document.getElementById('help-btn').addEventListener('click', () => {
    // TODO: 도움말 모달 열기
  });
}

/**
 * 액션 처리
 * @param {string} action - 액션 타입
 */
function handleAction(action) {
  if (config.debug) {
    console.info(`Action: ${action}`);
  }
  // TODO: 액션 처리 로직 구현
}

export default {
  initializeGameLayout,
};
