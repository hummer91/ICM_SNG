/**
 * 게임 레이아웃 뷰
 * @module ui/views/gameLayout
 */

import { Button, Card, Toast, Modal } from '../../components/index.js';
import { POSITIONS, UI_CONSTANTS } from '../../utils/constants.js';
import config from '../../../config/environment.js';
import {
  evaluateQuizAnswer,
  calculateEVDifference,
  updateQuizStats,
  selectNextScenario,
  applyScenarioToTable,
  getCurrentScenario,
} from '../../scenario.js';

// 전역 변수
let currentExplanationModal = null;
let isExplanationModalBlocked = false;

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

  // 딜러 버튼 제거됨

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
          <span class="chip-bb-main">30.0 BB</span>
          <span class="chip-count-sub">1,500</span>
        </div>
        <div class="player-bet" data-player-index="${index}" style="display: none;">
          <span class="bet-display">0.0 BB</span>
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
  // 시나리오 설명 패널
  const icmPanel = document.getElementById('icm-panel');

  // 시나리오 정보 카드
  const scenarioCard = Card.create({
    title: '시나리오',
    className: 'scenario-info-card',
  });

  scenarioCard.innerHTML = `
    <div class="scenario-content" id="scenario-content">
      <div class="scenario-header">
        <h4 id="scenario-title">시나리오 로딩 중...</h4>
        <div class="scenario-meta">
          <span class="difficulty-badge" id="scenario-difficulty">-</span>
          <span class="scenario-number" id="scenario-number">-/-</span>
        </div>
      </div>
      <div class="scenario-description">
        <p id="scenario-description">시나리오 설명이 여기에 표시됩니다.</p>
      </div>
      <div class="scenario-situation">
        <div class="situation-item">
          <span class="situation-label">포지션:</span>
          <span class="situation-value" id="scenario-position">-</span>
        </div>
        <div class="situation-item">
          <span class="situation-label">핸드:</span>
          <span class="situation-value" id="scenario-hand">--</span>
        </div>
        <div class="situation-item">
          <span class="situation-label">스택:</span>
          <span class="situation-value" id="scenario-stack">- BB</span>
        </div>
        <div class="situation-item">
          <span class="situation-label">액션:</span>
          <span class="situation-value" id="scenario-action">-</span>
        </div>
      </div>
    </div>
  `;

  icmPanel.appendChild(scenarioCard);

  // ICM 정보 패널
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

  // 퀴즈 액션 버튼들 (Push/Fold만)
  const foldBtn = Button.create({
    text: 'FOLD',
    variant: 'danger',
    size: 'lg',
    className: 'quiz-action-btn fold-btn',
  });

  const pushBtn = Button.create({
    text: 'PUSH',
    variant: 'primary',
    size: 'lg',
    className: 'quiz-action-btn push-btn',
  });

  // 이벤트 리스너 직접 추가
  foldBtn.addEventListener('click', () => handleQuizAction('fold'));
  pushBtn.addEventListener('click', () => handleQuizAction('push'));

  actionsDiv.appendChild(foldBtn);
  actionsDiv.appendChild(pushBtn);

  controlCard.appendChild(actionsDiv);

  // 퀴즈 컨트롤 버튼들
  const quizControlDiv = document.createElement('div');
  quizControlDiv.className = 'quiz-control-buttons';

  // 정답 확인 버튼
  const checkAnswerBtn = Button.create({
    text: '정답 확인',
    variant: 'primary',
    size: 'lg',
    className: 'quiz-control-btn disabled',
    disabled: true,
  });
  checkAnswerBtn.id = 'check-answer-btn';
  checkAnswerBtn.addEventListener('click', () => handleCheckAnswer());

  // 새 시나리오 버튼
  const newScenarioBtn = Button.create({
    text: '새 시나리오',
    variant: 'secondary',
    size: 'lg',
    className: 'quiz-control-btn disabled',
    disabled: true,
  });
  newScenarioBtn.id = 'new-scenario-btn';
  newScenarioBtn.addEventListener('click', () => handleNewScenario());

  quizControlDiv.appendChild(checkAnswerBtn);
  quizControlDiv.appendChild(newScenarioBtn);

  controlCard.appendChild(quizControlDiv);
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

  // 플레이어 카드 클릭 이벤트 (퀴즈 모드용)
  document.querySelectorAll('.player-card').forEach((card, index) => {
    card.addEventListener('click', (_e) => {
      // 클릭한 플레이어를 액티브로 설정
      document.querySelectorAll('.player-card').forEach((c) => c.classList.remove('active'));
      card.classList.add('active');

      if (config.debug) {
        console.info(`Player ${index + 1} selected`);
      }
    });
  });

  // 칩 편집 기능 제거됨 (퀴즈 모드에서는 스택이 고정)
}

