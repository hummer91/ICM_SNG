/**
 * 시나리오 관리 시스템
 * @module scenario
 */

import config from '../config/environment.js';

// 현재 시나리오 상태
let currentScenarioIndex = 0;
let scenarios = [];
let currentScenario = null;

/**
 * 시나리오 데이터 로딩
 */
export async function loadScenarios() {
  try {
    const response = await fetch('/src/data/scenarios.json');
    if (!response.ok) {
      throw new Error(`Failed to load scenarios: ${response.status}`);
    }

    const data = await response.json();
    scenarios = data.scenarios;

    if (config.debug) {
      console.info(`Loaded ${scenarios.length} scenarios`);
    }

    return scenarios;
  } catch (error) {
    console.error('Error loading scenarios:', error);
    // 기본 시나리오 사용
    scenarios = getDefaultScenario();
    return scenarios;
  }
}

/**
 * 기본 시나리오 (로딩 실패시 사용)
 */
function getDefaultScenario() {
  return [
    {
      id: 'default_001',
      title: '기본 시나리오',
      description: '데모용 기본 시나리오입니다.',
      difficulty: 'beginner',
      situation: {
        yourPosition: 'BTN',
        yourCards: {
          card1: { rank: 'A', suit: 'h' },
          card2: { rank: 'K', suit: 's' },
        },
        stacks: {
          UTG: 1000,
          MP: 1200,
          CO: 1500,
          BTN: 1500,
          SB: 800,
          BB: 1100,
        },
        positions: ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'],
        actions: [],
      },
      correctAnswer: 'push',
      explanation: {
        short: 'AKs는 강력한 푸시 핸드입니다.',
        detailed: '상세한 설명이 여기에 표시됩니다.',
      },
    },
  ];
}

/**
 * 현재 시나리오 가져오기
 */
export function getCurrentScenario() {
  return currentScenario;
}

/**
 * 시나리오 인덱스로 시나리오 선택
 */
export function selectScenario(index) {
  if (index >= 0 && index < scenarios.length) {
    currentScenarioIndex = index;
    currentScenario = scenarios[index];

    if (config.debug) {
      console.info(`Selected scenario ${index + 1}: ${currentScenario.title}`);
    }

    return currentScenario;
  }
  return null;
}

/**
 * 다음 시나리오 선택 (순환)
 */
export function selectNextScenario() {
  const nextIndex = (currentScenarioIndex + 1) % scenarios.length;
  return selectScenario(nextIndex);
}

/**
 * 이전 시나리오 선택 (순환)
 */
export function selectPreviousScenario() {
  const prevIndex = currentScenarioIndex === 0 ? scenarios.length - 1 : currentScenarioIndex - 1;
  return selectScenario(prevIndex);
}

/**
 * 랜덤 시나리오 선택
 */
export function selectRandomScenario() {
  const randomIndex = Math.floor(Math.random() * scenarios.length);
  return selectScenario(randomIndex);
}

/**
 * 난이도별 시나리오 필터링
 */
export function getScenariosByDifficulty(difficulty) {
  return scenarios.filter((scenario) => scenario.difficulty === difficulty);
}

/**
 * 시나리오를 테이블에 적용
 */
