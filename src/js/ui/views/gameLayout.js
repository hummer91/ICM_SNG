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
          <span class="app-subtitle">• 6-Max Push/Fold Strategy</span>
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

  // 윈도우 리사이즈 이벤트 리스너
  window.addEventListener('resize', debounce(updatePlayerPositionsOnResize, 250));

  // 딜러 버튼 초기 위치 설정
  updateDealerButton(0);

  // 게임 상태 초기화
  initializeGameState();

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
    // 원형 테이블 바깥쪽에 위치 계산
    const angle = (index * 60 - 90) * (Math.PI / 180); // 60도 간격, -90도 시작
    // 반응형 반지름 계산 - 테이블 밖에 배치
    const baseRadius = UI_CONSTANTS.TABLE_RADIUS;
    const containerSize = Math.min(window.innerWidth * 0.4, window.innerHeight * 0.6, 700);
    const tableRadius = Math.min(baseRadius, containerSize * 0.35);
    // 플레이어 카드를 테이블 바깥쪽에 배치 (테이블 반지름 + 카드 높이/2 + 여백)
    const playerRadius = tableRadius + UI_CONSTANTS.PLAYER_CARD_HEIGHT / 2 + 20;
    const x = Math.cos(angle) * playerRadius;
    const y = Math.sin(angle) * playerRadius;

    // 플레이어 카드를 직접 생성 (Card 컴포넌트 대신)
    const playerCard = document.createElement('div');
    playerCard.className = 'card player-card';

    // 위치 설정
    playerCard.style.position = 'absolute';
    playerCard.style.left = `calc(50% + ${x}px - ${UI_CONSTANTS.PLAYER_CARD_WIDTH / 2}px)`;
    playerCard.style.top = `calc(50% + ${y}px - ${UI_CONSTANTS.PLAYER_CARD_HEIGHT / 2}px)`;
    playerCard.style.width = `${UI_CONSTANTS.PLAYER_CARD_WIDTH}px`;
    playerCard.style.height = `${UI_CONSTANTS.PLAYER_CARD_HEIGHT}px`;

    // 플레이어 정보 추가 (Linear 스타일)
    playerCard.innerHTML = `
      <span class="player-name">Player ${index + 1}</span>
      <span class="player-position">${position}</span>
      <div class="player-info">
        <div class="player-chips" data-player-index="${index}">
          <div class="chip-stack">
            <span class="chip-count" contenteditable="false">1,500</span>
            <span class="chip-bb">30.0 BB</span>
          </div>
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
    if (config.debug) {
      console.info('Settings button clicked');
    }
  });

  // 도움말 버튼
  document.getElementById('help-btn').addEventListener('click', () => {
    // TODO: 도움말 모달 열기
    if (config.debug) {
      console.info('Help button clicked');
    }
  });

  // 플레이어 카드 클릭 이벤트 (데모용)
  document.querySelectorAll('.player-card').forEach((card, index) => {
    card.addEventListener('click', (e) => {
      // 칩 영역 클릭이면 편집 모드로 전환하지 않음
      if (e.target.closest('.player-chips')) {
        return;
      }

      // 클릭한 플레이어를 액티브로 설정
      document.querySelectorAll('.player-card').forEach((c) => c.classList.remove('active'));
      card.classList.add('active');

      if (config.debug) {
        console.info(`Player ${index + 1} selected`);
      }
    });
  });

  // 칩 편집 이벤트 설정
  setupChipEditingEvents();
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

/**
 * 딜러 버튼 위치 업데이트
 * @param {number} playerIndex - 딜러 플레이어 인덱스
 */
function updateDealerButton(playerIndex) {
  const dealerButton = document.getElementById('dealer-button');
  // const positions = Object.values(POSITIONS); // Currently unused

  if (!dealerButton) {
    return;
  }

  // 플레이어 인덱스 저장
  dealerButton.dataset.playerIndex = playerIndex;

  // 딜러 버튼 애니메이션 추가
  dealerButton.classList.add('moving');
  setTimeout(() => {
    dealerButton.classList.remove('moving');
  }, 1000);

  // 원형 테이블에서의 위치 계산 (플레이어 카드 근처)
  const angle = (playerIndex * 60 - 90) * (Math.PI / 180);
  // 반응형 반지름 계산
  const baseRadius = UI_CONSTANTS.TABLE_RADIUS;
  const containerSize = Math.min(window.innerWidth * 0.4, window.innerHeight * 0.6, 700);
  const responsiveRadius = Math.min(baseRadius, containerSize * 0.35);
  const radius = responsiveRadius - 50; // 플레이어 카드보다 안쪽
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  dealerButton.style.left = `calc(50% + ${x}px - 24px)`;
  dealerButton.style.top = `calc(50% + ${y}px - 24px)`;
}

/**
 * 플레이어 상태 업데이트
 * @param {number} playerIndex - 플레이어 인덱스
 * @param {string} state - 플레이어 상태 (active, folded, all-in)
 */
function updatePlayerState(playerIndex, state) {
  const playerCard = document.querySelector(`[data-player-index="${playerIndex}"]`);
  if (!playerCard) {
    return;
  }

  // 모든 상태 클래스 제거
  playerCard.classList.remove('active', 'folded', 'all-in');

  // 새 상태 추가
  if (state) {
    playerCard.classList.add(state);
  }
}

/**
 * 칩 스택 업데이트
 * @param {number} playerIndex - 플레이어 인덱스
 * @param {number} chips - 칩 수량
 * @param {number} bigBlind - 빅 블라인드 크기 (옵션, 기본값은 현재 빅 블라인드)
 */
function updatePlayerChips(playerIndex, chips, bigBlind = null) {
  const playerCard = document.querySelector(`[data-player-index="${playerIndex}"]`);
  if (!playerCard) {
    return;
  }

  // 빅 블라인드가 제공되지 않으면 전역 값 사용
  const useBigBlind = bigBlind !== null ? bigBlind : currentBigBlind;

  const chipCount = playerCard.querySelector('.chip-count');
  const chipBB = playerCard.querySelector('.chip-bb');

  if (chipCount) {
    chipCount.textContent = chips.toLocaleString();
  }

  if (chipBB) {
    const bbAmount = (chips / useBigBlind).toFixed(1);
    chipBB.textContent = `${bbAmount} BB`;
  }

  // 플레이어 카드에 현재 칩 수 저장
  playerCard.dataset.chips = chips;
}

/**
 * 칩 편집 이벤트 설정
 */
function setupChipEditingEvents() {
  document.querySelectorAll('.player-chips').forEach((chipElement) => {
    const chipCount = chipElement.querySelector('.chip-count');

    // 더블클릭으로 편집 모드 진입
    chipElement.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      enableChipEditing(chipCount);
    });

    // 칩 수량 클릭
    chipCount.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });
}

/**
 * 칩 편집 모드 활성화
 * @param {HTMLElement} chipCountElement - 칩 수량 요소
 */
function enableChipEditing(chipCountElement) {
  const currentValue = chipCountElement.textContent.replace(/,/g, '');
  const { playerIndex } = chipCountElement.closest('.player-chips').dataset;

  // 편집 모드로 전환
  chipCountElement.contentEditable = 'true';
  chipCountElement.classList.add('editing');
  chipCountElement.textContent = currentValue;

  // 텍스트 선택
  chipCountElement.focus();
  chipCountElement.select();

  // Enter 키로 저장
  chipCountElement.addEventListener('keydown', function onKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveChipValue(chipCountElement, playerIndex);
      chipCountElement.removeEventListener('keydown', onKeyDown);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelChipEditing(chipCountElement);
      chipCountElement.removeEventListener('keydown', onKeyDown);
    }
  });

  // 포커스 잃으면 저장
  chipCountElement.addEventListener('blur', function onBlur() {
    saveChipValue(chipCountElement, playerIndex);
    chipCountElement.removeEventListener('blur', onBlur);
  });

  // 숫자만 입력 허용
  chipCountElement.addEventListener('input', (e) => {
    const value = e.target.textContent.replace(/[^0-9]/g, '');
    if (value !== e.target.textContent) {
      e.target.textContent = value;
      // 커서를 끝으로 이동
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(e.target);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  });
}

/**
 * 칩 값 저장
 * @param {HTMLElement} chipCountElement - 칩 수량 요소
 * @param {number} playerIndex - 플레이어 인덱스
 */
function saveChipValue(chipCountElement, playerIndex) {
  const newValue = parseInt(chipCountElement.textContent.replace(/[^0-9]/g, ''), 10) || 0;

  // 편집 모드 해제
  chipCountElement.contentEditable = 'false';
  chipCountElement.classList.remove('editing');

  // 값 업데이트
  updatePlayerChips(playerIndex, newValue);

  if (config.debug) {
    console.info(`Player ${parseInt(playerIndex, 10) + 1} chips updated to ${newValue}`);
  }
}

/**
 * 칩 편집 취소
 * @param {HTMLElement} chipCountElement - 칩 수량 요소
 */
function cancelChipEditing(chipCountElement) {
  const { playerIndex } = chipCountElement.closest('.player-chips').dataset;
  const playerCard = document.querySelector(`[data-player-index="${playerIndex}"]`);
  const currentChips = playerCard.dataset.chips || '1500';

  chipCountElement.contentEditable = 'false';
  chipCountElement.classList.remove('editing');
  chipCountElement.textContent = parseInt(currentChips, 10).toLocaleString();
}

/**
 * 게임 상태 초기화
 */
function initializeGameState() {
  // 첫 번째 플레이어를 액티브로 설정
  updatePlayerState(0, 'active');

  // 데모용 플레이어 칩 업데이트
  const playerChips = [1500, 1200, 800, 2000, 1100, 900];
  playerChips.forEach((chips, index) => {
    updatePlayerChips(index, chips);
  });

  // 딜러 버튼을 랜덤 위치에 설정
  const randomDealer = Math.floor(Math.random() * 6);
  updateDealerButton(randomDealer);
}

/**
 * 게임 애니메이션 데모
 */
function demoGameAnimation() {
  let currentPlayer = 0;

  setInterval(() => {
    // 이전 플레이어 비활성화
    updatePlayerState(currentPlayer, null);

    // 다음 플레이어로 이동
    currentPlayer = (currentPlayer + 1) % 6;
    updatePlayerState(currentPlayer, 'active');

    // 가끔 딜러 버튼 이동
    if (Math.random() < 0.2) {
      const newDealer = Math.floor(Math.random() * 6);
      updateDealerButton(newDealer);
    }
  }, 3000);
}

// 전역 게임 상태
let currentBigBlind = 50;

/**
 * 빅 블라인드 값 업데이트
 * @param {number} newBigBlind - 새로운 빅 블라인드 값
 */
function updateBigBlind(newBigBlind) {
  currentBigBlind = newBigBlind;

  // 모든 플레이어의 BB 표시 업데이트
  document.querySelectorAll('.player-chips').forEach((chipElement, index) => {
    const chipCount = chipElement.querySelector('.chip-count');
    const chips = parseInt(chipCount.textContent.replace(/,/g, ''), 10) || 0;
    updatePlayerChips(index, chips, currentBigBlind);
  });

  if (config.debug) {
    console.info(`Big blind updated to ${newBigBlind}`);
  }
}

/**
 * 현재 빅 블라인드 값 가져오기
 */
function getCurrentBigBlind() {
  return currentBigBlind;
}

/**
 * 모든 플레이어 칩을 한번에 설정
 * @param {number[]} chipsArray - 각 플레이어의 칩 배열
 */
function setAllPlayerChips(chipsArray) {
  chipsArray.forEach((chips, index) => {
    updatePlayerChips(index, chips, currentBigBlind);
  });
}

/**
 * 윈도우 리사이즈 시 플레이어 위치 업데이트
 */
function updatePlayerPositionsOnResize() {
  const positions = Object.values(POSITIONS);
  const baseRadius = UI_CONSTANTS.TABLE_RADIUS;
  const containerSize = Math.min(window.innerWidth * 0.4, window.innerHeight * 0.6, 700);
  const tableRadius = Math.min(baseRadius, containerSize * 0.35);

  positions.forEach((position, index) => {
    const angle = (index * 60 - 90) * (Math.PI / 180);
    // 플레이어 카드를 테이블 바깥쪽에 배치
    const playerRadius = tableRadius + UI_CONSTANTS.PLAYER_CARD_HEIGHT / 2 + 20;
    const x = Math.cos(angle) * playerRadius;
    const y = Math.sin(angle) * playerRadius;

    const playerCard = document.querySelector(`[data-player-index="${index}"]`);
    if (playerCard) {
      playerCard.style.left = `calc(50% + ${x}px - ${UI_CONSTANTS.PLAYER_CARD_WIDTH / 2}px)`;
      playerCard.style.top = `calc(50% + ${y}px - ${UI_CONSTANTS.PLAYER_CARD_HEIGHT / 2}px)`;
    }
  });

  // 딜러 버튼 위치도 업데이트
  const dealerButton = document.getElementById('dealer-button');
  if (dealerButton && dealerButton.dataset.playerIndex) {
    const dealerIndex = parseInt(dealerButton.dataset.playerIndex, 10);
    updateDealerButton(dealerIndex);
  }
}

/**
 * 디바운스 유틸리티 함수
 * @param {Function} func - 실행할 함수
 * @param {number} wait - 대기 시간 (ms)
 * @returns {Function} 디바운스된 함수
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 게임 컨트롤 함수들을 전역으로 노출
window.updateDealerButton = updateDealerButton;
window.updatePlayerState = updatePlayerState;
window.updatePlayerChips = updatePlayerChips;
window.updateBigBlind = updateBigBlind;
window.getCurrentBigBlind = getCurrentBigBlind;
window.setAllPlayerChips = setAllPlayerChips;
window.demoGameAnimation = demoGameAnimation;

export default {
  initializeGameLayout,
  updateDealerButton,
  updatePlayerState,
  updatePlayerChips,
  updateBigBlind,
  getCurrentBigBlind,
  setAllPlayerChips,
};