/**
 * 퀴즈 액션 처리
 * @param {string} action - 액션 타입 ('push' 또는 'fold')
 */
function handleQuizAction(action) {
  if (config.debug) {
    console.info(`Quiz Action: ${action}`);
  }

  // 액션 버튼 상태 업데이트
  document.querySelectorAll('.quiz-action-btn').forEach((btn) => {
    btn.classList.remove('selected');
  });

  const selectedBtn = document.querySelector(`.${action}-btn`);
  if (selectedBtn) {
    selectedBtn.classList.add('selected');
  }

  // 정답 확인 버튼 활성화
  const checkAnswerBtn = document.getElementById('check-answer-btn');
  if (checkAnswerBtn) {
    checkAnswerBtn.disabled = false;
    checkAnswerBtn.classList.remove('disabled');
  }

  // 현재 선택된 액션 저장
  window.currentQuizAction = action;

  if (config.debug) {
    console.info(`Quiz action selected: ${action}`);
  }
}

/**
 * 정답 확인 처리
 */
function handleCheckAnswer() {
  console.log('🔍 handleCheckAnswer() 호출됨'); // 디버깅용
  const userAnswer = window.currentQuizAction;

  if (!userAnswer) {
    console.warn('No action selected');
    return;
  }

  try {
    // 퀴즈 답안 평가
    const result = evaluateQuizAnswer(userAnswer);

    if (result.error) {
      console.error('Quiz evaluation error:', result.error);
      return;
    }

    // EV 차이 계산
    const evDifference = calculateEVDifference(userAnswer);

    // 통계 업데이트
    const stats = updateQuizStats(result.isCorrect);

    // 피드백 표시 (Toast)
    showQuizFeedback(result, evDifference);

    // 정답을 시각적으로 표시
    showCorrectAnswer(result.correctAnswer, result.isCorrect);

    // 해설 팝업 표시
    showExplanationModal(result, evDifference);

    // ICM EV 분석 표시
    console.log('🎯 ICM EV 분석 표시 시작...');
    console.log('📋 result.scenario:', result.scenario);
    console.log('📊 ICM Analysis:', result.scenario?.icmAnalysis);
    displayICMAnalysis(result.scenario.icmAnalysis, result.isCorrect, result.userAnswer);

    // 정답 확인 버튼 비활성화
    const checkAnswerBtn = document.getElementById('check-answer-btn');
    if (checkAnswerBtn) {
      checkAnswerBtn.disabled = true;
      checkAnswerBtn.classList.add('disabled');
    }

    // 새 시나리오 버튼 활성화
    const newScenarioBtn = document.getElementById('new-scenario-btn');
    if (newScenarioBtn) {
      newScenarioBtn.disabled = false;
      newScenarioBtn.classList.remove('disabled');
    }

    if (config.debug) {
      console.info('Quiz result:', result);
      console.info('EV difference:', evDifference);
      console.info('Updated stats:', stats);
    }
  } catch (error) {
    console.error('Error checking answer:', error);
  }
}

/**
 * 해설 모달 표시
 */