export function applyScenarioToTable(scenario) {
  if (!scenario) {
    console.warn('No scenario provided to apply');
    return;
  }

  try {
    // 모든 플레이어 상태 초기화
    for (let i = 0; i < 6; i++) {
      if (window.updatePlayerState) {
        window.updatePlayerState(i, null);
      }
    }

    // 플레이어 포지션 업데이트 (먼저 포지션 설정)
    updatePlayerPositions(scenario.situation.positions);

    // 플레이어 스택 업데이트
    updatePlayerStacks(scenario.situation.remainingStacks || scenario.situation.stacks);

    // 플레이어 베팅 업데이트 (새로운 구조) - 포지션 설정 후에
    if (scenario.situation.playerBets) {
      updatePlayerBets(scenario.situation.playerBets);
    }

    // 현재 플레이어 설정 (HERO 포지션)
    setCurrentPlayer(scenario.situation.heroPosition);

    // 플레이어 홀카드 표시
    displayPlayerCards(scenario.situation.heroCards);

    // 팟 사이즈 업데이트 (안테만 표시)
    updatePotSize(scenario.situation.pot || scenario.situation.potSize || 0);

    // 액션 히스토리 표시
    displayActionHistory(scenario.situation.actions || []);

    // 딜러 버튼 위치 설정 (HERO 고정 좌석에 맞춰)
    if (scenario.situation.dealerPosition) {
      const { positions } = scenario.situation;
      const heroPosition = positions.find((pos) => pos.includes('HERO'));
      if (heroPosition) {
        const heroActualPosition = heroPosition.split('(')[1].split(')')[0];
        const allPositions = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];
        const heroIndex = allPositions.indexOf(heroActualPosition);
        const seatMapping = calculateSeatMapping(positions, heroIndex);

        // 딜러 포지션에 해당하는 좌석 찾기
        let dealerSeatIndex = -1;
        if (scenario.situation.dealerPosition === 'HERO') {
          dealerSeatIndex = 3; // HERO는 항상 3번 좌석
        } else {
          dealerSeatIndex = Object.keys(seatMapping).find((index) => {
            const mapping = seatMapping[index];
            return mapping.displayPosition === scenario.situation.dealerPosition;
          });
        }

        if (dealerSeatIndex !== undefined && dealerSeatIndex !== -1) {
          window.updateDealerButton(parseInt(dealerSeatIndex, 10));
        }
      }
    }

    // 시나리오 정보 패널 업데이트
    updateScenarioInfoPanel(scenario);

    if (config.debug) {
      console.info(`Applied scenario to table: ${scenario.title}`);
    }
  } catch (error) {
    console.error('Error applying scenario to table:', error);
  }
}

/**
 * 플레이어 베팅 업데이트 (새로운 구조)
 */
function updatePlayerBets(playerBets) {
  if (!currentScenario || !playerBets) {
    return;
  }

  const { positions } = currentScenario.situation;
  const heroPosition = positions.find((pos) => pos.includes('HERO'));
  if (!heroPosition) {
    return;
  }

  // HERO의 실제 포지션 추출
  const heroActualPosition = heroPosition.split('(')[1].split(')')[0];
  const allPositions = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];
  const heroIndex = allPositions.indexOf(heroActualPosition);

  // 좌석 매핑 계산
  const seatMapping = calculateSeatMapping(positions, heroIndex);

  // 블라인드 레벨 가져오기
  const bigBlind = currentScenario.situation.blindLevel?.big || 100;

  // 각 좌석에 베팅 적용
  Object.entries(playerBets).forEach(([betPosition, betAmount]) => {
    // 좌석 매핑에서 해당 포지션의 좌석 인덱스 찾기
    const seatIndex = Object.keys(seatMapping).find((index) => {
      const mapping = seatMapping[index];
      if (betPosition === 'HERO') {
        return mapping.isHero;
      }
      return mapping.displayPosition === betPosition;
    });

    if (seatIndex !== undefined) {
      const seatNum = parseInt(seatIndex, 10);
      const playerCard = document.querySelector(`[data-player-index="${seatNum}"]`);

      if (playerCard) {
        const betElement = playerCard.querySelector('.player-bet');

        if (betAmount > 0 && betElement) {
          // 베팅이 있으면 표시
          const betDisplayElement = betElement.querySelector('.bet-display');

          if (betDisplayElement) {
            const bbAmount = (betAmount / bigBlind).toFixed(1);
            betDisplayElement.textContent = `${bbAmount} BB`;
          }

          betElement.style.display = 'block';
        } else if (betElement) {
          // 베팅이 없으면 숨김
          betElement.style.display = 'none';
        }
      }
    }
  });

  if (config.debug) {
    console.info('Player bets updated:', playerBets);
  }
}

/**
 * 플레이어 스택 업데이트 (HERO 고정 좌석에 맞춰 업데이트)
 */
function updatePlayerStacks(stacks) {
  if (!currentScenario) {
    return;
  }

  const { positions } = currentScenario.situation;
  const heroPosition = positions.find((pos) => pos.includes('HERO'));
  if (!heroPosition) {
    return;
  }

  // HERO의 실제 포지션 추출
  const heroActualPosition = heroPosition.split('(')[1].split(')')[0];
  const allPositions = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];
  const heroIndex = allPositions.indexOf(heroActualPosition);

  // 좌석 매핑 계산
  const seatMapping = calculateSeatMapping(positions, heroIndex);

  // 각 좌석에 스택 적용
  Object.entries(stacks).forEach(([stackPosition, chips]) => {
    // 좌석 매핑에서 해당 포지션의 좌석 인덱스 찾기
    const seatIndex = Object.keys(seatMapping).find((index) => {
      const mapping = seatMapping[index];
      if (stackPosition === 'HERO') {
        return mapping.isHero;
      }
      return mapping.displayPosition === stackPosition;
    });

    if (seatIndex !== undefined && window.updatePlayerChips) {
      const seatNum = parseInt(seatIndex, 10);
      window.updatePlayerChips(seatNum, chips);

      // 스택이 0인 플레이어는 eliminated 상태로 표시 (테이블에서 제외)
      if (chips === 0 && window.updatePlayerState) {
        window.updatePlayerState(seatNum, 'eliminated');
        // 스택이 0이면 해당 카드를 숨김 처리
        const playerCard = document.querySelector(`[data-player-index="${seatNum}"]`);
        if (playerCard) {
          playerCard.style.display = 'none';
        }
      }
    }
  });
}

/**
 * 플레이어 포지션 업데이트 (HERO를 4번 자리에 고정)
 */
function updatePlayerPositions(positions) {
  // HERO 포지션을 찾아서 4번 자리 고정을 위한 매핑 생성
  const heroPosition = positions.find((pos) => pos.includes('HERO'));
  if (!heroPosition) {
    return;
  }

  // HERO의 실제 포지션 추출 (예: HERO(BTN) -> BTN)
  const heroActualPosition = heroPosition.split('(')[1].split(')')[0];

  // 포지션 순서 (시계방향)
  const allPositions = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];
  const heroIndex = allPositions.indexOf(heroActualPosition);

  // HERO를 기준으로 상대적 포지션 계산하여 테이블 배치
  const seatMapping = calculateSeatMapping(positions, heroIndex);

  // 각 UI 자리에 플레이어 배치
  for (let seatIndex = 0; seatIndex < 6; seatIndex++) {
    const playerCard = document.querySelector(`[data-player-index="${seatIndex}"]`);
    const positionInfo = seatMapping[seatIndex];

    if (playerCard && positionInfo) {
      const positionElement = playerCard.querySelector('.player-position');
      const nameElement = playerCard.querySelector('.player-name');

      if (positionElement) {
        positionElement.textContent = positionInfo.displayPosition;
      }

      if (nameElement) {
        if (positionInfo.isHero) {
          nameElement.textContent = 'HERO';
          nameElement.className = 'player-name hero-player';
        } else if (positionInfo.isEmpty) {
          nameElement.textContent = 'Empty';
          nameElement.className = 'player-name empty-seat';
        } else {
          // 실제 플레이어는 포지션 이름으로 표시 (액션 히스토리가 나중에 덮어씀)
          nameElement.textContent = positionInfo.displayPosition;
          nameElement.className = 'player-name';
        }
      }

      playerCard.dataset.position = positionInfo.originalPosition;
    }
  }
}

/**
 * HERO를 기준으로 좌석 매핑 계산
 */