function showExplanationModal(result, evDifference) {
  const timestamp = new Date().toISOString();
  console.log('🔥 showExplanationModal() 호출됨!', {
    scenario: result?.scenario?.title,
    isCorrect: result?.isCorrect,
    userAnswer: result?.userAnswer,
    timestamp,
    isBlocked: isExplanationModalBlocked,
    hasCurrentModal: Boolean(currentExplanationModal),
  });

  // 차단된 상태면 무시
  if (isExplanationModalBlocked) {
    console.log('🚫 해설 모달이 차단됨 - 무시');
    console.trace('🚫 차단된 호출의 스택 트레이스:');
    return;
  }

  console.trace('📍 showExplanationModal 호출 스택:');
  const scenario = getCurrentScenario();
  if (!scenario) {
    return;
  }

  const evSign = evDifference > 0 ? '+' : '';
  const evText = `${evSign}${evDifference.toFixed(1)}% EV`;

  const correctActionText = result.correctAnswer === 'push' ? 'All-in' : 'Fold';
  const userActionText = result.userAnswer === 'push' ? 'All-in' : 'Fold';

  const statusEmoji = result.isCorrect ? '✅' : '❌';
  const statusText = result.isCorrect ? '정답' : '오답';

  // 핸드 레인지 정보
  const handRange = scenario.handRange || {};
  const pushRange = handRange.pushRange || '없음';
  const foldRange = handRange.foldRange || '없음';

  // ICM 분석 데이터
  const icmAnalysis = scenario.icmAnalysis || {};
  const pushEV = icmAnalysis.pushEV || 0;
  const foldEV = icmAnalysis.foldEV || 0;
  const heroCurrentEquity = icmAnalysis.equity?.HERO || 0;

  // Current equity 값 설정
  const currentEquity = heroCurrentEquity || 0;

  const modalContent = `
    <div class="explanation-modal-content">
      <div class="explanation-header">
        <div class="result-summary">
          <span class="result-status">${statusEmoji} ${statusText}</span>
          <span class="ev-difference ${evDifference >= 0 ? 'positive' : 'negative'}">${evText}</span>
        </div>
        <div class="action-comparison">
          <div class="user-action">당신의 선택: <strong>${userActionText}</strong></div>
          <div class="correct-action">최적 액션: <strong>${correctActionText}</strong></div>
        </div>
      </div>
      
      <div class="explanation-body">
        <div class="explanation-section">
          <h4>🎯 상황 분석</h4>
          <p>${result.explanation.detailed}</p>
        </div>
        
        <div class="explanation-section">
          <h4>📊 ICM 분석</h4>
          <div class="icm-analysis">
            <div class="equity-info">
              <div>현재 토너먼트 Equity: <strong>${currentEquity.toFixed(1)}%</strong></div>
              <div>All-in 시 EV: <strong>${pushEV.toFixed(1)}</strong></div>
              <div>Fold 시 EV: <strong>${foldEV.toFixed(1)}</strong></div>
            </div>
          </div>
        </div>
        
        <div class="explanation-section">
          <h4>🃏 핸드 레인지</h4>
          <div class="hand-ranges">
            <div class="range-item">
              <span class="range-label">Push 레인지:</span>
              <span class="range-value">${pushRange}</span>
            </div>
            <div class="range-item">
              <span class="range-label">Fold 레인지:</span>
              <span class="range-value">${foldRange}</span>
            </div>
          </div>
        </div>
        
        ${
          scenario.explanation?.strategy
            ? `
        <div class="explanation-section">
          <h4>💡 전략적 고려사항</h4>
          <p>${scenario.explanation.strategy}</p>
        </div>
        `
            : ''
        }
      </div>
    </div>
  `;

  const modal = Modal.create({
    title: '상세 해설',
    content: modalContent,
    size: 'lg',
    footer: [
      {
        text: '확인',
        variant: 'secondary',
        onClick: (e, modalInstance) => modalInstance.close(),
      },
      {
        text: '다음 시나리오',
        variant: 'primary',
        onClick: (e, modalInstance) => {
          modalInstance.close();
          // 다음 시나리오 로드
          handleNewScenario();
        },
      },
    ],
  });

  modal.open();
}