function calculateSeatMapping(positions, heroPositionIndex) {
  const allPositions = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];
  const seatMapping = {};

  // HERO는 항상 4번 자리(인덱스 3)에 고정
  const heroSeatIndex = 3;

  if (config.debug) {
    console.log('🗺️ calculateSeatMapping:', positions, 'heroIndex:', heroPositionIndex);
  }

  // 각 포지션을 상대적 위치에 배치 (스택 확인 포함)
  positions.forEach((position) => {
    let actualPosition,
      isHero = false;

    if (position.includes('HERO')) {
      actualPosition = position.split('(')[1].split(')')[0];
      isHero = true;
    } else {
      actualPosition = position;
    }

    // 스택 확인 (올인한 플레이어도 포함)
    const stackKey = isHero ? 'HERO' : actualPosition;
    const stacks =
      currentScenario?.situation?.remainingStacks || currentScenario?.situation?.stacks || {};
    const playerBets = currentScenario?.situation?.playerBets || {};
    const stack = stacks[stackKey] || 0;
    const bet = playerBets[stackKey] || 0;

    // 스택이 0이고 베팅도 없다면 완전히 제거된 플레이어
    if (stack === 0 && bet === 0) {
      return; // 스택도 베팅도 없으면 매핑하지 않음
    }

    const positionIndex = allPositions.indexOf(actualPosition);

    if (isHero) {
      // HERO는 4번 자리에 고정
      seatMapping[heroSeatIndex] = {
        originalPosition: position,
        displayPosition: actualPosition,
        isHero: true,
        isEmpty: false,
      };
    } else {
      // 다른 플레이어들은 HERO를 기준으로 상대적 위치 계산
      const relativeSeat = calculateRelativeSeat(positionIndex, heroPositionIndex, heroSeatIndex);

      if (relativeSeat !== -1 && relativeSeat >= 0 && relativeSeat < 6) {
        seatMapping[relativeSeat] = {
          originalPosition: position,
          displayPosition: actualPosition,
          isHero: false,
          isEmpty: false,
        };
      }
    }
  });

  // 빈 자리 숨김 처리 (스택이 0인 플레이어들)
  for (let i = 0; i < 6; i++) {
    if (!seatMapping[i]) {
      // 빈 자리는 숨김 처리
      const playerCard = document.querySelector(`[data-player-index="${i}"]`);
      if (playerCard) {
        playerCard.style.display = 'none';
      }
      seatMapping[i] = {
        originalPosition: '',
        displayPosition: '',
        isHero: false,
        isEmpty: true,
        isHidden: true,
      };
    } else {
      // 활성 플레이어는 표시
      const playerCard = document.querySelector(`[data-player-index="${i}"]`);
      if (playerCard) {
        playerCard.style.display = 'block';
      }
    }
  }

  return seatMapping;
}

/**
 * HERO를 기준으로 상대적 좌석 위치 계산
 */
function calculateRelativeSeat(positionIndex, heroPositionIndex, heroSeatIndex) {
  // 포지션 간 거리 계산 (시계방향)
  const distance = (positionIndex - heroPositionIndex + 6) % 6;

  // HERO 기준 상대적 좌석 계산
  const relativeSeat = (heroSeatIndex + distance) % 6;

  return relativeSeat;
}

/**
 * 현재 플레이어 설정 (HERO는 항상 4번 자리)
 */
function setCurrentPlayer(_heroPosition) {
  if (window.updatePlayerState) {
    // 모든 플레이어 비활성화
    for (let i = 0; i < 6; i++) {
      window.updatePlayerState(i, null);
    }
    // HERO 플레이어만 활성화 (4번 자리 고정)
    window.updatePlayerState(3, 'active');
  }
}

/**
 * 플레이어 홀카드 표시 (HERO는 항상 4번 자리에 고정)
 */