/**
 * 퀴즈 피드백 표시
 */
function showQuizFeedback(result, evDifference) {
  // 즉시 피드백 (Toast)
  const evSign = evDifference > 0 ? '+' : '';
  const evText = `${evSign}${evDifference.toFixed(1)}% EV`;

  if (result.isCorrect) {
    Toast.success(`정답! ${result.explanation.short} (${evText})`);
  } else {
    Toast.error(`틀렸습니다. 정답은 ${result.correctAnswer.toUpperCase()}입니다. (${evText} 손실)`);
  }

  // 상세 해설 버튼 추가
  setTimeout(() => {
    showDetailedExplanation(result, evDifference);
  }, 2000);
}

/**
 * 상세 해설 모달 표시
 */
function showDetailedExplanation(result, _evDifference) {
  const { scenario, explanation, icmAnalysis, handRange } = result;

  // 해설 콘텐츠 생성
  const explanationContent = `
    <div class="quiz-explanation">
      <div class="explanation-header">
        <h3>${scenario.title}</h3>
        <div class="result-badge ${result.isCorrect ? 'correct' : 'incorrect'}">
          ${result.isCorrect ? '정답' : '오답'}: ${result.correctAnswer.toUpperCase()}
        </div>
      </div>
      
      <div class="explanation-content">
        <div class="explanation-section">
          <h4>상황 분석</h4>
          <p>${explanation.detailed}</p>
        </div>
        
        <div class="explanation-section">
          <h4>ICM 분석</h4>
          <div class="icm-comparison">
            <div class="ev-comparison">
              <div class="ev-item">
                <span class="ev-label">PUSH EV:</span>
                <span class="ev-value">${icmAnalysis.pushEV.toFixed(1)}%</span>
              </div>
              <div class="ev-item">
                <span class="ev-label">FOLD EV:</span>
                <span class="ev-value">${icmAnalysis.foldEV.toFixed(1)}%</span>
              </div>
              <div class="ev-item ev-difference">
                <span class="ev-label">차이:</span>
                <span class="ev-value ${icmAnalysis.difference > 0 ? 'positive' : 'negative'}">
                  ${icmAnalysis.difference > 0 ? '+' : ''}${icmAnalysis.difference.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="explanation-section">
          <h4>핸드 범위</h4>
          <div class="hand-ranges">
            <div class="range-item">
              <span class="range-label">Push 범위:</span>
              <span class="range-value">${handRange.pushRange}</span>
            </div>
            <div class="range-item">
              <span class="range-label">Fold 범위:</span>
              <span class="range-value">${handRange.foldRange}</span>
            </div>
          </div>
        </div>
        
        <div class="explanation-section">
          <h4>현재 상황</h4>
          <div class="situation-summary">
            <p><strong>포지션:</strong> ${scenario.situation.heroPosition}</p>
            <p><strong>핸드:</strong> ${scenario.situation.heroCards}</p>
            <p><strong>스택 크기:</strong> ${scenario.situation.remainingStacks.HERO} (${(scenario.situation.remainingStacks.HERO / scenario.situation.blindLevel.big).toFixed(1)} BB)</p>
          </div>
        </div>
      </div>
    </div>
  `;

  // 기존 모달이 있으면 먼저 닫기
  if (currentExplanationModal && currentExplanationModal.isOpen) {
    currentExplanationModal.close();
  }

  // 모달 생성 및 표시
  currentExplanationModal = Modal.create({
    title: '상세 해설',
    content: explanationContent,
    size: 'large',
    footer: [
      {
        text: '다음 시나리오',
        variant: 'primary',
        onClick: (e, modal) => {
          modal.close();
          currentExplanationModal = null; // 참조 제거
          handleNewScenario();
        },
      },
      {
        text: '닫기',
        variant: 'secondary',
        onClick: (e, modal) => {
          modal.close();
          currentExplanationModal = null; // 참조 제거
        },
      },
    ],
  });

  // 차단 상태 재확인 (비동기 호출 대비)
  if (isExplanationModalBlocked) {
    console.log('🚫 모달 열기 직전 차단 감지 - 무시');
    return;
  }

  currentExplanationModal.open();
  console.log('📖 해설 모달 열림. isOpen:', currentExplanationModal.isOpen);
}

/**
 * 정답을 시각적으로 표시
 */
function showCorrectAnswer(correctAnswer, isCorrect) {
  console.log('🎯 showCorrectAnswer called:', {
    correctAnswer,
    isCorrect,
    currentAction: window.currentQuizAction,
  });

  // 모든 액션 버튼의 정답 표시 상태 제거
  document.querySelectorAll('.quiz-action-btn').forEach((btn) => {
    btn.classList.remove('correct-answer', 'wrong-answer');
    console.log('🧹 Removed answer classes from button:', btn.className);
  });

  // 정답 버튼에 정답 표시
  const correctBtn = document.querySelector(`.${correctAnswer.toLowerCase()}-btn`);
  console.log(
    '✅ Correct button found:',
    correctBtn,
    'selector:',
    `.${correctAnswer.toLowerCase()}-btn`,
  );

  if (correctBtn) {
    correctBtn.classList.add('correct-answer');
    console.log('✅ Added correct-answer class. Button classes now:', correctBtn.className);

    // 정답 아이콘 추가
    const existingIcon = correctBtn.querySelector('.answer-icon');
    if (!existingIcon) {
      const answerIcon = document.createElement('span');
      answerIcon.className = 'answer-icon correct-icon';
      answerIcon.innerHTML = '✓';
      correctBtn.appendChild(answerIcon);
      console.log('✅ Added correct icon to button');
    }
  }

  // 사용자가 선택한 답이 틀렸다면 틀린 답도 표시
  if (!isCorrect && window.currentQuizAction) {
    const userBtn = document.querySelector(`.${window.currentQuizAction.toLowerCase()}-btn`);
    console.log(
      '❌ User button found:',
      userBtn,
      'selector:',
      `.${window.currentQuizAction.toLowerCase()}-btn`,
    );

    if (userBtn && userBtn !== correctBtn) {
      userBtn.classList.add('wrong-answer');
      console.log('❌ Added wrong-answer class. Button classes now:', userBtn.className);

      // 틀린 답 아이콘 추가
      const existingIcon = userBtn.querySelector('.answer-icon');
      if (!existingIcon) {
        const answerIcon = document.createElement('span');
        answerIcon.className = 'answer-icon wrong-icon';
        answerIcon.innerHTML = '✗';
        userBtn.appendChild(answerIcon);
        console.log('❌ Added wrong icon to button');
      }
    }
  }

  // 3초 후 상세 해설 표시 (기존 로직 조정)
  if (config.debug) {
    console.info(
      `Correct answer displayed: ${correctAnswer}, user was ${isCorrect ? 'correct' : 'wrong'}`,
    );
  }
}

/**
 * ICM EV 분석 표시
 */