function displayPlayerCards(heroCards) {
  if (!currentScenario) {
    return;
  }

  // HERO는 항상 3번 인덱스(4번 자리)에 고정
  const heroSeatIndex = 3;
  const playerCard = document.querySelector(`[data-player-index="${heroSeatIndex}"]`);

  if (playerCard) {
    const cardsContainer = playerCard.querySelector('.player-cards');
    if (cardsContainer) {
      // heroCards가 "A5s" 형태의 문자열인 경우 파싱
      let cardDisplay = '';
      if (typeof heroCards === 'string') {
        cardDisplay = `<div class=\"hole-cards\"><div class=\"card\">${heroCards}</div></div>`;
      } else {
        // 기존 객체 형태 지원
        cardDisplay = `
          <div class=\"hole-cards\">
            <div class=\"card\">${heroCards.card1.rank}${getSuitSymbol(heroCards.card1.suit)}</div>
            <div class=\"card\">${heroCards.card2.rank}${getSuitSymbol(heroCards.card2.suit)}</div>
          </div>
        `;
      }
      cardsContainer.innerHTML = cardDisplay;
    }
  }
}

/**
 * 팟 사이즈 업데이트
 */
function updatePotSize(potSize) {
  const potElement = document.querySelector('.pot-amount');
  if (potElement) {
    potElement.textContent = potSize.toLocaleString();
  }
}

/**
 * 액션 히스토리 표시 (HERO 고정 좌석에 맞춰)
 */
function displayActionHistory(actions) {
  if (!currentScenario) {
    return;
  }

  const { positions } = currentScenario.situation;
  const heroPosition = positions.find((pos) => pos.includes('HERO'));
  if (!heroPosition) {
    return;
  }

  // HERO의 실제 포지션 추출
  const heroActualPosition = heroPosition.split('(')[1].split(')')[0];
  const allPositions = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];
  const heroIndex = allPositions.indexOf(heroActualPosition);

  // 좌석 매핑 계산
  const seatMapping = calculateSeatMapping(positions, heroIndex);

  // 모든 플레이어의 상태를 초기화하고 액션 표시
  Object.keys(seatMapping).forEach((seatIndex) => {
    const seatNum = parseInt(seatIndex, 10);
    const mapping = seatMapping[seatIndex];
    const playerCard = document.querySelector(`[data-player-index="${seatNum}"]`);

    if (playerCard) {
      // 기존 액션 표시 제거
      const existingAction = playerCard.querySelector('.player-action');
      if (existingAction) {
        existingAction.remove();
      }

      // 플레이어 이름 요소 찾기
      const playerNameElement = playerCard.querySelector('.player-name');

      // 빈 자리나 숨겨진 자리는 건너뛰기
      if (mapping.isEmpty || mapping.isHidden) {
        return;
      }

      // 해당 포지션의 액션 찾기 - 원본 포지션과 매칭
      const playerAction = actions.find((action) => {
        // HERO의 경우 특별 처리
        if (mapping.isHero) {
          return action.position === 'HERO' || action.position === heroActualPosition;
        }
        // 일반 플레이어는 displayPosition과 매칭
        return action.position === mapping.displayPosition;
      });

      if (playerAction) {
        // 액션한 플레이어
        const actionText = getActionText(playerAction.action);
        const actionClass = getActionClass(playerAction.action);

        // 플레이어 이름을 액션 상태로 변경
        if (playerNameElement) {
          // 액션은 HERO 구분 없이 동일하게 표시
          playerNameElement.textContent = actionText;
          playerNameElement.className = `player-name player-status ${actionClass}`;

          // HERO인 경우 별도 배지 추가
          if (mapping.isHero) {
            addHeroBadgeToCard(playerCard);
          }
        }

        // 폴드한 플레이어는 카드 전체를 폴드 상태로 설정
        if (playerAction.action.toLowerCase() === 'fold') {
          playerCard.classList.add('folded');
          if (window.updatePlayerState) {
            window.updatePlayerState(seatNum, 'folded');
          }
        } else if (playerAction.action.toLowerCase() === 'push') {
          // Push는 올인으로 처리
          playerCard.classList.add('all-in');
          if (window.updatePlayerState) {
            window.updatePlayerState(seatNum, 'all-in');
          }
        } else if (playerAction.action.toLowerCase() === 'raise') {
          playerCard.classList.add('aggressive');
        }
      } else {
        // 액션하지 않았지만 스택이 0인 경우 (이미 올인한 상태)
        const stackKey = mapping.isHero ? 'HERO' : mapping.displayPosition;
        const stacks =
          currentScenario?.situation?.remainingStacks || currentScenario?.situation?.stacks || {};
        const playerBets = currentScenario?.situation?.playerBets || {};
        const stack = stacks[stackKey] || 0;
        const bet = playerBets[stackKey] || 0;

        if (stack === 0 && bet > 0) {
          // 스택이 0이고 베팅이 있으면 올인 상태
          playerCard.classList.add('all-in');
          if (playerNameElement) {
            playerNameElement.textContent = 'ALL IN';
            playerNameElement.className = 'player-name player-status action-push';

            // HERO인 경우 별도 배지 추가
            if (mapping.isHero) {
              addHeroBadgeToCard(playerCard);
            }
          }
          if (window.updatePlayerState) {
            window.updatePlayerState(seatNum, 'all-in');
          }
        } else {
          // 아직 액션하지 않은 플레이어 (WAIT 상태)
          if (playerNameElement) {
            // WAIT는 HERO 구분 없이 동일하게 표시
            playerNameElement.textContent = 'WAIT';
            playerNameElement.className = 'player-name player-status action-wait';

            // HERO인 경우 별도 배지 추가
            if (mapping.isHero) {
              addHeroBadgeToCard(playerCard);
            }
          }

          // 플레이어 카드를 기본 상태로 복원 (all-in은 유지)
          playerCard.classList.remove('folded', 'aggressive');
        }
      }
    }
  });

  if (config.debug) {
    console.info('Player status display updated:', actions.length, 'actions');
  }
}

/**
 * HERO 배지를 플레이어 카드에 추가
 */
function addHeroBadgeToCard(playerCard) {
  // 기존 HERO 배지 제거
  const existingBadge = playerCard.querySelector('.hero-badge-separate');
  if (existingBadge) {
    existingBadge.remove();
  }

  // 새 HERO 배지 생성
  const heroBadge = document.createElement('div');
  heroBadge.className = 'hero-badge-separate';
  heroBadge.textContent = 'HERO';

  // 플레이어 카드에 추가
  playerCard.appendChild(heroBadge);
}

/**
 * 액션을 사용자 친화적 텍스트로 변환
 */
function getActionText(action) {
  const actionMap = {
    fold: 'FOLD',
    call: 'CALL',
    raise: 'RAISE',
    push: 'ALL-IN',
    check: 'CHECK',
  };
  return actionMap[action.toLowerCase()] || action.toUpperCase();
}

/**
 * 액션에 따른 CSS 클래스 반환
 */
function getActionClass(action) {
  const classMap = {
    fold: 'action-fold',
    call: 'action-call',
    raise: 'action-raise',
    push: 'action-push',
    check: 'action-check',
  };
  return classMap[action.toLowerCase()] || 'action-default';
}

// getPlayerIndexByPosition function removed - not used

/**
 * 수트 심볼 반환
 */
function getSuitSymbol(suit) {
  const symbols = {
    h: '♥',
    d: '♦',
    c: '♣',
    s: '♠',
  };
  return symbols[suit] || suit;
}

/**
 * 시나리오 초기화 (앱 시작시 호출)
 */
export async function initializeScenarios() {
  try {
    await loadScenarios();

    // 첫 번째 시나리오를 기본으로 선택
    if (scenarios.length > 0) {
      selectScenario(0);
      applyScenarioToTable(currentScenario);
    }

    if (config.debug) {
      console.info('Scenarios initialized successfully');
    }

    return true;
  } catch (error) {
    console.error('Failed to initialize scenarios:', error);
    return false;
  }
}