function displayICMAnalysis(icmAnalysis, isCorrect, userAnswer) {
  console.log('🚀 displayICMAnalysis 함수 호출됨!');
  console.log('📊 파라미터:', { icmAnalysis, isCorrect, userAnswer });

  if (!icmAnalysis) {
    console.log('❌ ICM 분석 데이터가 없습니다:', icmAnalysis);
    return;
  }

  console.log('✅ ICM 분석 데이터 있음, 계속 진행...');

  // ICM 분석 패널 찾기 또는 생성
  let icmPanel = document.querySelector('.icm-analysis-panel');
  if (!icmPanel) {
    icmPanel = document.createElement('div');
    icmPanel.className = 'icm-analysis-panel';

    // 컨트롤 섹션에 안전하게 추가
    const controlSection = document.querySelector('.control-section');

    if (controlSection) {
      // 컨트롤 섹션의 맨 앞에 추가
      controlSection.insertBefore(icmPanel, controlSection.firstChild);
      console.log('✅ ICM 패널이 컨트롤 섹션 맨 앞에 추가됨');
    } else {
      // 대안: 게임 컨테이너에 추가
      const gameContainer = document.querySelector('.game-container');
      if (gameContainer) {
        gameContainer.appendChild(icmPanel);
        console.log('⚠️ ICM 패널을 게임 컨테이너에 추가함');
      } else {
        // 최후 수단: body에 추가
        document.body.appendChild(icmPanel);
        console.log('⚠️ ICM 패널을 body에 추가함');
      }
    }
  }

  // Push EV와 Fold EV 정보
  const { pushEV } = icmAnalysis;
  const { foldEV } = icmAnalysis;
  const { difference } = icmAnalysis;
  const isPositive = difference > 0;

  // EV 값들은 화면에 직접 사용

  // EV 차이 색상
  const evColor = isPositive ? '#10b981' : '#ef4444';
  const userChoiceColor = isCorrect ? '#10b981' : '#ef4444';

  icmPanel.innerHTML = `
    <div class="card icm-analysis-card">
      <div class="card-content">
        <h4>📊 ICM EV 분석</h4>
        
        <div class="ev-comparison">
          <div class="ev-option ${userAnswer.toLowerCase() === 'push' ? 'user-choice' : ''}">
            <div class="ev-label">
              <span class="action-text">PUSH</span>
              ${userAnswer.toLowerCase() === 'push' ? '<span class="choice-indicator">← 당신의 선택</span>' : ''}
            </div>
            <div class="ev-value" style="color: ${userAnswer.toLowerCase() === 'push' ? userChoiceColor : '#6b7280'}">
              ${pushEV.toFixed(1)}
            </div>
          </div>
          
          <div class="vs-divider">VS</div>
          
          <div class="ev-option ${userAnswer.toLowerCase() === 'fold' ? 'user-choice' : ''}">
            <div class="ev-label">
              <span class="action-text">FOLD</span>
              ${userAnswer.toLowerCase() === 'fold' ? '<span class="choice-indicator">← 당신의 선택</span>' : ''}
            </div>
            <div class="ev-value" style="color: ${userAnswer.toLowerCase() === 'fold' ? userChoiceColor : '#6b7280'}">
              ${foldEV.toFixed(1)}
            </div>
          </div>
        </div>
        
        <div class="ev-difference">
          <div class="difference-label">EV 차이</div>
          <div class="difference-value" style="color: ${evColor}">
            ${isPositive ? '+' : ''}${Math.abs(difference).toFixed(1)}
            <span class="difference-explanation">
              ${isCorrect ? '✅ 올바른 결정!' : '❌ 잘못된 결정'}
            </span>
          </div>
        </div>
        
        <div class="ev-explanation">
          <p class="explanation-text">
            ${
              isCorrect
                ? `훌륭합니다! 최적의 선택으로 <strong>+${Math.abs(difference).toFixed(1)}EV</strong>를 얻었습니다.`
                : `아쉽습니다. 더 나은 선택이 있었습니다. <strong>-${Math.abs(difference).toFixed(1)}EV</strong> 손실입니다.`
            }
          </p>
        </div>
      </div>
    </div>
    
    <div class="card explanation-card" style="margin-top: var(--spacing-4);">
      <div class="card-content">
        <h4>💡 해설</h4>
        <div class="detailed-explanation">
          <p class="explanation-detailed">${getCurrentScenario()?.explanation?.detailed || '상세 해설이 없습니다.'}</p>
        </div>
        
        <div class="hand-ranges" style="margin-top: var(--spacing-4);">
          <h5>📋 핸드 범위</h5>
          <div class="range-info">
            <div class="push-range">
              <strong>푸시 범위:</strong> ${getCurrentScenario()?.handRange?.pushRange || 'N/A'}
            </div>
            <div class="fold-range" style="margin-top: var(--spacing-2);">
              <strong>폴드 범위:</strong> ${getCurrentScenario()?.handRange?.foldRange || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // 애니메이션 효과
  icmPanel.style.opacity = '0';
  icmPanel.style.transform = 'translateY(20px)';

  requestAnimationFrame(() => {
    icmPanel.style.transition = 'all 0.5s ease-out';
    icmPanel.style.opacity = '1';
    icmPanel.style.transform = 'translateY(0)';
  });

  if (config.debug) {
    console.info('ICM analysis displayed:', { pushEV, foldEV, difference, isCorrect });
  }
}

/**
 * 새 시나리오 로딩
 */
function handleNewScenario() {
  try {
    console.log('🆕 handleNewScenario() 호출됨');

    // 다음 시나리오 선택
    const nextScenario = selectNextScenario();

    if (nextScenario) {
      // 테이블에 적용
      applyScenarioToTable(nextScenario);

      // UI 상태 초기화
      resetQuizUI();

      Toast.info(`새 시나리오: ${nextScenario.title}`);

      if (config.debug) {
        console.info('New scenario loaded:', nextScenario.title);
      }
    } else {
      Toast.error('시나리오를 로딩할 수 없습니다.');
    }
  } catch (error) {
    console.error('Error loading new scenario:', error);
    Toast.error('새 시나리오 로딩 중 오류가 발생했습니다.');
  }
}

/**
 * 퀴즈 UI 상태 초기화
 */
function resetQuizUI() {
  console.log('🔄 resetQuizUI() 호출됨'); // 디버깅용

  // 해설 모달 차단 설정 (새 시나리오 로딩 중)
  isExplanationModalBlocked = true;
  console.log('🚧 해설 모달 차단 활성화');

  // 혹시 모를 비동기 호출 차단을 위해 전역 참조 임시 제거
  currentExplanationModal = null;
  console.log('🔒 전역 모달 참조 임시 제거');

  // 액션 버튼 선택 해제 및 정답 표시 제거
  document.querySelectorAll('.quiz-action-btn').forEach((btn) => {
    btn.classList.remove('selected', 'correct-answer', 'wrong-answer');

    // 정답/틀린답 아이콘 제거
    const answerIcon = btn.querySelector('.answer-icon');
    if (answerIcon) {
      answerIcon.remove();
    }
  });

  // 정답 확인 버튼 비활성화
  const checkAnswerBtn = document.getElementById('check-answer-btn');
  if (checkAnswerBtn) {
    checkAnswerBtn.disabled = true;
    checkAnswerBtn.classList.add('disabled');
    console.log('✅ 정답 확인 버튼 비활성화됨');
  }

  // 새 시나리오 버튼 비활성화
  const newScenarioBtn = document.getElementById('new-scenario-btn');
  if (newScenarioBtn) {
    newScenarioBtn.disabled = true;
    newScenarioBtn.classList.add('disabled');
    console.log('✅ 새 시나리오 버튼 비활성화됨');
  }

  // ICM 분석 패널 내용 초기화 (제거 대신 내용만 지우기)
  const icmPanel = document.querySelector('.icm-analysis-panel');
  if (icmPanel) {
    icmPanel.innerHTML = '';
    icmPanel.style.display = 'none';
    console.log('✅ ICM 패널 초기화됨');
  }

  // 모든 정답 관련 클래스 제거
  document.querySelectorAll('.quiz-controls button').forEach((btn) => {
    btn.classList.remove('quiz-answered');
  });

  // 해설 모달 닫기
  console.log('🔍 모달 체크:', {
    hasModal: Boolean(currentExplanationModal),
    isOpen: currentExplanationModal?.isOpen,
  });

  if (currentExplanationModal) {
    console.log('🚫 해설 모달 강제 종료 시도');
    currentExplanationModal.close();
    currentExplanationModal = null;
    console.log('✅ 해설 모달 참조 제거됨');
  }

  // DOM에서 모든 모달 오버레이 강제 제거
  const modalOverlays = document.querySelectorAll('.modal-overlay');
  modalOverlays.forEach((overlay, index) => {
    console.log(`🗑️ 모달 오버레이 ${index + 1} 강제 제거`);
    overlay.remove();
  });

  // Modal 컨텐츠도 강제 제거 (혹시 남아있을 수 있음)
  const modalContents = document.querySelectorAll('.modal-content');
  modalContents.forEach((content, index) => {
    console.log(`🗑️ 모달 컨텐츠 ${index + 1} 강제 제거`);
    content.remove();
  });

  // body 스크롤 복원 (모달이 제거되었으므로)
  document.body.style.overflow = '';
  console.log('🔄 body 스크롤 복원');

  console.log('🧹 모든 모달 DOM 정리 완료');

  // 현재 선택된 액션 초기화
  window.currentQuizAction = null;

  console.log('🎯 퀴즈 UI 초기화 완료');

  // 잠시 후 해설 모달 차단 해제 (새 시나리오 로딩 완료)
  setTimeout(() => {
    isExplanationModalBlocked = false;
    console.log('✅ 해설 모달 차단 해제');
  }, 500);
}

/**
 * 수트 심볼 반환 (유틸리티 함수)
 */
// getSuitSymbol function removed - not used

/**
 * 딜러 버튼 기능 제거됨 - 퀴즈 모드에서는 필요 없음
 */
function updateDealerButton(_playerIndex) {
  // 딜러 버튼 기능이 제거되었습니다
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

  const chipCountSub = playerCard.querySelector('.chip-count-sub');
  const chipBBMain = playerCard.querySelector('.chip-bb-main');

  if (chipCountSub) {
    chipCountSub.textContent = chips.toLocaleString();
  }

  if (chipBBMain) {
    const bbAmount = (chips / useBigBlind).toFixed(1);
    chipBBMain.textContent = `${bbAmount} BB`;
  }

  // 플레이어 카드에 현재 칩 수 저장
  playerCard.dataset.chips = chips;
}

// 칩 편집 기능 제거됨 - 퀴즈 모드에서는 시나리오별 고정 스택 사용

// enableChipEditing 함수 제거됨 - 퀴즈 모드에서는 편집 불가

// saveChipValue 함수 제거됨 - 퀴즈 모드에서는 시나리오별 고정값 사용

// cancelChipEditing 함수 제거됨 - 퀴즈 모드에서는 편집 취소 불필요

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

  // 딜러 버튼 제거됨
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
      // 딜러 버튼 제거됨
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
    const chipCountSub = chipElement.querySelector('.chip-count-sub');
    const chips = parseInt(chipCountSub.textContent.replace(/,/g, ''), 10) || 0;
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

  // 딜러 버튼 제거됨
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
window.handleCheckAnswer = handleCheckAnswer;
window.handleNewScenario = handleNewScenario;
window.handleQuizAction = handleQuizAction;
window.displayICMAnalysis = displayICMAnalysis;

// 디버깅용 테스트 함수
window.testICMDisplay = function () {
  console.log('🧪 ICM 표시 테스트 실행...');
  const mockData = {
    pushEV: 156.2,
    foldEV: 148.7,
    difference: 7.5,
  };
  displayICMAnalysis(mockData, true, 'push');
};

export default {
  initializeGameLayout,
  updateDealerButton,
  updatePlayerState,
  updatePlayerChips,
  updateBigBlind,
  getCurrentBigBlind,
  setAllPlayerChips,
};