/**
 * 시나리오 메타데이터 가져오기
 */
export function getScenarioMetadata() {
  return {
    total: scenarios.length,
    current: currentScenarioIndex + 1,
    currentId: currentScenario?.id,
    currentTitle: currentScenario?.title,
    currentDifficulty: currentScenario?.difficulty,
  };
}

/**
 * 시나리오 정보 패널 업데이트
 */
function updateScenarioInfoPanel(scenario) {
  try {
    const metadata = getScenarioMetadata();

    // 시나리오 제목
    const titleElement = document.getElementById('scenario-title');
    if (titleElement) {
      titleElement.textContent = scenario.title;
    }

    // 난이도 배지
    const difficultyElement = document.getElementById('scenario-difficulty');
    if (difficultyElement) {
      difficultyElement.textContent = scenario.difficulty.toUpperCase();
      difficultyElement.className = `difficulty-badge ${scenario.difficulty}`;
    }

    // 시나리오 번호
    const numberElement = document.getElementById('scenario-number');
    if (numberElement) {
      numberElement.textContent = `${metadata.current}/${metadata.total}`;
    }

    // 설명
    const descriptionElement = document.getElementById('scenario-description');
    if (descriptionElement) {
      descriptionElement.textContent = scenario.description;
    }

    // 포지션 (HERO(BTN) -> BTN)
    const positionElement = document.getElementById('scenario-position');
    if (positionElement) {
      positionElement.textContent = scenario.situation.heroPosition;
    }

    // 핸드 (A5s 형태로 표시)
    const handElement = document.getElementById('scenario-hand');
    if (handElement) {
      handElement.textContent = scenario.situation.heroCards;
    }

    // 스택 (HERO 스택 찾기 - 새로운 구조 지원)
    const stackElement = document.getElementById('scenario-stack');
    if (stackElement) {
      const heroStack = scenario.situation.remainingStacks?.HERO || scenario.situation.stacks?.HERO;
      const bigBlind = scenario.situation.blindLevel?.big || 50;
      const bbAmount = (heroStack / bigBlind).toFixed(1);
      stackElement.textContent = `${bbAmount} BB`;
    }

    // 액션 히스토리 텍스트 (actionToHero 정보 사용)
    const actionElement = document.getElementById('scenario-action');
    if (actionElement) {
      const actionText = scenario.situation.actionToHero || 'First to act';
      actionElement.textContent = actionText;
    }

    if (config.debug) {
      console.info('Scenario info panel updated');
    }
  } catch (error) {
    console.error('Error updating scenario info panel:', error);
  }
}

/**
 * ICM 계산용 총 팟 사이즈 가져오기
 */
export function getTotalPotForCalculation() {
  if (!currentScenario) {
    return 0;
  }

  // 새로운 구조에서는 totalPotForCalculation 사용
  if (currentScenario.situation.totalPotForCalculation !== undefined) {
    return currentScenario.situation.totalPotForCalculation;
  }

  // 기존 구조 fallback
  if (currentScenario.situation.potSize !== undefined) {
    return currentScenario.situation.potSize;
  }

  // 수동 계산
  const pot = currentScenario.situation.pot || 0;
  const playerBets = currentScenario.situation.playerBets || {};
  const totalBets = Object.values(playerBets).reduce((sum, bet) => sum + bet, 0);

  return pot + totalBets;
}

/**
 * UI 표시용 팟 사이즈 가져오기 (안테만)
 */
export function getPotForDisplay() {
  if (!currentScenario) {
    return 0;
  }

  // 새로운 구조에서는 pot 사용 (안테만)
  if (currentScenario.situation.pot !== undefined) {
    return currentScenario.situation.pot;
  }

  // 기존 구조 fallback
  return currentScenario.situation.potSize || 0;
}

/**
 * 퀴즈 답안 평가
 */
export function evaluateQuizAnswer(userAnswer) {
  if (!currentScenario) {
    return {
      isCorrect: false,
      error: 'No scenario loaded',
    };
  }

  const { correctAnswer } = currentScenario;
  const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();

  const result = {
    isCorrect,
    userAnswer,
    correctAnswer,
    scenario: currentScenario,
    explanation: currentScenario.explanation,
    icmAnalysis: currentScenario.icmAnalysis,
    handRange: currentScenario.handRange,
  };

  if (config.debug) {
    console.info('Quiz evaluation:', result);
  }

  return result;
}

/**
 * EV 차이 계산
 */
export function calculateEVDifference(userAnswer) {
  if (!currentScenario?.icmAnalysis) {
    return 0;
  }

  const { pushEV, foldEV } = currentScenario.icmAnalysis;

  if (userAnswer.toLowerCase() === 'push') {
    return pushEV - foldEV;
  }
  return foldEV - pushEV;
}

/**
 * 퀴즈 통계 업데이트
 */
export function updateQuizStats(isCorrect) {
  const stats = getQuizStats();

  stats.totalQuestions++;
  if (isCorrect) {
    stats.correctAnswers++;
    stats.currentStreak++;
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }
  } else {
    stats.currentStreak = 0;
  }

  // 포지션별 통계
  const position = currentScenario?.situation?.yourPosition;
  if (position) {
    if (!stats.byPosition[position]) {
      stats.byPosition[position] = { total: 0, correct: 0 };
    }
    stats.byPosition[position].total++;
    if (isCorrect) {
      stats.byPosition[position].correct++;
    }
  }

  // 난이도별 통계
  const difficulty = currentScenario?.difficulty;
  if (difficulty) {
    if (!stats.byDifficulty[difficulty]) {
      stats.byDifficulty[difficulty] = { total: 0, correct: 0 };
    }
    stats.byDifficulty[difficulty].total++;
    if (isCorrect) {
      stats.byDifficulty[difficulty].correct++;
    }
  }

  stats.accuracyRate = (stats.correctAnswers / stats.totalQuestions) * 100;
  stats.lastUpdated = Date.now();

  // localStorage에 저장
  saveQuizStats(stats);

  return stats;
}

/**
 * 퀴즈 통계 가져오기
 */
export function getQuizStats() {
  const defaultStats = {
    totalQuestions: 0,
    correctAnswers: 0,
    accuracyRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    byPosition: {},
    byDifficulty: {},
    lastUpdated: Date.now(),
  };

  try {
    const stored = localStorage.getItem('icm-quiz-stats');
    return stored ? { ...defaultStats, ...JSON.parse(stored) } : defaultStats;
  } catch (error) {
    console.warn('Error loading quiz stats:', error);
    return defaultStats;
  }
}

/**
 * 퀴즈 통계 저장
 */
function saveQuizStats(stats) {
  try {
    localStorage.setItem('icm-quiz-stats', JSON.stringify(stats));
  } catch (error) {
    console.warn('Error saving quiz stats:', error);
  }
}

/**
 * 퀴즈 통계 초기화
 */
export function resetQuizStats() {
  try {
    localStorage.removeItem('icm-quiz-stats');
    if (config.debug) {
      console.info('Quiz stats reset');
    }
  } catch (error) {
    console.warn('Error resetting quiz stats:', error);
  }
}

// 전역 객체에 함수 노출 (디버깅용)
if (config.debug) {
  window.ScenarioManager = {
    loadScenarios,
    getCurrentScenario,
    selectScenario,
    selectNextScenario,
    selectRandomScenario,
    applyScenarioToTable,
    getScenarioMetadata,
    evaluateQuizAnswer,
    calculateEVDifference,
    getQuizStats,
    resetQuizStats,
  };
}
